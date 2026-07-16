"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearAdminSessionCookie,
  createSessionToken,
  requireAdmin,
  setAdminSessionCookie,
  verifyCredentials,
} from "@/lib/auth";
import { siteContentSchema } from "@/lib/content";
import { isLeadEstado } from "@/lib/leads";
import { getRepo } from "@/lib/repo";
import type { EstadoContenido, EstadoLogin } from "./estados";

// Este archivo solo puede exportar funciones async: cada export de un archivo
// "use server" se vuelve un endpoint invocable desde internet. Los estados y
// tipos viven en estados.ts por esa restriccion.

// --- Login ---------------------------------------------------------------

// Limite de intentos de login por IP. La pagina de login es publica y esta en
// internet abierto: sin esto, cualquiera puede probar contrasenas sin parar.
const VENTANA_LOGIN_MS = 5 * 60_000;
const MAX_INTENTOS = 8;
const intentos = new Map<string, number[]>();

function superaIntentos(ip: string): boolean {
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_LOGIN_MS);
  if (previos.length >= MAX_INTENTOS) {
    intentos.set(ip, previos);
    return true;
  }
  previos.push(ahora);
  intentos.set(ip, previos);
  return false;
}

async function obtenerIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida"
  );
}

/**
 * Solo permitimos redirigir a rutas internas del panel.
 * Sin esta comprobacion, ?redirect=https://sitio-falso.com llevaria al usuario
 * fuera del sitio despues de iniciar sesion (open redirect).
 */
function destinoSeguro(valor: string | null): string {
  if (!valor) return "/admin";
  if (!valor.startsWith("/admin")) return "/admin";
  // Bloquea //evil.com, que el navegador interpreta como dominio externo.
  if (valor.startsWith("//")) return "/admin";
  return valor;
}

export async function iniciarSesion(
  _prev: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const clave = String(formData.get("clave") ?? "");
  const destino = destinoSeguro(
    formData.get("redirect") ? String(formData.get("redirect")) : null,
  );

  if (!usuario || !clave) {
    return { error: "Escriba usuario y contraseña." };
  }

  const ip = await obtenerIp();
  if (superaIntentos(ip)) {
    return {
      error: "Demasiados intentos fallidos. Espere 5 minutos e intente de nuevo.",
    };
  }

  let ok = false;
  try {
    ok = await verifyCredentials(usuario, clave);
  } catch (err) {
    console.error("[admin/iniciarSesion] Configuracion invalida:", err);
    return {
      error: "El servidor no está configurado correctamente. Revise las variables de entorno.",
    };
  }

  if (!ok) {
    // Mensaje generico a proposito: no revelamos si el usuario existe.
    return { error: "Usuario o contraseña incorrectos." };
  }

  const token = await createSessionToken(usuario);
  await setAdminSessionCookie(token);

  // redirect() funciona lanzando una excepcion interna de Next. Debe quedar
  // FUERA de cualquier try/catch o el catch se la traga y el login se cuelga.
  redirect(destino);
}

export async function cerrarSesion() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

// --- Contenido -----------------------------------------------------------

/**
 * Recibe el contenido completo como JSON en un campo oculto.
 * El editor mantiene el estado en el cliente y manda todo de una; validamos
 * en el servidor porque nunca confiamos en lo que llega del navegador.
 */
export async function guardarContenido(
  _prev: EstadoContenido,
  formData: FormData,
): Promise<EstadoContenido> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, mensaje: "Su sesión expiró. Vuelva a iniciar sesión.", guardado: null };
  }

  const crudo = formData.get("contenido");
  if (typeof crudo !== "string") {
    return { ok: false, mensaje: "No llegó ningún contenido.", guardado: null };
  }

  let json: unknown;
  try {
    json = JSON.parse(crudo);
  } catch {
    return { ok: false, mensaje: "El contenido enviado no es un JSON válido.", guardado: null };
  }

  const parsed = siteContentSchema.safeParse(json);
  if (!parsed.success) {
    const primero = parsed.error.issues[0];
    const donde = primero?.path.join(" > ") || "un campo";
    return {
      ok: false,
      mensaje: `Revise "${donde}": ${primero?.message ?? "valor inválido"}.`,
      guardado: null,
    };
  }

  try {
    const repo = await getRepo();
    await repo.saveContent(parsed.data);
  } catch (err) {
    console.error("[admin/guardarContenido] No se pudo guardar:", err);
    return { ok: false, mensaje: "No se pudo guardar. Intente de nuevo.", guardado: null };
  }

  // La pagina publica es force-dynamic, pero revalidamos por si en el futuro
  // se le agrega cache.
  revalidatePath("/");

  return {
    ok: true,
    mensaje: "Cambios guardados. La página pública ya los muestra.",
    // Devolvemos lo que realmente quedo guardado (ya normalizado por zod) para
    // que el editor sepa si sigue habiendo cambios pendientes sin necesitar un
    // efecto que sincronice su propio estado.
    guardado: JSON.stringify(parsed.data),
  };
}

// --- Leads ---------------------------------------------------------------

export async function cambiarEstadoLead(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const estado = String(formData.get("estado"));

  if (!Number.isInteger(id) || id <= 0) return;
  if (!isLeadEstado(estado)) return;

  const repo = await getRepo();
  await repo.updateLeadEstado(id, estado);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function borrarLead(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const repo = await getRepo();
  await repo.deleteLead(id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
