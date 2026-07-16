import "server-only";
import type { SiteContent } from "@/lib/content";
import type { Lead, LeadEstado, LeadInput, LeadStats } from "@/lib/leads";

// Capa de datos con dos implementaciones intercambiables:
//
//   - postgres.ts -> se usa cuando hay DATABASE_URL (produccion en Vercel).
//   - file.ts     -> se usa cuando NO hay DATABASE_URL (desarrollo local).
//
// El resto de la app solo llama a getRepo() y no sabe cual esta activa.
// En Vercel el sistema de archivos es efimero, por eso alli SIEMPRE debe
// existir DATABASE_URL; si falta, los leads se perderian en cada despliegue.

export interface Repo {
  readonly nombre: "postgres" | "archivo local";
  getContent(): Promise<SiteContent>;
  saveContent(content: SiteContent): Promise<void>;
  listLeads(): Promise<Lead[]>;
  createLead(input: LeadInput): Promise<Lead>;
  updateLeadEstado(id: number, estado: LeadEstado): Promise<boolean>;
  deleteLead(id: number): Promise<boolean>;
  getLeadStats(): Promise<LeadStats>;
}

let cached: Repo | null = null;

export async function getRepo(): Promise<Repo> {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (url) {
    const { createPostgresRepo } = await import("./postgres");
    cached = createPostgresRepo(url);
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[repo] Sin DATABASE_URL en produccion: los leads NO se guardaran de forma permanente. " +
          "Conecte una base Neon desde el Marketplace de Vercel.",
      );
    }
    const { createFileRepo } = await import("./file");
    cached = createFileRepo();
  }

  return cached;
}
