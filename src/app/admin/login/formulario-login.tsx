"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Loader2, Lock, User } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { iniciarSesion } from "@/app/admin/acciones";
import { ESTADO_LOGIN_INICIAL } from "@/app/admin/estados";

const CLASE_INPUT =
  "w-full rounded-xl border border-linea bg-ink-900 py-3 pr-4 pl-11 text-sm text-bone-50 placeholder:text-bone-500 transition-colors focus:border-brand-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30";

export function FormularioLogin({ redirectTo }: { redirectTo?: string }) {
  const [estado, accion, enviando] = useActionState(iniciarSesion, ESTADO_LOGIN_INICIAL);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="borde-degradado relative w-full max-w-sm rounded-3xl bg-ink-850/70 p-7 backdrop-blur-sm sm:p-8"
    >
      <div className="mb-7 flex flex-col items-center text-center">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-ink-950">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M4 19 L12 5 L20 19"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="text-lg font-semibold text-bone-50">Panel de administración</h1>
        <p className="mt-1 text-sm text-bone-500">Vértice Obras</p>
      </div>

      <form action={accion} className="space-y-3.5">
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

        <label className="block">
          <span className="sr-only">Usuario</span>
          <span className="relative block">
            <User
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-bone-500"
            />
            <input
              name="usuario"
              required
              autoComplete="username"
              autoFocus
              placeholder="Usuario"
              className={CLASE_INPUT}
            />
          </span>
        </label>

        <label className="block">
          <span className="sr-only">Contraseña</span>
          <span className="relative block">
            <Lock
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-bone-500"
            />
            <input
              name="clave"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Contraseña"
              className={CLASE_INPUT}
            />
          </span>
        </label>

        {estado.error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2.5 text-xs text-red-300"
          >
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
            {estado.error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-ink-950 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <Link
        href="/"
        className="mt-6 block text-center text-xs text-bone-500 transition-colors hover:text-brand-400"
      >
        ← Volver al sitio
      </Link>
    </motion.div>
  );
}
