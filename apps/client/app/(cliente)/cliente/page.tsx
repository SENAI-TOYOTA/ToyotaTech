import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import VehicleHero from "@/components/garage/VehicleHero";
import { clientNavItems } from "@/components/layout/client-nav";
import PageHeader from "@/components/layout/PageHeader";
import { Badge, type BadgeTone } from "@/components/ui";
import { requireSession } from "@/lib/auth/dal";
import { getDisplayName } from "@/lib/auth/session";
import { MOCK_GARAGE_DATA } from "@/lib/mocks/garage";

export const metadata: Metadata = { title: "Início" };

const shortcutDescriptions: Record<string, string> = {
  "/cliente/acompanhamento": "Acompanhe cada etapa da entrega",
  "/cliente/garagem": "Documentos digitais e recalls",
  "/cliente/financiamento": "Parcelas, vencimentos e boletos",
  "/cliente/servicos": "Revisões, garantia e assistência 24h",
  "/cliente/loja": "Acessórios originais Toyota",
  "/cliente/recompensas": "Seus pontos, selos e vouchers",
  "/cliente/noticias": "Vídeos de como seu Toyota é feito",
  "/cliente/perfil": "Seus dados pessoais e preferências",
};

const toyotaTips: {
  id: string;
  title: string;
  description: string;
  category: string;
  tone: BadgeTone;
}[] = [
  {
    id: "tip-1",
    title: "Economia híbrida",
    description:
      "Dicas para aproveitar ao máximo o modo elétrico do seu Corolla.",
    category: "Manutenção",
    tone: "success",
  },
  {
    id: "tip-2",
    title: "Toyota Safety Sense",
    description: "Saiba como funcionam os radares de pré-colisão.",
    category: "Tecnologia",
    tone: "info",
  },
  {
    id: "tip-3",
    title: "Acessórios originais",
    description:
      "Personalize seu Toyota com garantia e qualidade de fábrica.",
    category: "Estilo",
    tone: "primary",
  },
];

export default async function ClienteHomePage() {
  const user = await requireSession();
  const shortcuts = clientNavItems.filter(
    (item) => item.href in shortcutDescriptions,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Painel do cliente"
        title={`Olá de novo, ${getDisplayName(user)}`}
        description="Tudo sobre o seu Toyota em um só lugar."
      />

      <VehicleHero garage={MOCK_GARAGE_DATA} />

      <section aria-label="Acesso rápido">
        <ul className="grid gap-3 tablet:grid-cols-2 wide:grid-cols-4">
          {shortcuts.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex min-h-[132px] flex-col rounded-2xl border border-border bg-surface p-4 shadow-card transition-all outline-none hover:-translate-y-0.5 hover:border-border-strong focus-visible:ring-3 focus-visible:ring-primary/30 active:bg-surface-muted"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon aria-hidden size={20} strokeWidth={1.9} />
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    size={18}
                    strokeWidth={1.8}
                    className="text-fg-muted transition-colors group-hover:text-fg"
                  />
                </div>
                <span className="mt-3.5 text-[17px] font-semibold text-fg">
                  {label}
                </span>
                <span className="mt-0.5 text-sm leading-[19px] text-fg-secondary">
                  {shortcutDescriptions[href]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Guias e novidades" className="mt-2">
        <h2 className="mb-3.5 text-[22px] font-bold text-fg">
          Guias e novidades
        </h2>
        <div className="grid gap-3 tablet:grid-cols-3">
          {toyotaTips.map((tip) => (
            <article
              key={tip.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <Badge label={tip.category} tone={tip.tone} />
              <h3 className="mt-3 text-lg font-semibold text-fg">
                {tip.title}
              </h3>
              <p className="mt-1 text-[15px] leading-[21px] text-fg-secondary">
                {tip.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
