import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { ADMIN_SESSION_COOKIE } from "./session-cookie";

// Sesion del admin: un solo usuario, definido por variables de entorno.
//
//   ADMIN_USER          -> nombre de usuario en texto plano
//   ADMIN_PASSWORD_HASH -> hash PBKDF2, formato pbkdf2.<iter>.<saltB64>.<hashB64>
//   JWT_SECRET          -> secreto para firmar la cookie de sesion
//
// La contrasena nunca se guarda: solo su hash. Para generar uno nuevo:
//   node scripts/generar-credenciales.mjs "MiContrasena"
//
// El separador es un punto y NO un $ (que es lo habitual en formato PHC):
// los archivos .env expanden $algo como variable, asi que un hash con $ llega
// destrozado a la aplicacion. El punto nunca aparece en base64, es seguro.

export { ADMIN_SESSION_COOKIE };
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 horas

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_BITS = 256;

export interface AdminUser {
  username: string;
}

export class AdminAuthError extends Error {
  constructor(public code: "UNAUTHENTICATED") {
    super(code);
    this.name = "AdminAuthError";
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[lib/auth] Falta la variable de entorno ${name}. Revise .env.local (o las variables del proyecto en Vercel).`,
    );
  }
  return value;
}

function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(requireEnv("JWT_SECRET"));
}

// --- Hash de contrasenas -------------------------------------------------

export async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    PBKDF2_KEY_BITS,
  );
  return new Uint8Array(bits);
}

export function formatPasswordHash(
  salt: Uint8Array,
  hash: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS,
): string {
  const saltB64 = Buffer.from(salt).toString("base64");
  const hashB64 = Buffer.from(hash).toString("base64");
  return `pbkdf2.${iterations}.${saltB64}.${hashB64}`;
}

// Comparacion en tiempo constante: siempre recorre todos los bytes.
// Un === normal corta en la primera diferencia, y medir esa diferencia de
// tiempo permite adivinar el hash byte por byte.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Verifica usuario y contrasena contra las variables de entorno. */
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = requireEnv("ADMIN_USER");
  const stored = requireEnv("ADMIN_PASSWORD_HASH");

  const parts = stored.split(".");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    // Causa tipica: el hash se genero con el formato viejo separado por $, y
    // el .env se comio los tramos que van tras cada $ al expandirlos como
    // variables. Regenerar las credenciales lo arregla.
    throw new Error(
      `[lib/auth] ADMIN_PASSWORD_HASH tiene un formato invalido (se esperaban 4 partes separadas por punto, llegaron ${parts.length}). Regenerelo con: npm run credenciales`,
    );
  }

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1) {
    throw new Error("[lib/auth] ADMIN_PASSWORD_HASH: numero de iteraciones invalido.");
  }
  const salt = new Uint8Array(Buffer.from(parts[2], "base64"));
  const expectedHash = new Uint8Array(Buffer.from(parts[3], "base64"));

  const actualHash = await derivePasswordHash(password, salt, iterations);

  // Comparamos SIEMPRE las dos cosas (usuario y contrasena) sin cortocircuito,
  // para no revelar por tiempo de respuesta si el usuario existe.
  const userOk = timingSafeEqual(
    new TextEncoder().encode(username),
    new TextEncoder().encode(expectedUser),
  );
  const passOk = timingSafeEqual(actualHash, expectedHash);
  return userOk && passOk;
}

// --- Sesion --------------------------------------------------------------

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecretBytes());
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    maxAge: SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes());
    const username = typeof payload.username === "string" ? payload.username : "";
    if (!username) return null;
    return { username };
  } catch (err) {
    // Token expirado, firma invalida o formato malo: todos terminan sin sesion.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[auth] JWT invalido:",
        err instanceof Error ? err.message : err,
      );
    }
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AdminAuthError("UNAUTHENTICATED");
  return admin;
}
