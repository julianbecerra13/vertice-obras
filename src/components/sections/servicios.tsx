import { Check } from "lucide-react";
import { ICONOS } from "@/components/iconos";
import { Reveal, RevealTexto, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TarjetaSpotlight } from "@/components/motion/tarjeta-spotlight";
import type { SectionHeader, Service } from "@/lib/content";

export function Servicios({
  header,
  servicios,
}: {
  header: SectionHeader;
  servicios: Service[];
}) {
  return (
    <section id="servicios" className="bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal y={16}>
          <p className="text-xs font-medium tracking-[0.2em] text-brand-400 uppercase">
            {header.eyebrow}
          </p>
        </Reveal>

        <RevealTexto
          as="h2"
          texto={header.titulo}
          delay={0.1}
          className="mt-4 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-bone-50 sm:text-5xl"
        />

        <Reveal delay={0.25} y={16}>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bone-400 [text-wrap:pretty]">
            {header.subtitulo}
          </p>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio) => {
            const Icono = ICONOS[servicio.icono];

            return (
              // h-full en la tarjeta: la rejilla estira el item, la tarjeta
              // debe llenarlo o las de texto corto quedan flotando.
              <StaggerItem key={servicio.id} className="h-full">
                <TarjetaSpotlight className="flex h-full flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition-transform duration-300 ease-out-expo group-hover:-rotate-6 group-hover:scale-110">
                      <Icono className="h-5 w-5" />
                    </span>

                    {servicio.destacado && (
                      <span className="rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-brand-400 uppercase">
                        Más solicitado
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-bone-50">
                    {servicio.titulo}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-bone-400 [text-wrap:pretty]">
                    {servicio.descripcion}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-linea pt-5">
                    {servicio.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 text-sm text-bone-400"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </TarjetaSpotlight>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
