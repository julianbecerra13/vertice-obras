import { z } from "zod";

// Contrato unico del contenido editable del sitio.
// De aqui salen: los tipos de TS, la validacion del formulario del admin
// y la validacion de lo que viene de la base de datos.
// Si el JSON guardado no cumple el esquema, caemos a DEFAULT_CONTENT en vez
// de tumbar la pagina publica.

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

export const ICON_NAMES = [
  "paintbrush",
  "wrench",
  "zap",
  "hard-hat",
  "hammer",
  "droplets",
  "ruler",
  "shield",
] as const;

export const iconNameSchema = z.enum(ICON_NAMES);
export type IconName = (typeof ICON_NAMES)[number];

export const brandSchema = z.object({
  nombre: nonEmpty(60),
  tagline: nonEmpty(120),
  telefono: nonEmpty(30),
  whatsapp: nonEmpty(30),
  email: z.string().trim().email().max(120),
  direccion: nonEmpty(140),
  ciudad: nonEmpty(60),
  horario: nonEmpty(120),
});

export const heroSchema = z.object({
  eyebrow: nonEmpty(60),
  titulo: nonEmpty(120),
  tituloResaltado: nonEmpty(60),
  subtitulo: nonEmpty(280),
  ctaPrimario: nonEmpty(40),
  ctaSecundario: nonEmpty(40),
});

export const statSchema = z.object({
  valor: z.number().int().min(0).max(1_000_000),
  sufijo: z.string().trim().max(6),
  prefijo: z.string().trim().max(6),
  label: nonEmpty(40),
});

export const serviceSchema = z.object({
  id: nonEmpty(40),
  icono: iconNameSchema,
  titulo: nonEmpty(60),
  descripcion: nonEmpty(280),
  bullets: z.array(nonEmpty(60)).min(1).max(5),
  destacado: z.boolean(),
});

export const processStepSchema = z.object({
  titulo: nonEmpty(60),
  descripcion: nonEmpty(240),
});

export const workSchema = z.object({
  titulo: nonEmpty(80),
  descripcion: nonEmpty(160),
  imagenAntes: nonEmpty(300),
  imagenDespues: nonEmpty(300),
});

export const testimonialSchema = z.object({
  nombre: nonEmpty(60),
  ciudad: nonEmpty(60),
  texto: nonEmpty(400),
  rating: z.number().int().min(1).max(5),
});

export const faqSchema = z.object({
  pregunta: nonEmpty(160),
  respuesta: nonEmpty(600),
});

export const sectionHeaderSchema = z.object({
  eyebrow: nonEmpty(60),
  titulo: nonEmpty(120),
  subtitulo: nonEmpty(280),
});

export const siteContentSchema = z.object({
  brand: brandSchema,
  hero: heroSchema,
  stats: z.array(statSchema).min(1).max(4),
  serviciosHeader: sectionHeaderSchema,
  servicios: z.array(serviceSchema).min(1).max(8),
  procesoHeader: sectionHeaderSchema,
  proceso: z.array(processStepSchema).min(1).max(6),
  trabajosHeader: sectionHeaderSchema,
  trabajos: z.array(workSchema).min(1).max(6),
  testimoniosHeader: sectionHeaderSchema,
  testimonios: z.array(testimonialSchema).min(1).max(8),
  faqHeader: sectionHeaderSchema,
  faq: z.array(faqSchema).min(1).max(10),
  contactoHeader: sectionHeaderSchema,
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Stat = z.infer<typeof statSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
export type Work = z.infer<typeof workSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type SectionHeader = z.infer<typeof sectionHeaderSchema>;

export const DEFAULT_CONTENT: SiteContent = {
  brand: {
    nombre: "Vértice Obras",
    tagline: "Construcción y reformas de alto estándar",
    telefono: "+57 604 444 8890",
    whatsapp: "573001234567",
    email: "contacto@verticeobras.com",
    direccion: "Cra. 43A #14-27, El Poblado",
    ciudad: "Medellín",
    horario: "Lunes a sábado, 7:00 a.m. – 6:00 p.m.",
  },
  hero: {
    eyebrow: "Desde 2013 · Antioquia",
    titulo: "Su hogar merece",
    tituloResaltado: "acabados de verdad",
    subtitulo:
      "Pintura, plomería, redes eléctricas y refuerzo estructural ejecutados por maestros certificados. Cotización sin costo en menos de 24 horas.",
    ctaPrimario: "Solicitar cotización",
    ctaSecundario: "Ver nuestros trabajos",
  },
  stats: [
    { valor: 12, sufijo: "", prefijo: "+", label: "Años de experiencia" },
    { valor: 840, sufijo: "", prefijo: "+", label: "Obras entregadas" },
    { valor: 98, sufijo: "%", prefijo: "", label: "Clientes satisfechos" },
    { valor: 24, sufijo: "h", prefijo: "", label: "Respuesta promedio" },
  ],
  serviciosHeader: {
    eyebrow: "Qué hacemos",
    titulo: "Un solo equipo para toda su obra",
    subtitulo:
      "Sin intermediarios ni subcontratos improvisados. Personal propio, materiales de marca y garantía por escrito en cada servicio.",
  },
  servicios: [
    {
      id: "pintura",
      icono: "paintbrush",
      titulo: "Pintura y estuco",
      descripcion:
        "Interiores y fachadas con preparación de superficie completa. Acabados uniformes que no se cuartean al año siguiente.",
      bullets: ["Estuco y resane", "Pintura interior", "Fachadas en altura"],
      destacado: true,
    },
    {
      id: "plomeria",
      icono: "droplets",
      titulo: "Plomería",
      descripcion:
        "Detección de fugas sin romper de más, cambio de redes y reparación de baños y cocinas con garantía.",
      bullets: ["Detección de fugas", "Cambio de redes", "Baños y cocinas"],
      destacado: false,
    },
    {
      id: "electrico",
      icono: "zap",
      titulo: "Redes eléctricas",
      descripcion:
        "Instalaciones seguras y certificadas RETIE. Tableros, iluminación y puntos nuevos sin sorpresas en el recibo.",
      bullets: ["Certificación RETIE", "Tableros y breakers", "Iluminación LED"],
      destacado: false,
    },
    {
      id: "estructural",
      icono: "hard-hat",
      titulo: "Refuerzo estructural",
      descripcion:
        "Diagnóstico con ingeniero civil, refuerzo de columnas y vigas, y control de fisuras con respaldo técnico.",
      bullets: ["Diagnóstico técnico", "Refuerzo de columnas", "Control de fisuras"],
      destacado: true,
    },
    {
      id: "remodelacion",
      icono: "hammer",
      titulo: "Remodelación integral",
      descripcion:
        "Renovamos su apartamento o local de principio a fin, con cronograma claro y un solo responsable.",
      bullets: ["Diseño y ejecución", "Cronograma cerrado", "Un solo contacto"],
      destacado: false,
    },
    {
      id: "impermeabilizacion",
      icono: "shield",
      titulo: "Impermeabilización",
      descripcion:
        "Terrazas, cubiertas y muros con manto asfáltico o poliuretano. Se acabaron las goteras en invierno.",
      bullets: ["Terrazas y cubiertas", "Manto asfáltico", "Garantía 5 años"],
      destacado: false,
    },
  ],
  procesoHeader: {
    eyebrow: "Cómo trabajamos",
    titulo: "Cuatro pasos, cero improvisación",
    subtitulo:
      "Usted sabe desde el primer día qué se hace, cuánto cuesta y cuándo se entrega.",
  },
  proceso: [
    {
      titulo: "Diagnóstico en sitio",
      descripcion:
        "Visitamos su propiedad sin costo, medimos y le explicamos con honestidad qué necesita y qué no.",
    },
    {
      titulo: "Cotización cerrada",
      descripcion:
        "Precio fijo por escrito en menos de 24 horas, con materiales y tiempos detallados. Sin costos ocultos.",
    },
    {
      titulo: "Ejecución supervisada",
      descripcion:
        "Un maestro asignado y reportes con fotos del avance. Protegemos sus muebles y dejamos limpio cada día.",
    },
    {
      titulo: "Entrega y garantía",
      descripcion:
        "Revisión conjunta punto por punto y garantía por escrito. Si algo falla, volvemos sin discutir.",
    },
  ],
  trabajosHeader: {
    eyebrow: "Antes y después",
    titulo: "Los resultados hablan solos",
    subtitulo:
      "Deslice la barra para ver la transformación real de obras entregadas este año.",
  },
  trabajos: [
    {
      titulo: "Fachada en El Poblado",
      descripcion: "Resane de fisuras, estuco y pintura completa. 9 días de obra.",
      imagenAntes: "/trabajos/fachada-antes.svg",
      imagenDespues: "/trabajos/fachada-despues.svg",
    },
    {
      titulo: "Baño en Envigado",
      descripcion: "Cambio de redes, enchape y aparatos nuevos. 12 días de obra.",
      imagenAntes: "/trabajos/bano-antes.svg",
      imagenDespues: "/trabajos/bano-despues.svg",
    },
    {
      titulo: "Cocina en Laureles",
      descripcion: "Remodelación integral con mobiliario a medida. 18 días de obra.",
      imagenAntes: "/trabajos/cocina-antes.svg",
      imagenDespues: "/trabajos/cocina-despues.svg",
    },
  ],
  testimoniosHeader: {
    eyebrow: "Clientes",
    titulo: "Lo que dicen de nosotros",
    subtitulo: "Más de 840 obras entregadas en Antioquia y seguimos contando.",
  },
  testimonios: [
    {
      nombre: "Marcela Restrepo",
      ciudad: "Medellín",
      texto:
        "Llevaba dos años con una gotera que nadie resolvía. Vértice la encontró el primer día y la arregló bien. El precio fue exactamente el de la cotización.",
      rating: 5,
    },
    {
      nombre: "Javier Ocampo",
      ciudad: "Envigado",
      texto:
        "Remodelaron todo el apartamento en tres semanas. Cumplieron el cronograma y dejaban limpio todos los días. Muy serios.",
      rating: 5,
    },
    {
      nombre: "Diana Ruiz",
      ciudad: "Sabaneta",
      texto:
        "Me dijeron con franqueza que no necesitaba refuerzo estructural, solo control de fisuras. Otros me querían vender una obra completa.",
      rating: 5,
    },
    {
      nombre: "Andrés Villa",
      ciudad: "Rionegro",
      texto:
        "La fachada del edificio quedó impecable y coordinaron todo con la administración. Ya los contratamos para el parqueadero.",
      rating: 4,
    },
  ],
  faqHeader: {
    eyebrow: "Dudas frecuentes",
    titulo: "Preguntas que siempre nos hacen",
    subtitulo: "Si su duda no está aquí, escríbanos y le respondemos el mismo día.",
  },
  faq: [
    {
      pregunta: "¿La visita de diagnóstico tiene costo?",
      respuesta:
        "No. La visita y la cotización son gratuitas y sin compromiso dentro del Valle de Aburrá. Para municipios fuera del área metropolitana cobramos el desplazamiento, y se lo descontamos si contrata la obra.",
    },
    {
      pregunta: "¿Cuánto se demoran en entregar la cotización?",
      respuesta:
        "Menos de 24 horas hábiles después de la visita. Es una cotización cerrada: el precio no cambia salvo que usted pida algo adicional por escrito.",
    },
    {
      pregunta: "¿Qué garantía dan?",
      respuesta:
        "Un año en pintura y acabados, cinco años en impermeabilización y diez años en refuerzo estructural. Todo por escrito y respaldado con póliza de cumplimiento.",
    },
    {
      pregunta: "¿Trabajan con personal propio o subcontratan?",
      respuesta:
        "Personal propio, con contrato y afiliación a seguridad social vigente. En obras estructurales sumamos un ingeniero civil matriculado que firma el diagnóstico.",
    },
    {
      pregunta: "¿Puedo pagar por cuotas?",
      respuesta:
        "Sí. Trabajamos con un anticipo del 40% para materiales y el saldo contra avances de obra. En remodelaciones grandes acordamos un plan de pagos por hitos.",
    },
  ],
  contactoHeader: {
    eyebrow: "Hablemos",
    titulo: "Cuéntenos qué necesita arreglar",
    subtitulo:
      "Déjenos sus datos y un asesor lo contacta hoy mismo. Sin compromiso y sin insistencia molesta.",
  },
};
