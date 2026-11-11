import { ArrowLeftRight, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { Badge } from "@/components/ui";
import { signOutAction } from "@/lib/auth/actions";
import {
  getDisplayName,
  getInitials,
  type SessionUser,
} from "@/lib/auth/session";

export default function AdminHeader({ user }: { user: SessionUser }) {
  const displayName = getDisplayName(user);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink text-white">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-gutter">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="Ir para o Dashboard de Gestão"
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
          >
            <Logo size="sm" inverse />
          </Link>
          <span className="hidden h-5 w-px bg-white/20 tablet:block" />
          <Badge
            label="Portal de Gestão · Indústria 4.0"
            tone="primary"
            className="hidden tablet:inline-flex"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/cliente/acompanhamento"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            <ArrowLeftRight aria-hidden size={14} />
            <span className="hidden tablet:inline">Visão do Cliente</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/6 py-1 pr-3 pl-1.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {getInitials(user.name || user.email)}
            </span>
            <div className="hidden text-left leading-tight tablet:block">
              <p className="max-w-36 truncate text-xs font-semibold text-white">
                {displayName}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-white/70">
                <ShieldCheck aria-hidden size={11} className="text-[#35C46F]" />
                <span>Role: {(user.role ?? "gestor").toUpperCase()}</span>
              </p>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sair da conta"
              title="Sair"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/12 hover:text-white"
            >
              <LogOut aria-hidden size={16} strokeWidth={1.9} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

