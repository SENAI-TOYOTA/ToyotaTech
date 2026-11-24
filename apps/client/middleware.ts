import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, TOKEN_COOKIE_KEY } from "@/lib/auth/session";

/**
 * Middleware de proteção de rotas do Portal do Cliente (`/cliente/*` e aliases)
 * e do Portal de Gestão (`/admin/*`).
 * Se não houver cookie de sessão ou token JWT, redireciona para `/login`.
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
  matcher: [
    "/cliente/:path*",
    "/acompanhamento",
    "/financiamento",
    "/garagem",
    "/perfil",
    "/loja",
    "/servicos/:path*",
    "/concessionarias",
    "/recompensas",
    "/noticias",
    "/notificacoes",
    "/admin/:path*",
    "/admin",
  ],
};
