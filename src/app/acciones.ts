"use server";

import { headers } from "next/headers";
import { leadInputSchema } from "@/lib/leads";
import { getRepo } from "@/lib/repo";
import type { EstadoContacto } from "./estados";

// Server Action del formulario publico.
// Al ser una action y no una API route, el formulario sigue funcionando
// aunque el JavaScript no cargue (mejora progresiva).
//
// Este archivo solo puede exportar funciones async. Los estados y tipos viven
// en estados.ts por esa restriccion de Next.

// Limite por IP en memoria. En serverless cada instancia tiene su propio Map,
// asi que esto NO es un rate limit real: frena el spam casual, no un ataque
// dirigido. Para produccion con trafico serio hay que mover esto a Redis.
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 3;
const historial = new Map<string, number[]>();

function superaLimite(ip: string): boolean {
  const ahora = Date.now();
  const previos = (historial.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);

  if (previos.length >= MAX_POR_VENTANA) {
    historial.set(ip, previos);
    return true;
  }

  previos.push(ahora);
  historial.set(ip, previos);

  // Poda simple para que el Map no crezca sin limite.
  if (historial.size > 5000) {
    for (const [clave, marcas] of historial) {
      if (marcas.every((t) => ahora - t >= VENTANA_MS)) historial.delete(clave);
    }
  }

  return false;
}

async function obtenerIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}

export async function enviarContacto(
  _prev: EstadoContacto,
  formData: FormData,
): Promise<EstadoContacto> {
  // Honeypot: campo invisible para personas. Si viene lleno es un bot.
  // Fingimos exito a proposito: si devolvieramos error, el bot reintentaria.
  if (formData.get("sitio-web")) {
    return { ok: true, mensaje: "¡Gracias! Lo contactamos pronto.", errores: null };
  }

  const ip = await obtenerIp();
  if (superaLimite(ip)) {
    return {
      ok: false,
      mensaje: "Recibimos varios envíos seguidos. Espere un minuto e intente de nuevo.",
      errores: null,
    };
  }

  const parsed = leadInputSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    servicio: formData.get("servicio"),
    mensaje: formData.get("mensaje"),
  });

  if (!parsed.success) {
    // Construimos el mapa recorriendo issues en vez de usar .flatten(),
    // que cambio de API entre zod 3 y 4.
    const errores: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "");
      if (campo && !errores[campo]) errores[campo] = issue.message;
    }
    return {
      ok: false,
      mensaje: "Revise los datos marcados.",
      errores,
    };
  }

  try {
    const repo = await getRepo();
    await repo.createLead(parsed.data);
  } catch (err) {
    console.error("[acciones/enviarContacto] No se pudo guardar el lead:", err);
    return {
      ok: false,
      mensaje:
        "No pudimos guardar su solicitud. Intente de nuevo o escríbanos por WhatsApp.",
      errores: null,
    };
  }

  return {
    ok: true,
    mensaje: "¡Gracias! Un asesor lo contacta hoy mismo.",
    errores: null,
  };
}
