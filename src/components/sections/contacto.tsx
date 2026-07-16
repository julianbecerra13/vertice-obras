"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { enviarContacto } from "@/app/acciones";
import { ESTADO_INICIAL } from "@/app/estados";
import { Reveal, RevealTexto } from "@/components/motion/reveal";
import type { SectionHeader, SiteContent } from "@/lib/content";
import { cn, enlaceWhatsapp } from "@/lib/utils";

interface ContactoProps {
  header: SectionHeader;
  brand: SiteContent["brand"];
  servicios: SiteContent["servicios"];
}

function Campo({
  etiqueta,
  error,
  children,
}: {
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-bone-400">
        {etiqueta}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 block text-xs text-red-400"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

const CLASE_INPUT =
  "w-full rounded-xl border border-linea bg-ink-850/80 px-4 py-3 text-sm text-bone-50 placeholder:text-bone-500 transition-colors focus:border-brand-500/60 focus:bg-ink-850 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30";

export function Contacto({ header, brand, servicios }: ContactoProps) {
  const [estado, accion, enviando] = useActionState(enviarContacto, ESTADO_INICIAL);
  const formRef = useRef<HTMLFormElement>(null);

  // Al enviar con exito limpiamos el formulario para que se pueda mandar otro.
  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  const datos = [
    { icono: Phone, label: "Teléfono", valor: brand.telefono, href: `tel:${brand.telefono.replace(/\s/g, "")}` },
    { icono: Mail, label: "Correo", valor: brand.email, href: `mailto:${brand.email}` },
    { icono: MapPin, label: "Oficina", valor: `${brand.direccion}, ${brand.ciudad}`, href: null },
    { icono: Clock, label: "Horario", valor: brand.horario, href: null },
  ];

  return (
    <section id="contacto" className="textura-grano relative overflow-hidden bg-ink-900 py-24 sm:py-32">
      <div aria-hidden className="absolute -top-32 right-[10%] h-[420px] w-[420px] rounded-full bg-brand-500/8 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* Columna izquierda: copy + datos de contacto */}
          <div>
            <Reveal>
              <span className="text-xs font-medium tracking-[0.2em] text-brand-400 uppercase">
                {header.eyebrow}
              </span>
            </Reveal>

            <RevealTexto
              as="h2"
              texto={header.titulo}
              delay={0.05}
              className="mt-4 text-4xl font-semibold tracking-tight text-bone-50 sm:text-5xl"
            />

            <Reveal delay={0.15}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-bone-400 [text-wrap:pretty]">
                {header.subtitulo}
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <ul className="mt-9 space-y-4">
                {datos.map(({ icono: Icono, label, valor, href }) => (
                  <li key={label} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-linea bg-velo text-brand-400">
                      <Icono className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] tracking-wide text-bone-500 uppercase">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          className="block text-sm text-bone-100 transition-colors hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
                        >
                          {valor}
                        </a>
                      ) : (
                        <span className="block text-sm text-bone-100">{valor}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.35}>
              <a
                href={enlaceWhatsapp(brand.whatsapp, `Hola, quiero una cotización con ${brand.nombre}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-linea bg-velo px-5 py-3 text-sm font-medium text-bone-50 transition-colors hover:border-brand-500/40 hover:bg-brand-500/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <MessageCircle className="h-4 w-4 text-brand-400" />
                Prefiero escribir por WhatsApp
              </a>
            </Reveal>
          </div>

          {/* Columna derecha: formulario */}
          <Reveal delay={0.1} y={32}>
            <div className="borde-degradado relative overflow-hidden rounded-3xl bg-ink-850/70 p-6 backdrop-blur-sm sm:p-8">
              <AnimatePresence mode="wait">
                {estado.ok ? (
                  <motion.div
                    key="exito"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
                      className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/15 text-brand-400"
                    >
                      <CheckCircle2 className="h-8 w-8" />
                    </motion.span>
                    <h3 className="text-xl font-semibold text-bone-50">
                      Solicitud recibida
                    </h3>
                    <p className="mt-2 max-w-xs text-sm text-bone-400">{estado.mensaje}</p>
                    <p className="mt-6 text-xs text-bone-500">
                      Tiempo de respuesta promedio: menos de 24 horas.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="formulario"
                    ref={formRef}
                    action={accion}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                    noValidate
                  >
                    {/* Honeypot: invisible para personas, tentador para bots.
                        No usamos display:none porque algunos bots lo detectan. */}
                    <div className="absolute -left-[9999px] top-0" aria-hidden>
                      <label>
                        Sitio web
                        <input type="text" name="sitio-web" tabIndex={-1} autoComplete="off" />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Campo etiqueta="Nombre completo *" error={estado.errores?.nombre}>
                        <input
                          name="nombre"
                          required
                          autoComplete="name"
                          placeholder="Ana Gómez"
                          className={cn(CLASE_INPUT, estado.errores?.nombre && "border-red-500/50")}
                        />
                      </Campo>

                      <Campo etiqueta="Teléfono *" error={estado.errores?.telefono}>
                        <input
                          name="telefono"
                          required
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="300 123 4567"
                          className={cn(CLASE_INPUT, estado.errores?.telefono && "border-red-500/50")}
                        />
                      </Campo>
                    </div>

                    <Campo etiqueta="Correo (opcional)" error={estado.errores?.email}>
                      <input
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="ana@correo.com"
                        className={cn(CLASE_INPUT, estado.errores?.email && "border-red-500/50")}
                      />
                    </Campo>

                    <Campo etiqueta="¿Qué necesita? *" error={estado.errores?.servicio}>
                      <select
                        name="servicio"
                        required
                        defaultValue=""
                        className={cn(CLASE_INPUT, "appearance-none", estado.errores?.servicio && "border-red-500/50")}
                      >
                        <option value="" disabled>
                          Seleccione un servicio
                        </option>
                        {servicios.map((s) => (
                          <option key={s.id} value={s.titulo} className="bg-ink-850">
                            {s.titulo}
                          </option>
                        ))}
                        <option value="Otro" className="bg-ink-850">
                          Otro / No estoy seguro
                        </option>
                      </select>
                    </Campo>

                    <Campo etiqueta="Cuéntenos más (opcional)" error={estado.errores?.mensaje}>
                      <textarea
                        name="mensaje"
                        rows={4}
                        placeholder="Ej: tengo una fuga en el baño y humedad en la pared del vecino."
                        className={cn(CLASE_INPUT, "resize-none")}
                      />
                    </Campo>

                    {estado.mensaje && !estado.ok && (
                      <p className="rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-xs text-red-300">
                        {estado.mensaje}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={enviando}
                      className="group sombra-marca inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-ink-950 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {enviando ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Solicitar cotización gratis
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] leading-relaxed text-bone-500">
                      Sus datos se usan solo para contactarlo. No los compartimos con terceros.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
