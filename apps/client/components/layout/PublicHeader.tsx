import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-6 px-gutter">
        <Link
          href="/"
          aria-label="Ir para a página inicial"
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
        >
          <Logo size="sm" />
        </Link>

        <nav aria-label="Acesso" className="flex items-center gap-2">
          <Link href="/login" className={buttonStyles({ variant: "ghost", size: "md" })}>
            Entrar
          </Link>
          <Link href="/cadastro" className={buttonStyles({ variant: "primary", size: "md" })}>
            Cadastrar
          </Link>
        </nav>
      </div>
    </header>
  );
}

