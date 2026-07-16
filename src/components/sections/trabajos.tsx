"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { Reveal, RevealTexto } from "@/components/motion/reveal";
import type { SectionHeader, Work } from "@/lib/content";
import { cn } from "@/lib/utils";

const SALIDA = [0.16, 1, 0.3, 1] as const;

// Las imagenes son SVG locales. next/image las sirve tal cual: con el loader
// por defecto activa `unoptimized` solo cuando el src termina en .svg, asi que
// no hace falta dangerouslyAllowSVG ni ninguna otra config.
const TAMANOS = "(min-width: 1280px) 1024px, 100vw";

function Etiqueta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "absolute top-4 rounded-full border border-linea-media bg-ink-950/55 px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-bone-200 uppercase backdrop-blur-md",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Comparador({ trabajo }: { trabajo: Work }) {
  const [posicion, setPosicion] = useState(50);
  const [tocado, setTocado] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  const moverA = useCallback((clientX: number) => {
    const caja = contenedor.current?.getBoundingClientRect();
    if (!caja || caja.width === 0) return;
    const porcentaje = ((clientX - caja.left) / caja.width) * 100;
    setPosicion(Math.min(100, Math.max(0, porcentaje)));
  }, []);

  function alBajar(e: PointerEvent<HTMLDivElement>) {
    arrastrando.current = true;
    setTocado(true);
    // El capture manda todos los eventos al contenedor aunque el dedo se salga
    // de la imagen; sin esto el arrastre se corta al llegar al borde.
    e.currentTarget.setPointerCapture(e.pointerId);
    moverA(e.clientX);
  }

  function alMover(e: PointerEvent<HTMLDivElement>) {
    if (arrastrando.current) moverA(e.clientX);
  }

  function alSoltar(e: PointerEvent<HTMLDivElement>) {
    arrastrando.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function alTeclado(e: KeyboardEvent<HTMLDivElement>) {
    const paso = e.shiftKey ? 10 : 2;
    let siguiente: number | null = null;

    if (e.key === "ArrowLeft") siguiente = posicion - paso;
    else if (e.key === "ArrowRight") siguiente = posicion + paso;
    else if (e.key === "Home") siguiente = 0;
    else if (e.key === "End") siguiente = 100;
    if (siguiente === null) return;

    e.preventDefault();
    setTocado(true);
    setPosicion(Math.min(100, Math.max(0, siguiente)));
  }

  const valor = Math.round(posicion);

  return (
    <div
      ref={contenedor}
      onPointerDown={alBajar}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      onPointerCancel={alSoltar}
      // pan-y deja el desplazamiento vertical al navegador y nos reserva el
      // gesto horizontal. Con touch-action:none la pagina se bloquea en movil
      // en cuanto el dedo toca la imagen.
      style={{ touchAction: "pan-y" }}
      className="relative aspect-3/2 w-full cursor-ew-resize overflow-hidden rounded-2xl border border-linea bg-ink-900 select-none"
    >
      <Image
        src={trabajo.imagenDespues}
        alt={`${trabajo.titulo}: resultado después de la intervención`}
        fill
        sizes={TAMANOS}
        draggable={false}
        className="pointer-events-none object-cover"
      />
      <Etiqueta className="right-4">Después</Etiqueta>

      {/* La capa "antes" se recorta por la derecha hasta el divisor. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - posicion}% 0 0)` }}
      >
        <Image
          src={trabajo.imagenAntes}
          alt={`${trabajo.titulo}: estado antes de la intervención`}
          fill
          sizes={TAMANOS}
          draggable={false}
          className="pointer-events-none object-cover"
        />
        <Etiqueta className="left-4">Antes</Etiqueta>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/75"
        style={{ left: `${posicion}%` }}
      >
        <div className="absolute inset-y-0 -left-1 w-2.5 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div
          role="slider"
          tabIndex={0}
          aria-label={`Comparar antes y después: ${trabajo.titulo}`}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={valor}
          aria-valuetext={`${valor}% del estado anterior visible`}
          onKeyDown={alTeclado}
          className="sombra-marca pointer-events-auto absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-ink-950 transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-95"
        >
          <ChevronLeft className="-mr-1 h-4 w-4" aria-hidden />
          <ChevronRight className="-ml-1 h-4 w-4" aria-hidden />
        </div>
      </div>

      <AnimatePresence>
        {!tocado && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: SALIDA }}
            className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-2 rounded-full border border-linea-media bg-ink-950/60 px-3.5 py-1.5 text-[11px] font-medium text-bone-200 backdrop-blur-md"
          >
            <MoveHorizontal className="h-3.5 w-3.5 text-brand-400" />
            Deslice para comparar
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Trabajos({
  header,
  trabajos,
}: {
  header: SectionHeader;
  trabajos: Work[];
}) {
  const [indice, setIndice] = useState(0);
  const reducir = useReducedMotion();

  const activo = trabajos[indice];
  if (!activo) return null;

  return (
    <section id="trabajos" className="textura-grano relative bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <span className="text-xs font-medium tracking-[0.2em] text-brand-400 uppercase">
            {header.eyebrow}
          </span>
        </Reveal>

        <RevealTexto
          as="h2"
          texto={header.titulo}
          delay={0.08}
          className="mt-4 text-4xl font-semibold tracking-tight text-bone-50 sm:text-5xl"
        />

        <Reveal delay={0.16}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bone-400 [text-wrap:pretty]">
            {header.subtitulo}
          </p>
        </Reveal>

        {trabajos.length > 1 && (
          <Reveal delay={0.2} className="mt-10">
            {/* Botones con aria-pressed en vez del patron ARIA de pestañas: el
                panel no es un tabpanel navegable con flechas y prometer ese rol
                sin implementarlo completo confunde al lector de pantalla. */}
            <div className="flex flex-wrap gap-2">
              {trabajos.map((trabajo, i) => (
                <button
                  key={trabajo.titulo}
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-pressed={i === indice}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                    i === indice
                      ? "border-brand-500/50 bg-brand-500/12 text-brand-400"
                      : "border-linea bg-velo text-bone-400 hover:border-linea-fuerte hover:text-bone-200",
                  )}
                >
                  {trabajo.titulo}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.24} className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={indice}
              initial={reducir ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducir ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={{ duration: reducir ? 0.15 : 0.42, ease: SALIDA }}
            >
              <Comparador trabajo={activo} />

              <div className="mt-6 max-w-2xl">
                <h3 className="text-lg font-medium text-bone-50">{activo.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-bone-400">
                  {activo.descripcion}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
