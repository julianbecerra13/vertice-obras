"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ContadorProps {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  duracion?: number;
  className?: string;
}

/**
 * Numero que sube desde 0 cuando entra en pantalla.
 *
 * Escribe directo en el nodo del DOM (textContent) en vez de usar useState.
 * Con estado, React re-renderizaria ~60 veces por segundo por cada contador;
 * con cuatro en pantalla eso es lo que traba la pagina en un celular.
 */
export function Contador({
  valor,
  prefijo = "",
  sufijo = "",
  duracion = 2,
  className,
}: ContadorProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const enPantalla = useInView(ref, { once: true, margin: "-60px" });
  const reducir = useReducedMotion();

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || !enPantalla) return;

    if (reducir) {
      nodo.textContent = `${prefijo}${valor}${sufijo}`;
      return;
    }

    const control = animate(0, valor, {
      duration: duracion,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        nodo.textContent = `${prefijo}${Math.round(v)}${sufijo}`;
      },
    });

    return () => control.stop();
  }, [enPantalla, valor, prefijo, sufijo, duracion, reducir]);

  return (
    <span ref={ref} className={className}>
      {/* Valor inicial visible antes de animar y si JS no carga. */}
      {`${prefijo}0${sufijo}`}
    </span>
  );
}
