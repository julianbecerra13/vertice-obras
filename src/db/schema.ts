import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// site_content guarda TODO el contenido editable en una sola fila (id = 1).
// Es un JSON validado con zod al leer y al escribir. Elegimos jsonb en vez de
// columnas sueltas porque el contenido cambia de forma seguido y no necesitamos
// consultar campos individuales por SQL.
export const siteContent = pgTable("site_content", {
  id: integer("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// leads si va con columnas normales: aqui SI filtramos, ordenamos por fecha
// y exportamos a CSV.
export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    nombre: text("nombre").notNull(),
    telefono: text("telefono").notNull(),
    email: text("email"),
    servicio: text("servicio").notNull(),
    mensaje: text("mensaje"),
    estado: text("estado").notNull().default("nuevo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("leads_created_at_idx").on(table.createdAt)],
);

export const SITE_CONTENT_ROW_ID = 1;
