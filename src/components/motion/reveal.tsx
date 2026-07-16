"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Primitivas de aparicion al hacer scroll.
// Todas respetan prefers-reduced-motion via useReducedMotion.
// viewport once:true -> cada elemento se anima UNA vez; sin eso, la pagina
// re-anima al subir y bajar y se siente barata.

const SALIDA = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos. Util para escalonar hermanos. */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  duracion?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duracion = 0.7,
}: RevealProps) {
  const reducir = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducir ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reducir ? 0.2 : duracion, delay, ease: SALIDA }}
    >
      {children}
    </motion.div>
  );
}

interface RevealTextoProps {
  texto: string;
  /** Palabras finales que se pintan con el degradado de marca. */
  resaltado?: string;
  className?: string;
  claseResaltado?: string;
  delay?: number;
  /** Etiqueta a renderizar. Por defecto h2. */
  as?: "h1" | "h2" | "h3" | "p";
}

/**
 * Titular que aparece palabra por palabra.
 * Cada palabra es un span animado; el texto sigue siendo seleccionable y
 * legible para lectores de pantalla porque no partimos por letras.
 */
export function RevealTexto({
  texto,
  resaltado,
  className,
  claseResaltado,
  delay = 0,
  as: Tag = "h2",
}: RevealTextoProps) {
  const reducir = useReducedMotion();
  const palabras = texto.split(" ").filter(Boolean);
  const palabrasResaltadas = resaltado ? resaltado.split(" ").filter(Boolean) : [];

  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={cn("[text-wrap:balance]", className)}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: reducir ? 0 : 0.055, delayChildren: delay }}
      aria-label={resaltado ? `${texto} ${resaltado}` : texto}
    >
      {palabras.map((palabra, i) => (
        <motion.span
          key={`p-${i}`}
          className="inline-block"
          aria-hidden
          variants={{
            oculto: reducir
              ? { opacity: 0 }
              : { opacity: 0, y: "0.45em", rotateX: -55 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: reducir ? 0.2 : 0.65, ease: SALIDA },
            },
          }}
        >
          {palabra}
          {" "}
        </motion.span>
      ))}

      {palabrasResaltadas.map((palabra, i) => (
        <motion.span
          key={`r-${i}`}
          className={cn("texto-marca inline-block", claseResaltado)}
          aria-hidden
          variants={{
            oculto: reducir
              ? { opacity: 0 }
              : { opacity: 0, y: "0.45em", rotateX: -55 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: reducir ? 0.2 : 0.65, ease: SALIDA },
            },
          }}
        >
          {palabra}
          {i < palabrasResaltadas.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Segundos entre cada hijo. */
  paso?: number;
  delay?: number;
}

/** Contenedor que escalona la entrada de sus hijos directos <StaggerItem>. */
export function Stagger({ children, className, paso = 0.09, delay = 0 }: StaggerProps) {
  const reducir = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: "-70px" }}
      transition={{ staggerChildren: reducir ? 0 : paso, delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reducir = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        oculto: reducir ? { opacity: 0 } : { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reducir ? 0.2 : 0.6, ease: SALIDA },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
