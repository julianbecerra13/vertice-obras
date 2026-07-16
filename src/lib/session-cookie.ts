// Modulo deliberadamente vacio de dependencias.
// Lo importan tanto el proxy (runtime edge) como lib/auth.ts (runtime node).
// Si esta constante viviera en auth.ts, el proxy arrastraria next/headers y
// server-only a un entorno donde no pueden ejecutarse.
export const ADMIN_SESSION_COOKIE = "vertice_admin_session";
