import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { LEAD_ESTADO_LABEL } from "@/lib/leads";
import { getRepo } from "@/lib/repo";

// Los route handlers NO pasan por el layout del panel, asi que la sesion se
// verifica aqui explicitamente. Sin esto, la URL del CSV expondria todos los
// datos de contacto a cualquiera que la adivine.

/**
 * Escapa un valor para CSV.
 *
 * Ademas de las comillas, neutralizamos = + - @ al inicio: Excel los trata
 * como formulas, no como texto (CSV injection). Prefijar con apostrofo obliga
 * a interpretarlos como texto.
 */
function celda(valor: string | null): string {
  const texto = (valor ?? "").replace(/\r?\n/g, " ").trim();
  const seguro = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

function fecha(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const repo = await getRepo();
  const leads = await repo.listLeads();

  const encabezado = [
    "Fecha",
    "Nombre",
    "Teléfono",
    "Correo",
    "Servicio",
    "Estado",
    "Mensaje",
  ];

  const filas = leads.map((l) =>
    [
      celda(fecha(l.createdAt)),
      celda(l.nombre),
      celda(l.telefono),
      celda(l.email),
      celda(l.servicio),
      celda(LEAD_ESTADO_LABEL[l.estado]),
      celda(l.mensaje),
    ].join(","),
  );

  // El BOM es obligatorio para que Excel en Windows lea las tildes bien.
  const csv = "﻿" + [encabezado.map(celda).join(","), ...filas].join("\r\n");

  const hoy = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="solicitudes-vertice-${hoy}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
