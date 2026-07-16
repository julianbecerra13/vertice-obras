import { z } from "zod";

// Contrato de los leads que entran por el formulario publico.
// El mismo esquema valida en el cliente (feedback inmediato) y en el
// servidor (fuente de verdad: nunca confiamos en lo que manda el browser).

export const LEAD_ESTADOS = ["nuevo", "contactado", "cerrado"] as const;
export type LeadEstado = (typeof LEAD_ESTADOS)[number];

export const LEAD_ESTADO_LABEL: Record<LeadEstado, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cerrado: "Cerrado",
};

// Campo opcional que puede llegar vacio desde un <input>. Lo normalizamos
// a null para no guardar cadenas vacias en la base.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const leadInputSchema = z.object({
  nombre: z.string().trim().min(2, "Escriba su nombre").max(80),
  telefono: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(30)
    .regex(/^[\d\s+()-]+$/, "El teléfono solo puede tener números"),
  email: z
    .union([z.literal(""), z.string().trim().email("Correo inválido").max(120)])
    .optional()
    .transform((v) => (v ? v : null)),
  servicio: z.string().trim().min(1, "Seleccione un servicio").max(60),
  mensaje: optionalText(1000),
});

export type LeadInput = z.infer<typeof leadInputSchema>;

export interface Lead {
  id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  servicio: string;
  mensaje: string | null;
  estado: LeadEstado;
  createdAt: Date;
}

export interface LeadStats {
  total: number;
  nuevos: number;
  hoy: number;
  semana: number;
}

export function isLeadEstado(value: unknown): value is LeadEstado {
  return (
    typeof value === "string" && (LEAD_ESTADOS as readonly string[]).includes(value)
  );
}
