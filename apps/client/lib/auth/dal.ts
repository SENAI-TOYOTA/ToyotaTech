import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { TOKEN_COOKIE_KEY } from "@/store/api";

import {
  decodeSession,
  SESSION_COOKIE,
  type SessionUser,
  type UserRole,
} from "./session";

function inferRoleFromEmail(email: string, explicitRole?: string): UserRole {
  if (explicitRole === "admin" || explicitRole === "gestor") {
    return explicitRole;
  }
  const lower = email.toLowerCase();
  if (lower.includes("admin") || lower.includes("gestor")) {
    return "gestor";
  }
  return "cliente";
}

function decodeJwtPayload(token: string): SessionUser | null {
  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const padded =
        parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
      const decoded = JSON.parse(
        Buffer.from(padded, "base64").toString("utf8"),
      ) as {
        email?: string;
        name?: string;
        unique_name?: string;
        role?: string;
      };
      const email =
        decoded.email ?? decoded.unique_name ?? "cliente@toyota.com.br";
      return {
        email,
        name: decoded.name ?? email.split("@")[0],
        role: inferRoleFromEmail(email, decoded.role),
      };
    }
  } catch {
    // Fallback para tokens opacos ou simulados em dev (`dev-jwt-...`)
  }

  if (token.startsWith("dev-jwt-")) {
    try {
      const raw = Buffer.from(
        token.slice("dev-jwt-".length),
        "base64",
      ).toString("utf8");
      if (raw.includes("@")) {
        return {
          email: raw,
          name: raw.split("@")[0],
          role: inferRoleFromEmail(raw),
        };
      }
    } catch {
      // Ignora erro de decodificação
    }
  }

  return {
    email: "cliente@toyota.com.br",
    name: "Cliente Toyota",
    role: "cliente",
  };
}

/**
 * Data Access Layer de autenticação (servidor).
 * Verifica tanto o cookie de sessão quanto o cookie JWT (`toyotatech.token`).
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionCookie) {
    const decoded = decodeSession(sessionCookie);
    if (decoded) {
      return decoded;
    }
  }

  const jwtCookie =
    cookieStore.get(TOKEN_COOKIE_KEY)?.value ??
    cookieStore.get("token")?.value;
  if (jwtCookie) {
    return decodeJwtPayload(jwtCookie);
  }

  return null;
});

/**
 * Garante que há um usuário autenticado; caso contrário redireciona ao login.
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Simula a proteção de rota do Portal de Gestão (`(admin)`).
 * Verifica se há sessão ativa e promove/valida o perfil de gestor industrial.
 */
export async function requireAdminSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect("/login?redirect=/admin");
  }

  return {
    ...user,
    role: user.role === "admin" ? "admin" : "gestor",
  };
}
