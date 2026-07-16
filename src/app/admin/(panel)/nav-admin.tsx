"use client";

import { motion } from "framer-motion";
import { ExternalLink, FileText, LayoutDashboard, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/admin/acciones";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/admin", label: "Resumen", icono: LayoutDashboard },
  { href: "/admin/contenido", label: "Contenido", icono: FileText },
  { href: "/admin/leads", label: "Solicitudes", icono: Users },
] as const;

export function NavAdmin({ usuario }: { usuario: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-ink-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-6">
          <Link
            href="/admin"
            className="hidden items-center gap-2.5 sm:flex"
            aria-label="Panel de Vértice Obras"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-ink-950">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path
                  d="M4 19 L12 5 L20 19"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold text-bone-50">Panel</span>
          </Link>

          <nav aria-label="Secciones del panel">
            <ul className="flex items-center gap-1">
              {ENLACES.map(({ href, label, icono: Icono }) => {
                const activo =
                  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={activo ? "page" : undefined}
                      className={cn(
                        "relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
                        activo ? "text-bone-50" : "text-bone-500 hover:text-bone-200",
                      )}
                    >
                      {activo && (
                        // layoutId hace que la pastilla se deslice entre
                        // pestanas en vez de aparecer y desaparecer.
                        <motion.span
                          layoutId="pestana-activa"
                          className="absolute inset-0 rounded-full border border-linea bg-velo-fuerte"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icono className="relative h-4 w-4" />
                      <span className="relative hidden sm:inline">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-linea px-3 py-2 text-xs text-bone-400 transition-colors hover:border-linea-fuerte hover:text-bone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:inline-flex"
          >
            Ver sitio
            <ExternalLink className="h-3 w-3" />
          </a>

          <span className="hidden text-xs text-bone-500 md:inline">{usuario}</span>

          <form action={cerrarSesion}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-linea px-3 py-2 text-xs text-bone-400 transition-colors hover:border-red-500/40 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
