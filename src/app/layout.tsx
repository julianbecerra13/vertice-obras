import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProveedorTema } from "@/components/tema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Los metadatos usan el contenido por defecto a proposito: son estaticos y
// no justifican una consulta a la base en cada request.
export const metadata: Metadata = {
  title: {
    default: "Vértice Obras | Construcción y reformas en Medellín",
    template: "%s | Vértice Obras",
  },
  description:
    "Pintura, plomería, redes eléctricas y refuerzo estructural con personal propio y garantía por escrito. Cotización gratis en menos de 24 horas.",
  keywords: [
    "reformas Medellín",
    "pintura de fachadas",
    "plomería",
    "refuerzo estructural",
    "remodelación",
    "impermeabilización",
  ],
  openGraph: {
    title: "Vértice Obras | Construcción y reformas de alto estándar",
    description:
      "Más de 840 obras entregadas en Antioquia. Cotización cerrada en menos de 24 horas.",
    locale: "es_CO",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08070a" },
    { media: "(prefers-color-scheme: light)", color: "#fdfcfa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning es obligatorio con next-themes: el script que
    // aplica el tema guardado corre antes de que React hidrate y modifica el
    // atributo data-theme del <html>. Sin esto React avisaria de un desajuste
    // que en realidad es esperado.
    <html
      lang="es-CO"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-950">
        <ProveedorTema>{children}</ProveedorTema>
      </body>
    </html>
  );
}
