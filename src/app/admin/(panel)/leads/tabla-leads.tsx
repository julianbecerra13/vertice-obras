"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { borrarLead, cambiarEstadoLead } from "@/app/admin/acciones";
import { LEAD_ESTADO_LABEL, LEAD_ESTADOS, type Lead, type LeadEstado } from "@/lib/leads";
import { cn, enlaceWhatsapp, formatearFecha } from "@/lib/utils";

const COLOR_ESTADO: Record<LeadEstado, string> = {
  nuevo: "bg-brand-500/12 text-brand-300 border-brand-500/25",
  contactado: "bg-sky-500/12 text-sky-300 border-sky-500/25",
  cerrado: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
};

type Filtro = LeadEstado | "todos";

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: "todos", label: "Todas" },
  ...LEAD_ESTADOS.map((e) => ({ valor: e as Filtro, label: LEAD_ESTADO_LABEL[e] })),
];

function FilaLead({ lead }: { lead: Lead }) {
  const [abierto, setAbierto] = useState(false);
  const tieneDetalle = Boolean(lead.mensaje || lead.email);

  return (
    <li className="transition-colors hover:bg-velo-sutil">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
        {/* Datos */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-bone-50">{lead.nombre}</p>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                COLOR_ESTADO[lead.estado],
              )}
            >
              {LEAD_ESTADO_LABEL[lead.estado]}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-bone-500">
            {lead.servicio} · {formatearFecha(lead.createdAt)}
          </p>
        </div>

        {/* Contacto rapido */}
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={`tel:${lead.telefono.replace(/\s/g, "")}`}
            aria-label={`Llamar a ${lead.nombre}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-linea text-bone-400 transition-colors hover:border-linea-fuerte hover:text-bone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
          <a
            href={enlaceWhatsapp(
              lead.telefono,
              `Hola ${lead.nombre.split(" ")[0]}, le escribo de Vértice Obras por su solicitud de ${lead.servicio}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escribir por WhatsApp a ${lead.nombre}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-linea text-bone-400 transition-colors hover:border-brand-500/40 hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>

          {/* Cambiar estado: form nativo, funciona sin JS */}
          <form action={cambiarEstadoLead} className="relative">
            <input type="hidden" name="id" value={lead.id} />
            <select
              name="estado"
              defaultValue={lead.estado}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              aria-label={`Estado de ${lead.nombre}`}
              className="appearance-none rounded-lg border border-linea bg-ink-900 py-1.5 pr-7 pl-2.5 text-xs text-bone-200 transition-colors hover:border-linea-fuerte focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            >
              {LEAD_ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {LEAD_ESTADO_LABEL[e]}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-bone-500"
            />
            {/* Respaldo para navegadores sin JS */}
            <noscript>
              <button type="submit" className="ml-1 text-xs text-brand-400 underline">
                Guardar
              </button>
            </noscript>
          </form>

          {tieneDetalle && (
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-label={abierto ? "Ocultar detalle" : "Ver detalle"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-linea text-bone-400 transition-colors hover:border-linea-fuerte hover:text-bone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform duration-200", abierto && "rotate-180")}
              />
            </button>
          )}

          <form
            action={borrarLead}
            onSubmit={(e) => {
              if (!confirm(`¿Borrar la solicitud de ${lead.nombre}? No se puede deshacer.`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={lead.id} />
            <button
              type="submit"
              aria-label={`Borrar solicitud de ${lead.nombre}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-linea text-bone-500 transition-colors hover:border-red-500/40 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {abierto && tieneDetalle && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-linea bg-velo-sutil px-4 py-4 sm:px-5">
              {lead.email && (
                <p className="flex items-center gap-2 text-xs text-bone-400">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-bone-500" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="truncate transition-colors hover:text-brand-400"
                  >
                    {lead.email}
                  </a>
                </p>
              )}
              {lead.mensaje && (
                <p className="text-xs leading-relaxed whitespace-pre-wrap text-bone-300">
                  {lead.mensaje}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function TablaLeads({ leads }: { leads: Lead[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return leads.filter((l) => {
      if (filtro !== "todos" && l.estado !== filtro) return false;
      if (!q) return true;
      return (
        l.nombre.toLowerCase().includes(q) ||
        l.telefono.toLowerCase().includes(q) ||
        l.servicio.toLowerCase().includes(q) ||
        (l.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, filtro, busqueda]);

  const conteo = useMemo(() => {
    const base: Record<Filtro, number> = {
      todos: leads.length,
      nuevo: 0,
      contactado: 0,
      cerrado: 0,
    };
    for (const l of leads) base[l.estado] += 1;
    return base;
  }, [leads]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                filtro === f.valor ? "text-ink-950" : "text-bone-400 hover:text-bone-100",
              )}
            >
              {filtro === f.valor && (
                <motion.span
                  layoutId="filtro-activo"
                  className="absolute inset-0 rounded-full bg-brand-500"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {f.label} ({conteo[f.valor]})
              </span>
            </button>
          ))}
        </div>

        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono..."
          aria-label="Buscar solicitudes"
          className="w-full rounded-xl border border-linea bg-ink-900 px-3.5 py-2 text-xs text-bone-50 placeholder:text-bone-500 transition-colors focus:border-brand-500/60 focus:outline-none sm:w-64"
        />
      </div>

      <div className="borde-degradado relative overflow-hidden rounded-2xl bg-ink-850/60">
        {visibles.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-velo text-bone-500">
              <Inbox className="h-5 w-5" />
            </span>
            <p className="text-sm text-bone-400">
              {leads.length === 0
                ? "Todavía no hay solicitudes."
                : "Ninguna solicitud coincide con el filtro."}
            </p>
            {leads.length === 0 && (
              <p className="mt-1 max-w-xs text-xs text-bone-500">
                Cuando alguien llene el formulario del sitio, aparecerá aquí.
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-linea">
            {visibles.map((lead) => (
              <FilaLead key={lead.id} lead={lead} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
