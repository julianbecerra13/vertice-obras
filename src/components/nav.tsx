"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { cn, enlaceWhatsapp } from "@/lib/utils";

const ENLACES = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Proceso" },
  { href: "#trabajos", label: "Trabajos" },
  { href: "#testimonios", label: "Clientes" },
  { href: "#faq", label: "Preguntas" },
] as const;

export function Nav({ brand }: { brand: SiteContent["brand"] }) {
  const [abierto, setAbierto] = useState(false);
  const [compacta, setCompacta] = useState(false);
  const { scrollY } = useScroll();

  // useMotionValueEvent no re-renderiza en cada pixel: solo actualizamos el
  // estado cuando cruzamos el umbral.
  useMotionValueEvent(scrollY, "change", (y) => {
    const nuevo = y > 40;
    setCompacta((prev) => (prev === nuevo ? prev : nuevo));
  });

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          compacta
            ? "border-b border-linea bg-ink-950/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Principal"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-18 sm:px-8"
        >
          <a
            href="#inicio"
            className="group flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-ink-950">
              {/* Marca: vertice formado por dos trazos */}
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
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  className="relative rounded-full px-3.5 py-2 text-sm text-bone-400 transition-colors hover:text-bone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                >
                  {e.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href="#contacto"
              className="hidden rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-95 sm:inline-flex"
            >
              Cotizar gratis
            </a>

            <button
              type="button"
              onClick={() => setAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={abierto}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-linea text-bone-200 transition-colors hover:border-linea-fuerte focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Menu movil a pantalla completa */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-60 bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-16 items-center justify-end px-5 sm:h-18 sm:px-8">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar menú"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-linea text-bone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.ul
              initial="oculto"
              animate="visible"
              transition={{ staggerChildren: 0.06, delayChildren: 0.08 }}
              className="mt-6 flex flex-col gap-1 px-5 sm:px-8"
            >
              {ENLACES.map((e) => (
                <motion.li
                  key={e.href}
                  variants={{
                    oculto: { opacity: 0, x: -24 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={e.href}
                    onClick={() => setAbierto(false)}
                    className="block border-b border-linea py-4 text-2xl font-medium text-bone-50 transition-colors hover:text-brand-400"
                  >
                    {e.label}
                  </a>
                </motion.li>
              ))}

              <motion.li
                variants={{
                  oculto: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 flex flex-col gap-3"
              >
                <a
                  href="#contacto"
                  onClick={() => setAbierto(false)}
                  className="sombra-marca inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3.5 text-sm font-semibold text-ink-950"
                >
                  Cotizar gratis
                </a>
                <a
                  href={enlaceWhatsapp(brand.whatsapp, `Hola, quiero una cotización con ${brand.nombre}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-linea px-6 py-3.5 text-sm font-semibold text-bone-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Escribir por WhatsApp
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
