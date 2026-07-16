"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Phone, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { RevealTexto } from "@/components/motion/reveal";
import type { SiteContent } from "@/lib/content";
import { enlaceWhatsapp } from "@/lib/utils";

// Hero a pantalla completa con parallax.
//
// NOTA PARA REEMPLAZAR POR FOTO REAL:
// El fondo es una composicion generada (rejilla de plano + halos + grano).
// Para usar una foto del cliente, ponga la imagen en /public/hero.jpg y
// reemplace <FondoPlano /> por:
//   <Image src="/hero.jpg" alt="" fill priority className="object-cover opacity-40" />
// Manteniendo el <div> de degradado de abajo para que el texto siga legible.

function FondoPlano() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Rejilla tipo plano arquitectonico */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="rejilla" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="var(--trazo-plano)"
              strokeWidth="1"
            />
          </pattern>
          <pattern id="rejilla-fina" width="16" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M 16 0 L 0 0 0 16"
              fill="none"
              stroke="var(--trazo-plano-fino)"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="desvanecer">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="mascara-rejilla">
            <rect width="100%" height="100%" fill="url(#desvanecer)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#rejilla-fina)" mask="url(#mascara-rejilla)" />
        <rect width="100%" height="100%" fill="url(#rejilla)" mask="url(#mascara-rejilla)" />
      </svg>

      {/* Halos de luz calida. El color sale de una variable porque en tema
          claro hay que bajarlos: el ambar sobre blanco se lee como mancha. */}
      <div
        className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ backgroundColor: "var(--halo-marca)" }}
      />
      <div
        className="absolute right-[8%] bottom-0 h-[340px] w-[340px] rounded-full blur-[110px]"
        style={{ backgroundColor: "var(--halo-marca-suave)" }}
      />

      {/* Siluetas de estructura */}
      <svg
        className="absolute bottom-0 left-0 h-[46%] w-full text-silueta"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      >
        <path
          d="M0 400 L0 250 L120 250 L120 180 L260 180 L260 300 L420 300 L420 130 L560 130 L560 260 L720 260 L720 90 L880 90 L880 220 L1040 220 L1040 170 L1180 170 L1180 280 L1320 280 L1320 210 L1440 210 L1440 400 Z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path
          d="M0 400 L0 330 L180 330 L180 290 L360 290 L360 350 L540 350 L540 250 L760 250 L760 320 L980 320 L980 270 L1200 270 L1200 340 L1440 340 L1440 400 Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
      </svg>

      {/* Degradado inferior: garantiza contraste del texto sobre el fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/20 to-ink-950" />
    </div>
  );
}

export function Hero({ content }: { content: SiteContent }) {
  const ref = useRef<HTMLElement>(null);
  const reducir = useReducedMotion();

  // Parallax: el fondo se mueve mas lento que el contenido al bajar.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yFondo = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const yContenido = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const opacidad = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const { hero, brand } = content;

  return (
    <section
      ref={ref}
      id="inicio"
      className="textura-grano relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <motion.div style={reducir ? undefined : { y: yFondo }} className="absolute inset-0">
        <FondoPlano />
      </motion.div>

      <motion.div
        style={reducir ? undefined : { y: yContenido, opacity: opacidad }}
        className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20 sm:px-8"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-linea bg-velo px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-[pulse-ring_2.5s_ease-out_infinite] rounded-full bg-brand-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
          </span>
          <span className="text-xs font-medium tracking-wide text-bone-200">
            {hero.eyebrow}
          </span>
        </motion.div>

        <RevealTexto
          as="h1"
          texto={hero.titulo}
          resaltado={hero.tituloResaltado}
          delay={0.15}
          className="max-w-4xl text-5xl leading-[1.03] font-semibold tracking-tight text-bone-50 sm:text-6xl lg:text-7xl"
        />

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-xl text-base leading-relaxed text-bone-400 sm:text-lg [text-wrap:pretty]"
        >
          {hero.subtitulo}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="#contacto"
            className="group sombra-marca inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-ink-950 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-95"
          >
            {hero.ctaPrimario}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>

          <a
            href="#trabajos"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-linea bg-velo px-7 py-3.5 text-sm font-semibold text-bone-50 backdrop-blur-sm transition-colors duration-200 hover:border-linea-fuerte hover:bg-velo-fuerte focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            {hero.ctaSecundario}
          </a>

          <a
            href={enlaceWhatsapp(brand.whatsapp, `Hola, quiero una cotización con ${brand.nombre}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-2 py-3.5 text-sm font-medium text-bone-400 transition-colors hover:text-brand-400 sm:ml-2"
          >
            <Phone className="h-4 w-4" />
            {brand.telefono}
          </a>
        </motion.div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={reducir ? undefined : { opacity: opacidad }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={reducir ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 text-bone-500"
        >
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
            Deslice
          </span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
