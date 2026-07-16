import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/session-cookie";

// En Next 16 el antiguo middleware.ts se llama proxy.ts.
//
// Aqui solo comprobamos que EXISTA la cookie: verificar la firma del JWT es
// caro y este archivo corre en cada request. La verificacion real (firma +
// expiracion) la hace requireAdmin() en el layout del panel. Es defensa en
// profundidad: el proxy corta el 99% del trafico sin sesion, el layout corta
// las cookies falsificadas.

const PREFIJOS_PROTEGIDOS = ["/admin"];
const PAGINAS_AUTH = ["/admin/login"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const tieneSesion = Boolean(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  // Si ya inicio sesion y entra al login, lo mandamos al panel.
  if (PAGINAS_AUTH.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (tieneSesion) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const esProtegida = PREFIJOS_PROTEGIDOS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (esProtegida && !tieneSesion) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
