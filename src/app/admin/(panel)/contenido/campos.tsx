"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Piezas reutilizables del editor de contenido.

const BASE_INPUT =
  "w-full rounded-lg border border-linea bg-ink-900 px-3 py-2 text-sm text-bone-50 placeholder:text-bone-500 transition-colors focus:border-brand-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/25";

interface CampoTextoProps {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multilinea?: boolean;
  filas?: number;
  max?: number;
  ayuda?: string;
}

export function CampoTexto({
  etiqueta,
  valor,
  onChange,
  placeholder,
  multilinea,
  filas = 3,
  max,
  ayuda,
}: CampoTextoProps) {
  const excedido = max !== undefined && valor.length > max;

  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-bone-300">{etiqueta}</span>
        {max !== undefined && (
          <span
            className={cn(
              "text-[10px] tabular-nums",
              excedido ? "text-red-400" : "text-bone-500",
            )}
          >
            {valor.length}/{max}
          </span>
        )}
      </span>

      {multilinea ? (
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          rows={filas}
          placeholder={placeholder}
          className={cn(BASE_INPUT, "resize-y", excedido && "border-red-500/50")}
        />
      ) : (
        <input
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(BASE_INPUT, excedido && "border-red-500/50")}
        />
      )}

      {ayuda && <span className="mt-1 block text-[11px] text-bone-500">{ayuda}</span>}
    </label>
  );
}

export function CampoNumero({
  etiqueta,
  valor,
  onChange,
  min = 0,
  max,
}: {
  etiqueta: string;
  valor: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bone-300">{etiqueta}</span>
      <input
        type="number"
        value={Number.isFinite(valor) ? valor : 0}
        min={min}
        max={max}
        onChange={(e) => {
          // Un input number vacio devuelve "", que se vuelve NaN y rompe zod.
          const n = e.target.valueAsNumber;
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className={cn(BASE_INPUT, "tabular-nums")}
      />
    </label>
  );
}

export function CampoSelect<T extends string>({
  etiqueta,
  valor,
  onChange,
  opciones,
}: {
  etiqueta: string;
  valor: T;
  onChange: (v: T) => void;
  opciones: { valor: T; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bone-300">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(BASE_INPUT, "appearance-none")}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor} className="bg-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CampoBool({
  etiqueta,
  valor,
  onChange,
  ayuda,
}: {
  etiqueta: string;
  valor: boolean;
  onChange: (v: boolean) => void;
  ayuda?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-linea bg-ink-900/60 px-3 py-2.5 transition-colors hover:border-linea-media">
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        onClick={() => onChange(!valor)}
        className={cn(
          "mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
          valor ? "bg-brand-500" : "bg-ink-600",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className={cn(
            "block h-4 w-4 rounded-full bg-white shadow",
            valor && "ml-auto",
          )}
        />
      </button>
      <span>
        <span className="block text-xs font-medium text-bone-200">{etiqueta}</span>
        {ayuda && <span className="mt-0.5 block text-[11px] text-bone-500">{ayuda}</span>}
      </span>
    </label>
  );
}

export function Panel({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="borde-degradado relative rounded-2xl bg-ink-850/60 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-bone-50">{titulo}</h2>
        {descripcion && (
          <p className="mt-1 text-xs leading-relaxed text-bone-500">{descripcion}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface ListaEditableProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, index: number, actualizar: (v: T) => void) => ReactNode;
  nuevo: () => T;
  etiquetaNuevo: string;
  /** Titulo mostrado en la cabecera de cada elemento. */
  titulo: (item: T, index: number) => string;
  min?: number;
  max?: number;
}

/**
 * Lista de elementos con anadir, borrar y reordenar.
 *
 * Los limites min/max no son decorativos: el esquema de zod exige, por ejemplo,
 * entre 1 y 8 servicios. Si dejaramos borrar el ultimo, el guardado fallaria
 * con un error confuso en vez de impedirlo aqui.
 */
export function ListaEditable<T>({
  items,
  onChange,
  render,
  nuevo,
  etiquetaNuevo,
  titulo,
  min = 1,
  max = 10,
}: ListaEditableProps<T>) {
  function actualizarEn(i: number, valor: T) {
    const copia = [...items];
    copia[i] = valor;
    onChange(copia);
  }

  function borrar(i: number) {
    if (items.length <= min) return;
    onChange(items.filter((_, j) => j !== i));
  }

  function mover(i: number, delta: number) {
    const destino = i + delta;
    if (destino < 0 || destino >= items.length) return;
    const copia = [...items];
    [copia[i], copia[destino]] = [copia[destino], copia[i]];
    onChange(copia);
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-xl border border-linea bg-ink-900/50"
          >
            <div className="flex items-center justify-between gap-2 border-b border-linea px-3 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <GripVertical aria-hidden className="h-3.5 w-3.5 shrink-0 text-bone-500" />
                <span className="truncate text-xs font-medium text-bone-300">
                  {titulo(item, i)}
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-bone-500 transition-colors hover:text-bone-100 disabled:opacity-25 disabled:hover:text-bone-500"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="Bajar"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-bone-500 transition-colors hover:text-bone-100 disabled:opacity-25 disabled:hover:text-bone-500"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => borrar(i)}
                  disabled={items.length <= min}
                  aria-label="Borrar"
                  title={
                    items.length <= min
                      ? `Debe quedar al menos ${min}`
                      : "Borrar"
                  }
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-bone-500 transition-colors hover:text-red-400 disabled:opacity-25 disabled:hover:text-bone-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            </div>

            <div className="space-y-3 p-3">
              {render(item, i, (v) => actualizarEn(i, v))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => onChange([...items, nuevo()])}
        disabled={items.length >= max}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-linea py-2.5 text-xs font-medium text-bone-400 transition-colors hover:border-brand-500/40 hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-linea disabled:hover:text-bone-400"
      >
        <Plus className="h-3.5 w-3.5" />
        {items.length >= max ? `Máximo ${max}` : etiquetaNuevo}
      </button>
    </div>
  );
}
