import { CarFront, FileText, Wallet, type LucideIcon } from "lucide-react";
import Image from "next/image";
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

/** Painel de marca exibido ao lado dos formulários em telas largas. */
function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-ink wide:flex">
      <Image
        src="/img/corolla.webp"
        alt=""
        fill
        priority
        sizes="55vw"
        className="object-cover opacity-90"
      />
      <div aria-hidden className="absolute inset-0 bg-ink/62" />

      <div className="relative flex flex-1 flex-col justify-between p-12">
        <Logo size="lg" inverse />
        <div className="max-w-120">
          <p className="text-xs font-bold tracking-[2px] text-primary">TOYOTA PÓS-VENDA</p>
          <p className="mt-2 text-[44px] leading-12 font-bold text-white">
            Seu Toyota, do pedido à garagem.
          </p>
          <ul className="mt-8 flex flex-col gap-4.5">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/16 bg-white/12 text-white">
                  <Icon aria-hidden size={18} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[17px] font-semibold text-white">{title}</span>
                  <span className="block text-[15px] leading-5 text-fg-inverse-muted">{text}</span>
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

/** Equivalente web de `AuthScreenLayout` (apps/mobile/app/(auth)/_layout.tsx). */
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid flex-1 bg-surface wide:grid-cols-[1.1fr_1fr]">
      <BrandPanel />
      <div className="flex justify-center px-gutter py-10 wide:items-center wide:py-12">
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

