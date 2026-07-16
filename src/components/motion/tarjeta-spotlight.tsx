"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TarjetaSpotlightProps {
  children: ReactNode;
  className?: string;
  /** Color del halo que sigue al cursor. */
  color?: string;
}

/**
 * Tarjeta con un halo de luz que sigue al cursor.
 *
 * Las coordenadas viven en MotionValues, no en estado de React: el halo se
 * mueve sin re-renderizar el componente en cada pixel del mouse.
 * En tactil no hay hover, asi que simplemente no se activa.
 */
export function TarjetaSpotlight({
  children,
  className,
  color = "rgb(245 158 11 / 0.14)",
}: TarjetaSpotlightProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reducir = useReducedMotion();

  const fondo = useMotionTemplate`radial-gradient(340px circle at ${x}px ${y}px, ${color}, transparent 70%)`;

  return (
    <div
      className={cn(
        "group borde-degradado relative overflow-hidden rounded-2xl bg-ink-850/60",
        className,
      )}
      onPointerMove={(e) => {
        if (reducir || e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
    >
      {!reducir && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: fondo }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
