import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BotonTema } from "@/components/tema";
import { getCurrentAdmin } from "@/lib/auth";
import { NavAdmin } from "./nav-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// El panel siempre se renderiza en el momento: muestra datos vivos (leads) y
// depende de la cookie de sesion.
export const dynamic = "force-dynamic";

// Este layout envuelve solo al grupo (panel), no a /admin/login.
// Por eso el login puede vivir bajo /admin sin exigir sesion para verse.
//
// Aqui se hace la verificacion REAL del JWT (firma + expiracion). El proxy solo
// mira que la cookie exista; una cookie falsificada llega hasta aqui y muere.
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-svh flex-col bg-ink-950">
      <NavAdmin usuario={admin.username} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <BotonTema />
    </div>
  );
}
