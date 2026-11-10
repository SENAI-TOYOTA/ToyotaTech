import { Bell, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { signOutAction } from "@/lib/auth/actions";
import { getDisplayName, getInitials, type SessionUser } from "@/lib/auth/session";

const iconButton =
  "flex size-10 cursor-pointer items-center justify-center rounded-full border border-border text-fg outline-none transition-colors hover:bg-surface-muted focus-visible:ring-3 focus-visible:ring-primary/30 active:bg-gray-light";

export default function ClientHeader({ user }: { user: SessionUser }) {
  const displayName = getDisplayName(user);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-6 px-gutter">
        <Link
          href="/cliente"
          aria-label="Ir para o início do painel"
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
        >
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            title="Acessar Portal de Gestão (Indústria 4.0)"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
          >
            <LayoutDashboard aria-hidden size={14} className="text-primary" />
            <span className="hidden tablet:inline">Portal Gestor</span>
          </Link>

          <button type="button" aria-label="Notificações" className={iconButton}>
            <Bell aria-hidden size={20} strokeWidth={1.8} />
          </button>

          <Link
            href="/cliente/perfil"
            aria-label={`Abrir perfil de ${displayName}`}
            className="flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
          >
            <span className="hidden max-w-40 truncate text-sm font-medium text-fg-secondary tablet:block">
              {displayName}
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-ink text-[15px] font-semibold tracking-[0.5px] text-white">
              {getInitials(user.name || user.email)}
            </span>
          </Link>

          <form action={signOutAction}>
            <button type="submit" aria-label="Sair da conta" title="Sair" className={iconButton}>
              <LogOut aria-hidden size={18} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

