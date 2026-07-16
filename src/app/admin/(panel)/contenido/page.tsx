import type { Metadata } from "next";
import { getRepo } from "@/lib/repo";
import { EditorContenido } from "./editor";

export const metadata: Metadata = { title: "Contenido" };

export default async function ContenidoPage() {
  const repo = await getRepo();
  const contenido = await repo.getContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-bone-50">Contenido</h1>
        <p className="mt-1 text-sm text-bone-500">
          Cambie los textos del sitio. Al guardar, la página pública se actualiza al instante.
        </p>
      </div>

      <EditorContenido inicial={contenido} />
    </div>
  );
}
