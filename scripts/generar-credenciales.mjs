// Genera las credenciales del admin para pegar en .env.local (o en Vercel).
//
//   node scripts/generar-credenciales.mjs                  -> usuario admin + contrasena aleatoria
//   node scripts/generar-credenciales.mjs "MiContrasena"   -> usa la contrasena que usted elija
//   node scripts/generar-credenciales.mjs "MiContrasena" juan
//
// Imprime la contrasena UNA sola vez: guardela. En el .env queda solo el hash.

import { randomBytes } from "node:crypto";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_BITS = 256;

async function derivar(password, salt, iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    PBKDF2_KEY_BITS,
  );
  return new Uint8Array(bits);
}

// Contrasena legible: evita 0/O y 1/l para que no haya errores al dictarla.
function contrasenaAleatoria() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const min = "abcdefghijkmnpqrstuvwxyz";
  const num = "23456789";
  const sim = "!@#$%&*";
  const todo = abc + min + num + sim;
  const bytes = randomBytes(20);
  let out = "";
  // Garantizamos al menos una de cada clase.
  out += abc[bytes[0] % abc.length];
  out += min[bytes[1] % min.length];
  out += num[bytes[2] % num.length];
  out += sim[bytes[3] % sim.length];
  for (let i = 4; i < bytes.length; i++) out += todo[bytes[i] % todo.length];
  return out;
}

const password = process.argv[2] || contrasenaAleatoria();
const usuario = process.argv[3] || "admin";

const salt = randomBytes(16);
const hash = await derivar(password, salt);

// Separador punto, NO $: los archivos .env expanden $algo como variable y
// destrozarian el hash al leerlo. El punto no existe en base64.
const hashStr = `pbkdf2.${PBKDF2_ITERATIONS}.${salt.toString("base64")}.${Buffer.from(hash).toString("base64")}`;
const jwtSecret = randomBytes(48).toString("base64url");

console.log(`
=================================================================
  CREDENCIALES DEL ADMIN  -  Vertice Obras
=================================================================

  Entre a:     /admin
  Usuario:     ${usuario}
  Contrasena:  ${password}

  Guarde esta contrasena AHORA. No se puede recuperar despues,
  solo generar una nueva.

-----------------------------------------------------------------
  Pegue esto en .env.local (y en Vercel > Settings > Env Vars):
-----------------------------------------------------------------

ADMIN_USER=${usuario}
ADMIN_PASSWORD_HASH=${hashStr}
JWT_SECRET=${jwtSecret}

=================================================================
`);
