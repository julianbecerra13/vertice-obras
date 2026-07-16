"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { SiteContent } from "@/lib/content";
import { enlaceWhatsapp } from "@/lib/utils";

const ANIO_ACTUAL = new Date().getFullYear();

export function Footer({ brand }: { brand: SiteContent["brand"] }) {
  return (
    <footer className="border-t border-linea bg-ink-950">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-ink-950">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                  <path
                    d="M4 19 L12 5 L20 19"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold tracking-tight text-bone-50">
                {brand.nombre}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-bone-500">{brand.tagline}</p>
            <p className="mt-3 text-xs text-bone-500">
              {brand.direccion}
              <br />
              {brand.ciudad}, Colombia
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:gap-x-16">
            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[11px] tracking-[0.15em] text-bone-500 uppercase">
                Servicios
              </span>
              <a href="#servicios" className="text-bone-400 transition-colors hover:text-brand-400">
                Pintura
              </a>
              <a href="#servicios" className="text-bone-400 transition-colors hover:text-brand-400">
                Plomería
              </a>
              <a href="#servicios" className="text-bone-400 transition-colors hover:text-brand-400">
                Eléctrico
              </a>
              <a href="#servicios" className="text-bone-400 transition-colors hover:text-brand-400">
                Estructural
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <span className="mb-1 text-[11px] tracking-[0.15em] text-bone-500 uppercase">
                Empresa
              </span>
              <a href="#trabajos" className="text-bone-400 transition-colors hover:text-brand-400">
                Trabajos
              </a>
              <a href="#testimonios" className="text-bone-400 transition-colors hover:text-brand-400">
                Clientes
              </a>
              <a href="#faq" className="text-bone-400 transition-colors hover:text-brand-400">
                Preguntas
              </a>
              <a href="#contacto" className="text-bone-400 transition-colors hover:text-brand-400">
                Contacto
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-linea pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-bone-500">
            © {ANIO_ACTUAL} {brand.nombre}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-bone-500">
            {brand.telefono} · {brand.email}
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Boton flotante de WhatsApp.
 * Aparece solo despues de bajar un poco: en el hero estorbaria al CTA principal.
 */
export function BotonWhatsapp({ brand }: { brand: SiteContent["brand"] }) {
  const { scrollY } = useScroll();
  const reducir = useReducedMotion();
  const opacidad = useTransform(scrollY, [200, 400], [0, 1]);
  const escala = useTransform(scrollY, [200, 400], [0.6, 1]);

  return (
    <motion.a
      href={enlaceWhatsapp(brand.whatsapp, `Hola, quiero una cotización con ${brand.nombre}.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      style={reducir ? undefined : { opacity: opacidad, scale: escala }}
      className="fixed right-4 bottom-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-brand-500 text-ink-950 shadow-[0_8px_30px_-4px_rgb(245_158_11_/_0.5)] transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-95 sm:right-6 sm:bottom-6 sm:h-14 sm:w-14"
    >
      <span
        aria-hidden
        className="absolute inset-0 animate-[pulse-ring_2.5s_ease-out_infinite] rounded-full bg-brand-500/40"
      />
      <MessageCircle className="relative h-6 w-6" />
    </motion.a>
  );
}
