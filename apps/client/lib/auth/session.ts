/**
 * Sessão do portal Toyota Tech (Cliente e Gestor).
 */
export const SESSION_COOKIE = "toyotatech.session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h

export type UserRole = "cliente" | "gestor" | "admin";

/** Subconjunto de `AuthUser` com suporte a perfil/role de acesso. */
export interface SessionUser {
  email: string;
  name: string;
  role?: UserRole;
}

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

export function decodeSession(raw: string | undefined): SessionUser | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as Partial<SessionUser>;

    if (typeof parsed.email !== "string" || !parsed.email.includes("@")) {
      return null;
    }

    const inferredRole: UserRole =
      parsed.role ??
      (parsed.email.includes("admin") || parsed.email.includes("gestor")
        ? "gestor"
        : "cliente");

    return {
      email: parsed.email,
      name: parsed.name?.trim() || "",
      role: inferredRole,
    };
  } catch {
    return null;
  }
}

export function getDisplayName(user: SessionUser): string {
  return user.name || user.email.split("@")[0];
}

export function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "T";
  }
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
