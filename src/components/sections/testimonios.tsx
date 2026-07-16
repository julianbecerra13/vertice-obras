"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal, RevealTexto } from "@/components/motion/reveal";
import type { SectionHeader, Testimonial } from "@/lib/content";
import { cn } from "@/lib/utils";

// Difuminado de los bordes: las tarjetas se desvanecen en vez de cortarse en
// seco contra el fondo.
const MASCARA =
  "linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)";

function Tarjeta({ testimonio }: { testimonio: Testimonial }) {
  return (
    <figure className="borde-degradado relative flex w-[340px] shrink-0 flex-col rounded-2xl bg-ink-850/70 p-6 sm:w-[400px] sm:p-7">
      <Quote className="h-7 w-7 shrink-0 fill-brand-500/20 text-brand-500/30" aria-hidden />

      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-bone-200 [text-wrap:pretty]">
        {testimonio.texto}
      </blockquote>

      <div
        role="img"
        aria-label={`${testimonio.rating} de 5 estrellas`}
        className="mt-6 flex items-center gap-1"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden
            className={cn(
              "h-3.5 w-3.5",
              i < testimonio.rating
                ? "fill-brand-400 text-brand-400"
                : "fill-transparent text-ink-600",
            )}
          />
        ))}
      </div>

      <figcaption className="mt-4 border-t border-linea pt-4">
        <p className="font-medium text-bone-50">{testimonio.nombre}</p>
        <p className="mt-0.5 text-sm text-bone-500">{testimonio.ciudad}</p>
      </figcaption>
    </figure>
  );
}

export function Testimonios({
  header,
  testimonios,
}: {
  header: SectionHeader;
  testimonios: Testimonial[];
}) {
  const reducir = useReducedMotion();
  const contenedor = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const [limite, setLimite] = useState(0);

  // Cuanto se puede arrastrar hacia la izquierda. Se remide en cada cambio de
  // tamaño porque el ancho de las tarjetas cambia en el breakpoint sm.
  useEffect(() => {
    if (reducir) return;
    const nodoContenedor = contenedor.current;
    const nodoPista = pista.current;
    if (!nodoContenedor || !nodoPista) return;

    const medir = () => {
      setLimite(Math.max(0, nodoPista.scrollWidth - nodoContenedor.clientWidth));
    };

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(nodoContenedor);
    observador.observe(nodoPista);
    return () => observador.disconnect();
  }, [reducir]);

  // Alinea la primera tarjeta con la cabecera (max-w-6xl = 72rem) pero deja que
  // las demas se corten contra el borde de la pantalla.
  const relleno =
    "px-5 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2+2rem))]";

  return (
    <section id="testimonios" className="textura-grano relative bg-ink-900 py-24 sm:py-32">
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
      </div>

      <Reveal delay={0.2} className="mt-12">
        {reducir ? (
          <div
            className={cn("flex snap-x gap-4 overflow-x-auto pb-4 sm:gap-5", relleno)}
            style={{ maskImage: MASCARA, WebkitMaskImage: MASCARA }}
          >
            {testimonios.map((testimonio) => (
              <div key={testimonio.nombre} className="snap-start">
                <Tarjeta testimonio={testimonio} />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={contenedor}
            className="overflow-hidden"
            style={{ maskImage: MASCARA, WebkitMaskImage: MASCARA }}
          >
            {/* drag="x" ya fija touch-action: pan-y, asi que el scroll vertical
                de la pagina sigue funcionando sobre el carrusel. */}
            <motion.div
              ref={pista}
              drag="x"
              dragConstraints={{ left: -limite, right: 0 }}
              dragElastic={0.14}
              dragTransition={{ power: 0.28, timeConstant: 340, bounceStiffness: 260, bounceDamping: 32 }}
              className={cn(
                "flex cursor-grab gap-4 select-none active:cursor-grabbing sm:gap-5",
                relleno,
              )}
            >
              {testimonios.map((testimonio) => (
                <Tarjeta key={testimonio.nombre} testimonio={testimonio} />
              ))}
            </motion.div>
          </div>
        )}
      </Reveal>
    </section>
  );
}
