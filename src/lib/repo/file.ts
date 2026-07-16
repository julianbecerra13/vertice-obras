import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_CONTENT, siteContentSchema, type SiteContent } from "@/lib/content";
import type { Lead, LeadEstado, LeadInput, LeadStats } from "@/lib/leads";
import { isLeadEstado } from "@/lib/leads";
import type { Repo } from "./index";

// Implementacion de desarrollo: guarda todo en .data/store.json.
// Sirve para trabajar en local sin montar una base de datos.
// NO usar en produccion: en Vercel el disco es efimero y se borra en cada
// despliegue. Por eso index.ts solo cae aqui cuando no hay DATABASE_URL.

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface StoredLead {
  id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  servicio: string;
  mensaje: string | null;
  estado: string;
  createdAt: string;
}

interface Store {
  content: unknown | null;
  leads: StoredLead[];
  nextLeadId: number;
}

const EMPTY_STORE: Store = { content: null, leads: [], nextLeadId: 1 };

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      content: parsed.content ?? null,
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
      nextLeadId: typeof parsed.nextLeadId === "number" ? parsed.nextLeadId : 1,
    };
  } catch (err) {
    // Primera ejecucion (archivo inexistente) o JSON corrupto: arrancamos vacio.
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[repo/file] store.json ilegible, arranco vacio:", err);
    }
    return { ...EMPTY_STORE };
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Escritura atomica: si el proceso muere a mitad, el store.json viejo
  // sigue intacto en vez de quedar truncado.
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, STORE_FILE);
}

// Serializa las escrituras en una sola cadena de promesas. Sin esto, dos
// requests simultaneos leerian el mismo estado y uno pisaria al otro.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: (store: Store) => Promise<T> | T): Promise<T> {
  const next = writeQueue.then(async () => {
    const store = await readStore();
    const result = await task(store);
    await writeStore(store);
    return result;
  });
  // La cola no se debe romper si una tarea falla.
  writeQueue = next.catch(() => undefined);
  return next;
}

function toLead(row: StoredLead): Lead {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    email: row.email,
    servicio: row.servicio,
    mensaje: row.mensaje,
    estado: isLeadEstado(row.estado) ? row.estado : "nuevo",
    // JSON no tiene tipo fecha: al leer vuelve como string y hay que revivirla.
    createdAt: new Date(row.createdAt),
  };
}

export function createFileRepo(): Repo {
  return {
    nombre: "archivo local",

    async getContent(): Promise<SiteContent> {
      const store = await readStore();
      if (!store.content) return DEFAULT_CONTENT;

      const parsed = siteContentSchema.safeParse(store.content);
      if (!parsed.success) {
        console.error(
          "[repo/file] El contenido guardado no cumple el esquema, uso el contenido por defecto.",
          parsed.error.issues.slice(0, 3),
        );
        return DEFAULT_CONTENT;
      }
      return parsed.data;
    },

    async saveContent(content: SiteContent): Promise<void> {
      await enqueue((store) => {
        store.content = content;
      });
    },

    async listLeads(): Promise<Lead[]> {
      const store = await readStore();
      return store.leads
        .map(toLead)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async createLead(input: LeadInput): Promise<Lead> {
      return enqueue((store) => {
        const row: StoredLead = {
          id: store.nextLeadId,
          nombre: input.nombre,
          telefono: input.telefono,
          email: input.email,
          servicio: input.servicio,
          mensaje: input.mensaje,
          estado: "nuevo",
          createdAt: new Date().toISOString(),
        };
        store.nextLeadId += 1;
        store.leads.push(row);
        return toLead(row);
      });
    },

    async updateLeadEstado(id: number, estado: LeadEstado): Promise<boolean> {
      return enqueue((store) => {
        const row = store.leads.find((l) => l.id === id);
        if (!row) return false;
        row.estado = estado;
        return true;
      });
    },

    async deleteLead(id: number): Promise<boolean> {
      return enqueue((store) => {
        const i = store.leads.findIndex((l) => l.id === id);
        if (i === -1) return false;
        store.leads.splice(i, 1);
        return true;
      });
    },

    async getLeadStats(): Promise<LeadStats> {
      const store = await readStore();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const semana = new Date(hoy);
      semana.setDate(semana.getDate() - 7);

      const rows = store.leads.map(toLead);
      return {
        total: rows.length,
        nuevos: rows.filter((l) => l.estado === "nuevo").length,
        hoy: rows.filter((l) => l.createdAt >= hoy).length,
        semana: rows.filter((l) => l.createdAt >= semana).length,
      };
    },
  };
}
