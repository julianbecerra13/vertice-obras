import { Contador } from "@/components/motion/contador";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { Stat } from "@/lib/content";
import { cn } from "@/lib/utils";

// Barra de confianza entre el hero y los servicios.

export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-y border-linea bg-ink-900">
      <Stagger
        className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-5 py-14 sm:grid-cols-4 sm:gap-y-0 sm:px-8 sm:py-16"
        paso={0.1}
      >
        {stats.map((s, i) => (
          <StaggerItem
            key={s.label}
            // El separador solo existe donde las cuatro columnas van en una
            // fila; en movil (2 columnas) partiria la rejilla por la mitad.
            className={cn(
              "px-2 text-center sm:px-6",
              i > 0 && "sm:border-l sm:border-linea",
            )}
          >
            <Contador
              valor={s.valor}
              prefijo={s.prefijo}
              sufijo={s.sufijo}
              // tabular-nums: sin esto el ancho del numero salta en cada
              // fotograma de la cuenta y el texto de abajo tiembla.
              className="block text-4xl font-semibold tracking-tight tabular-nums text-bone-50 sm:text-5xl"
            />
            <p className="mt-2 text-xs tracking-wide text-bone-500 uppercase sm:text-sm">
              {s.label}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
