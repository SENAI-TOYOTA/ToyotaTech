import { CarFront, FileText, Wallet, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import Logo from "@/components/brand/Logo";

const highlights: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: CarFront,
    title: "Acompanhamento do pedido",
    text: "Siga cada etapa, da fábrica até a entrega.",
  },
  {
    icon: Wallet,
    title: "Financiamento",
    text: "Parcelas, vencimentos e boletos em um só lugar.",
  },
  {
    icon: FileText,
    title: "Documentos digitais",
    text: "A documentação do seu veículo sempre à mão.",
  },
];

function BrandPanel() {
  return (
    <div className="relative h-48 overflow-hidden bg-ink tablet:h-56 wide:flex wide:h-auto wide:min-h-dvh">
      <Image
        src="/img/corollah.jpeg"
        alt="Toyota Corolla em destaque"
        fill
        priority
        quality={95}
        sizes="(min-width: 960px) 55vw, 100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/60 to-ink/40"
      />

      <div className="relative flex h-full flex-1 flex-col justify-between p-6 wide:p-12">
        <Link
          href="/"
          aria-label="Voltar para a página inicial"
          className="w-fit rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
        >
          <span className="wide:hidden">
            <Logo size="sm" inverse />
          </span>
          <span className="hidden wide:inline-flex">
            <Logo size="lg" inverse />
          </span>
        </Link>
        <div className="max-w-120">
          <p className="text-xs font-bold tracking-[2px] text-primary">
            TOYOTA PÓS-VENDA
          </p>
          <p className="mt-1.5 text-2xl leading-tight font-bold text-white tablet:text-3xl wide:mt-2 wide:text-[44px] wide:leading-12">
            Seu Toyota, do pedido à garagem.
          </p>
          <ul className="mt-8 hidden flex-col gap-4.5 wide:flex">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/18 bg-white/12 text-white backdrop-blur-xs">
                  <Icon aria-hidden size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[17px] font-semibold text-white">
                    {title}
                  </span>
                  <span className="block text-[15px] leading-5 text-fg-inverse-muted">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid flex-1 bg-surface wide:min-h-dvh wide:grid-cols-[1.12fr_1fr]">
      <BrandPanel />
      <div className="flex justify-center px-gutter py-8 tablet:py-10 wide:items-center wide:py-12">
        <div className="w-full max-w-form">
          <h1 className="text-4xl leading-9 font-bold text-fg">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-[17px] leading-6 text-fg-secondary">{subtitle}</p>
          ) : null}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

