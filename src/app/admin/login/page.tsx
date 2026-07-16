import type { Metadata } from "next";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

// En Next 16 searchParams es una promesa: hay que esperarla.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <main className="textura-grano relative flex min-h-svh items-center justify-center overflow-hidden bg-ink-950 px-5 py-12">
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-brand-500/8 blur-[120px]"
      />
      <FormularioLogin redirectTo={redirect} />
    </main>
  );
}
