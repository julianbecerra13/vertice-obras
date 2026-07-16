"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, RevealTexto } from "@/components/motion/reveal";
import type { ProcessStep, SectionHeader } from "@/lib/content";

const SALIDA = [0.16, 1, 0.3, 1] as const;

function Paso({ paso, indice }: { paso: ProcessStep; indice: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reducir = useReducedMotion();
  // Banda de deteccion en el 60% central de la pantalla: el nodo se enciende
  // cuando el paso esta siendo leido, no cuando asoma por el borde.
  const enPantalla = useInView(ref, { once: true, margin: "-20% 0px -20% 0px" });

  return (
    <li ref={ref} className="relative pl-10 sm:pl-14">
      <span aria-hidden className="absolute top-2 left-4 h-2.5 w-2.5 -translate-x-1/2">
        <span className="block h-full w-full rounded-full bg-ink-600 ring-4 ring-ink-900" />
        {/* Punto encendido superpuesto: animar opacity/scale en vez del color
            de fondo mantiene la animacion fuera del hilo de layout. */}
        <motion.span
          className="absolute inset-0 rounded-full bg-brand-500 shadow-[0_0_14px_rgb(245_158_11/0.55)] ring-4 ring-ink-900"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={enPantalla ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
          transition={{ duration: reducir ? 0.15 : 0.5, ease: SALIDA }}
        />
      </span>

      <span className="font-mono text-2xl font-semibold text-brand-500/40 tabular-nums sm:text-3xl">
        {String(indice + 1).padStart(2, "0")}
      </span>

      <h3 className="mt-1 text-lg font-semibold text-bone-50">{paso.titulo}</h3>

      <p className="mt-2 max-w-xl text-sm leading-relaxed text-bone-400 [text-wrap:pretty]">
        {paso.descripcion}
      </p>
    </li>
  );
}

export function Proceso({
  header,
  pasos,
}: {
  header: SectionHeader;
  pasos: ProcessStep[];
}) {
  const linea = useRef<HTMLDivElement>(null);
  const reducir = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: linea,
    offset: ["start 75%", "end 65%"],
  });
  // Se completa antes de que el contenedor termine de salir: la linea alcanza
  // el ultimo nodo mientras aun se ve, no justo cuando se va.
  const escalaY = useTransform(scrollYProgress, [0, 0.9], [0, 1]);

  return (
    <section id="proceso" className="bg-ink-900 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal y={16}>
          <p className="text-xs font-medium tracking-[0.2em] text-brand-400 uppercase">
            {header.eyebrow}
          </p>
        </Reveal>

        <RevealTexto
          as="h2"
          texto={header.titulo}
          delay={0.1}
          className="mt-4 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-bone-50 sm:text-5xl"
        />

        <Reveal delay={0.25} y={16}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bone-400 [text-wrap:pretty]">
            {header.subtitulo}
          </p>
        </Reveal>

        <div ref={linea} className="relative mt-14 sm:mt-16">
          {/* top-[13px] = centro del nodo del primer paso (top-2 + media altura),
              para que la linea nazca del punto y no del aire.
              Riel y linea comparten mascara: el degradado no se escala con
              scaleY, asi el desvanecido del final se queda quieto. */}
          <div
            aria-hidden
            className="absolute top-[13px] bottom-0 left-4 w-px -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
          >
            <div className="absolute inset-0 bg-velo-fuerte" />
            <motion.div
              className="absolute inset-0 origin-top bg-brand-500/80"
              style={{ scaleY: reducir ? 1 : escalaY }}
            />
          </div>

          <ol className="flex flex-col gap-10 sm:gap-12">
            {pasos.map((paso, i) => (
              <Paso key={paso.titulo} paso={paso} indice={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
