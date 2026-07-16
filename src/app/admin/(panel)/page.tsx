import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  Database,
  HardDrive,
  Inbox,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { LEAD_ESTADO_LABEL } from "@/lib/leads";
import { getRepo } from "@/lib/repo";
import { formatearFecha } from "@/lib/utils";

export const metadata: Metadata = { title: "Resumen" };

const COLOR_ESTADO: Record<string, string> = {
  nuevo: "bg-brand-500/12 text-brand-300 border-brand-500/25",
  contactado: "bg-sky-500/12 text-sky-300 border-sky-500/25",
  cerrado: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
};

function Tarjeta({
  icono: Icono,
  valor,
  label,
  destacado,
}: {
  icono: typeof Inbox;
  valor: number;
  label: string;
  destacado?: boolean;
}) {
  return (
    <div className="borde-degradado relative rounded-2xl bg-ink-850/60 p-5">
      <span
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
          destacado ? "bg-brand-500/15 text-brand-400" : "bg-velo text-bone-400"
        }`}
      >
        <Icono className="h-4 w-4" />
      </span>
      <p className="text-3xl font-semibold tabular-nums text-bone-50">{valor}</p>
      <p className="mt-1 text-xs tracking-wide text-bone-500 uppercase">{label}</p>
    </div>
  );
}

export default async function PanelInicio() {
  const repo = await getRepo();
  const [stats, leads] = await Promise.all([repo.getLeadStats(), repo.listLeads()]);
  const ultimos = leads.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-bone-50">Resumen</h1>
        <p className="mt-1 text-sm text-bone-500">
          Cómo va llegando la gente por el formulario del sitio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Tarjeta icono={Sparkles} valor={stats.nuevos} label="Sin contactar" destacado />
        <Tarjeta icono={CalendarDays} valor={stats.hoy} label="Hoy" />
        <Tarjeta icono={TrendingUp} valor={stats.semana} label="Últimos 7 días" />
        <Tarjeta icono={Inbox} valor={stats.total} label="Total histórico" />
      </div>

      {/* Ultimas solicitudes */}
      <section className="borde-degradado relative overflow-hidden rounded-2xl bg-ink-850/60">
        <div className="flex items-center justify-between gap-4 border-b border-linea px-5 py-4">
          <h2 className="text-sm font-semibold text-bone-50">Últimas solicitudes</h2>
          <Link
            href="/admin/leads"
            className="group inline-flex items-center gap-1.5 text-xs text-bone-400 transition-colors hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            Ver todas
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {ultimos.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-velo text-bone-500">
              <Inbox className="h-5 w-5" />
            </span>
            <p className="text-sm text-bone-400">Todavía no hay solicitudes.</p>
            <p className="mt-1 max-w-xs text-xs text-bone-500">
              Cuando alguien llene el formulario de contacto del sitio, aparecerá aquí.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-linea">
            {ultimos.map((lead) => (
              <li
                key={lead.id}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-velo-sutil"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-bone-50">{lead.nombre}</p>
                  <p className="mt-0.5 truncate text-xs text-bone-500">
                    {lead.servicio} · {lead.telefono}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                      COLOR_ESTADO[lead.estado] ?? COLOR_ESTADO.nuevo
                    }`}
                  >
                    {LEAD_ESTADO_LABEL[lead.estado]}
                  </span>
                  <span className="text-[10px] text-bone-500">
                    {formatearFecha(lead.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Estado del almacenamiento: en la demo importa saber si los datos
          sobreviven o no a un despliegue. */}
      <section className="flex items-start gap-3 rounded-2xl border border-linea bg-ink-900/60 px-5 py-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-velo text-bone-400">
          {repo.nombre === "postgres" ? (
            <Database className="h-4 w-4" />
          ) : (
            <HardDrive className="h-4 w-4" />
          )}
        </span>
        <div>
          <p className="text-xs font-medium text-bone-200">
            Almacenamiento: {repo.nombre === "postgres" ? "Base de datos Postgres" : "Archivo local"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-bone-500">
            {repo.nombre === "postgres"
              ? "Los datos se guardan de forma permanente y se ven desde cualquier dispositivo."
              : "Modo desarrollo: los datos viven en .data/store.json de este computador. Al publicar en Vercel hay que conectar una base Neon para que no se pierdan."}
          </p>
        </div>
      </section>
    </div>
  );
}
