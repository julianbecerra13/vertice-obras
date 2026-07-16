import { defineConfig } from "drizzle-kit";

// Configuracion para crear las tablas en Neon: npm run db:push
// Requiere DATABASE_URL. En local (sin base de datos) no hace falta ejecutarlo.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
