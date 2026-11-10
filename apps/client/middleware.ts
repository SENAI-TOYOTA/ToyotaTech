import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";
import { TOKEN_COOKIE_KEY } from "@/store/api";

/**
 * Middleware de proteção de rotas do Portal do Cliente (`/cliente/*`)
 * e do Portal de Gestão (`/admin/*`).
 * Se o token JWT não existir nos cookies, redireciona para `/login`.
 */
export function middleware(request: NextRequest) {
  const jwtToken =
    request.cookies.get(TOKEN_COOKIE_KEY)?.value ??
    request.cookies.get("token")?.value ??
    request.cookies.get(SESSION_COOKIE)?.value;

  if (!jwtToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cliente/:path*", "/admin/:path*", "/admin"],
};
