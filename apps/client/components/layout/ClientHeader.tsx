import { Bell, LayoutDashboard } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { ClientHeaderNav, ClientHeaderSubNav } from "@/components/layout/ClientNav";
import SignOutButton from "@/components/layout/SignOutButton";
import { getDisplayName, getInitials, type SessionUser } from "@/lib/auth/session";

const iconButton =
  "flex size-9.5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-fg outline-none transition-colors hover:bg-surface-muted focus-visible:ring-3 focus-visible:ring-primary/30 active:bg-gray-light";

export default function ClientHeader({ user }: { user: SessionUser }) {
  const displayName = getDisplayName(user);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-gutter">
        <Link
          href="/cliente"
          aria-label="Ir para o início do painel"
          className="shrink-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
        >
          <Logo size="sm" />
        </Link>

        <ClientHeaderNav />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/admin"
            title="Acessar Portal de Gestão (Indústria 4.0)"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-fg-secondary transition-colors hover:border-border-strong hover:text-fg xl:px-3"
          >
            <LayoutDashboard aria-hidden size={14} className="shrink-0 text-primary" />
            <span className="hidden tablet:inline wide:hidden xl:inline">Portal Gestor</span>
          </Link>

          <Link
            href="/cliente/notificacoes"
            aria-label="Notificações"
            title="Notificações"
            className={iconButton}
          >
            <Bell aria-hidden size={19} strokeWidth={1.8} />
          </Link>

          <Link
            href="/cliente/perfil"
            aria-label={`Abrir perfil de ${displayName}`}
            title={displayName}
            className="flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
          >
            <span className="hidden max-w-32 truncate text-sm font-medium text-fg-secondary tablet:block wide:hidden 2xl:block">
              {displayName}
            </span>
            <span className="flex size-9.5 items-center justify-center rounded-full bg-ink text-sm font-semibold tracking-[0.5px] text-white">
              {getInitials(user.name || user.email)}
            </span>
          </Link>

          <SignOutButton className={iconButton} />
        </div>
      </div>

      <ClientHeaderSubNav />
    </header>
  );
}

