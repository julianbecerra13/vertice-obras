"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { useId, useState } from "react";
import { Reveal, RevealTexto } from "@/components/motion/reveal";
// El tipo se renombra porque el componente exportado tambien se llama Faq.
import type { Faq as FaqItem, SectionHeader, SiteContent } from "@/lib/content";
import { cn } from "@/lib/utils";

const SALIDA = [0.16, 1, 0.3, 1] as const;

export function Faq({
  header,
  faq,
  brand,
}: {
  header: SectionHeader;
  faq: FaqItem[];
  brand: SiteContent["brand"];
}) {
  const [abierto, setAbierto] = useState<number | null>(0);
  const reducir = useReducedMotion();
  const id = useId();

  return (
    <section id="faq" className="textura-grano relative bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
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

        <Reveal delay={0.2} className="mt-12">
          <ul className="border-t border-linea">
            {faq.map((item, i) => {
              const estaAbierto = abierto === i;
              const idBoton = `${id}-boton-${i}`;
              const idPanel = `${id}-panel-${i}`;

              return (
                <li key={item.pregunta} className="border-b border-linea">
                  <h3>
                    <button
                      type="button"
                      id={idBoton}
                      aria-expanded={estaAbierto}
                      aria-controls={idPanel}
                      onClick={() => setAbierto(estaAbierto ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                    >
                      <span
                        className={cn(
                          "text-base font-medium transition-colors duration-200 sm:text-lg",
                          estaAbierto
                            ? "text-bone-50"
                            : "text-bone-200 group-hover:text-bone-50",
                        )}
                      >
                        {item.pregunta}
                      </span>

                      <motion.span
                        aria-hidden
                        animate={{ rotate: estaAbierto ? 180 : 0 }}
                        transition={{ duration: reducir ? 0.15 : 0.35, ease: SALIDA }}
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                          estaAbierto
                            ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                            : "border-linea text-bone-400 group-hover:border-linea-fuerte",
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {estaAbierto && (
                      <motion.div
                        key="panel"
                        id={idPanel}
                        role="region"
                        aria-labelledby={idBoton}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: reducir ? 0.15 : 0.4, ease: SALIDA },
                          opacity: { duration: reducir ? 0.1 : 0.25 },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pr-10 pb-6 text-[15px] leading-relaxed text-bone-400 [text-wrap:pretty]">
                          {item.respuesta}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.24} className="mt-10">
          <div className="borde-degradado flex flex-col gap-5 rounded-2xl bg-ink-900/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-bone-50">¿Otra duda?</p>
              <p className="mt-1 text-sm text-bone-400">
                Escríbanos y le respondemos el mismo día.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#contacto"
                className="group inline-flex items-center gap-2 rounded-full border border-linea bg-velo px-5 py-2.5 text-sm font-semibold text-bone-50 transition-colors duration-200 hover:border-linea-fuerte hover:bg-velo-fuerte focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                Escribirnos
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href={`tel:${brand.telefono.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-bone-400 transition-colors duration-200 hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <Phone className="h-4 w-4" />
                {brand.telefono}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
