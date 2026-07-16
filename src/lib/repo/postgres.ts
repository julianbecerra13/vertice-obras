import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc, eq, sql } from "drizzle-orm";
import { leads, siteContent, SITE_CONTENT_ROW_ID } from "@/db/schema";
import { DEFAULT_CONTENT, siteContentSchema, type SiteContent } from "@/lib/content";
import type { Lead, LeadEstado, LeadInput, LeadStats } from "@/lib/leads";
import { isLeadEstado } from "@/lib/leads";
import type { Repo } from "./index";

// Implementacion sobre Neon Postgres. Se activa sola cuando existe DATABASE_URL.

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - n);
  return d;
}

// La columna estado es text: si alguien la edita a mano en la base y mete un
// valor raro, lo tratamos como "nuevo" en vez de romper la tabla del admin.
function toLead(row: typeof leads.$inferSelect): Lead {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    email: row.email,
    servicio: row.servicio,
    mensaje: row.mensaje,
    estado: isLeadEstado(row.estado) ? row.estado : "nuevo",
    createdAt: row.createdAt,
  };
}

export function createPostgresRepo(url: string): Repo {
  const db = drizzle(neon(url), { schema: { siteContent, leads } });

  return {
    nombre: "postgres",

    async getContent(): Promise<SiteContent> {
      const rows = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.id, SITE_CONTENT_ROW_ID))
        .limit(1);

      if (rows.length === 0) return DEFAULT_CONTENT;

      // Si el JSON guardado no cumple el contrato (por una edicion manual o un
      // cambio de esquema), servimos el contenido por defecto en vez de tumbar
      // la pagina publica.
      const parsed = siteContentSchema.safeParse(rows[0].data);
      if (!parsed.success) {
        console.error(
          "[repo/postgres] El contenido guardado no cumple el esquema, uso el contenido por defecto.",
          parsed.error.issues.slice(0, 3),
        );
        return DEFAULT_CONTENT;
      }
      return parsed.data;
    },

    async saveContent(content: SiteContent): Promise<void> {
      await db
        .insert(siteContent)
        .values({
          id: SITE_CONTENT_ROW_ID,
          data: content,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteContent.id,
          set: { data: content, updatedAt: new Date() },
        });
    },

    async listLeads(): Promise<Lead[]> {
      const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
      return rows.map(toLead);
    },

    async createLead(input: LeadInput): Promise<Lead> {
      const [row] = await db
        .insert(leads)
        .values({
          nombre: input.nombre,
          telefono: input.telefono,
          email: input.email,
          servicio: input.servicio,
          mensaje: input.mensaje,
          estado: "nuevo",
        })
        .returning();
      return toLead(row);
    },

    async updateLeadEstado(id: number, estado: LeadEstado): Promise<boolean> {
      const rows = await db
        .update(leads)
        .set({ estado })
        .where(eq(leads.id, id))
        .returning({ id: leads.id });
      return rows.length > 0;
    },

    async deleteLead(id: number): Promise<boolean> {
      const rows = await db
        .delete(leads)
        .where(eq(leads.id, id))
        .returning({ id: leads.id });
      return rows.length > 0;
    },

    async getLeadStats(): Promise<LeadStats> {
      const [row] = await db
        .select({
          total: sql<number>`count(*)::int`,
          nuevos: sql<number>`count(*) filter (where ${leads.estado} = 'nuevo')::int`,
          hoy: sql<number>`count(*) filter (where ${leads.createdAt} >= ${startOfToday()})::int`,
          semana: sql<number>`count(*) filter (where ${leads.createdAt} >= ${daysAgo(7)})::int`,
        })
        .from(leads);

      return {
        total: row?.total ?? 0,
        nuevos: row?.nuevos ?? 0,
        hoy: row?.hoy ?? 0,
        semana: row?.semana ?? 0,
      };
    },
  };
}
