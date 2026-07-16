import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { TablaLeads } from "./tabla-leads";

export const metadata: Metadata = { title: "Solicitudes" };

export default async function LeadsPage() {
  const repo = await getRepo();
  const leads = await repo.listLeads();

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-bone-50">Solicitudes</h1>
          <p className="mt-1 text-sm text-bone-500">
            {leads.length === 0
              ? "Aquí aparece todo el que llene el formulario de contacto."
              : `${leads.length} ${leads.length === 1 ? "persona se ha inscrito" : "personas se han inscrito"} desde el sitio.`}
          </p>
        </div>

        {leads.length > 0 && (
          <a
            href="/admin/leads/csv"
            download
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-linea px-4 py-2 text-xs font-medium text-bone-200 transition-colors hover:border-brand-500/40 hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar a Excel (CSV)
          </a>
        )}
      </div>

      <TablaLeads leads={leads} />
    </div>
  );
}
