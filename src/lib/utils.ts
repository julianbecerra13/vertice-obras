import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Une clases de Tailwind resolviendo conflictos: cn("p-2", "p-4") -> "p-4".
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

export function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  }).format(fecha);
}

/** Convierte un numero de WhatsApp a un enlace wa.me con mensaje inicial. */
export function enlaceWhatsapp(numero: string, mensaje?: string): string {
  const limpio = numero.replace(/\D/g, "");
  const base = `https://wa.me/${limpio}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
