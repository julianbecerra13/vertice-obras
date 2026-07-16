import { Nav } from "@/components/nav";
import { Contacto } from "@/components/sections/contacto";
import { Faq } from "@/components/sections/faq";
import { BotonWhatsapp, Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Proceso } from "@/components/sections/proceso";
import { Servicios } from "@/components/sections/servicios";
import { Stats } from "@/components/sections/stats";
import { Testimonios } from "@/components/sections/testimonios";
import { Trabajos } from "@/components/sections/trabajos";
import { BotonTema } from "@/components/tema";
import { getRepo } from "@/lib/repo";

// force-dynamic es imprescindible aqui: sin esto Next renderiza la pagina una
// sola vez al desplegar y el contenido queda congelado. Se editaria el titulo
// en el admin y la pagina publica no cambiaria nunca.
// El costo es una consulta por visita, asumible para este volumen.
export const dynamic = "force-dynamic";

export default async function Home() {
  const repo = await getRepo();
  const content = await repo.getContent();

  return (
    <>
      <Nav brand={content.brand} />

      <main className="flex-1">
        <Hero content={content} />
        <Stats stats={content.stats} />
        <Servicios header={content.serviciosHeader} servicios={content.servicios} />
        <Proceso header={content.procesoHeader} pasos={content.proceso} />
        <Trabajos header={content.trabajosHeader} trabajos={content.trabajos} />
        <Testimonios
          header={content.testimoniosHeader}
          testimonios={content.testimonios}
        />
        <Faq header={content.faqHeader} faq={content.faq} brand={content.brand} />
        <Contacto
          header={content.contactoHeader}
          brand={content.brand}
          servicios={content.servicios}
        />
      </main>

      <Footer brand={content.brand} />
      <BotonWhatsapp brand={content.brand} />
      <BotonTema />
    </>
  );
}
