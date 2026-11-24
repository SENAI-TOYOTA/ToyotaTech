"use client";

import { ArrowUpRight, CloudOff, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import VehicleHero from "@/components/garage/VehicleHero";
import DynamicGreeting from "@/components/home/DynamicGreeting";
import { clientNavItems } from "@/components/layout/client-nav";
import { Badge, Button, Card, EmptyState, type BadgeTone } from "@/components/ui";
import { setSimulateApiError } from "@/store/api";
import { useGetVeiculoQuery } from "@/store/slices/garageSlice";

const shortcutDescriptions: Record<string, string> = {
  "/cliente/acompanhamento": "Acompanhe cada etapa da entrega",
  "/cliente/garagem": "Documentos digitais e recalls",
  "/cliente/financiamento": "Parcelas, vencimentos e simulador 3D",
  "/cliente/servicos": "Revisões, garantia e assistência 24h",
  "/cliente/loja": "Acessórios originais Toyota",
  "/cliente/recompensas": "Seus pontos, selos e vouchers",
  "/cliente/noticias": "Vídeos de como seu Toyota é feito",
  "/cliente/perfil": "Seus dados pessoais e preferências",
};

const highlightCards: {
  id: string;
  title: string;
  caption: string;
  image: string;
  href: string;
}[] = [
  {
    id: "news",
    title: "Como seu Toyota é feito",
    caption: "Notícias e vídeos",
    image: "/img/corollah.jpeg",
    href: "/cliente/noticias",
  },
  {
    id: "store",
    title: "Toyota Store",
    caption: "Acessórios originais",
    image: "/img/GR.jpg",
    href: "/cliente/loja",
  },
  {
    id: "rewards",
    title: "Toyota Rewards",
    caption: "Pontos e selos",
    image: "/img/corolla.webp",
    href: "/cliente/recompensas",
  },
  {
    id: "services",
    title: "Serviços Toyota",
    caption: "Cuidados com o carro",
    image: "/img/MM.jpg",
    href: "/cliente/servicos",
  },
];

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

function HeroSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando destaque do veículo"
      className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-3xl bg-ink shadow-raised wide:min-h-[360px] wide:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <div className="order-1 min-h-[260px] animate-pulse bg-ink-soft wide:order-2 wide:min-h-[360px]" />
      <div className="order-2 flex min-w-0 flex-col justify-center gap-4 p-6 wide:order-1 wide:p-7">
        <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
        <div className="h-9 w-3/4 animate-pulse rounded-lg bg-white/15" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="mt-4 flex gap-3">
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/15" />
          <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function ClienteHomeContent({ userName }: { userName: string }) {
  const {
    data: garage,
    isLoading,
    isError,
    refetch,
  } = useGetVeiculoQuery();

  const shortcuts = clientNavItems.filter(
    (item) => item.href in shortcutDescriptions,
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <DynamicGreeting name={userName} />

      {isLoading && !garage ? (
        <HeroSkeleton />
      ) : isError && !garage ? (
        <Card>
          <EmptyState
            icon={CloudOff}
            title="Não foi possível carregar os dados do seu Toyota"
            description="Verifique sua conexão e tente sincronizar novamente."
            action={
              <Button
                size="md"
                fullWidth
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  setSimulateApiError(false);
                  void refetch();
                }}
              >
                Tentar novamente
              </Button>
            }
          />
        </Card>
      ) : (
        <VehicleHero garage={garage ?? null} />
      )}

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

      <section aria-label="Destaques para você" className="mt-2">
        <h2 className="mb-3.5 text-[22px] font-bold text-fg">
          Destaques para você
        </h2>
        <div className="grid gap-3.5 tablet:grid-cols-2 wide:grid-cols-4">
          {highlightCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl bg-ink p-4 shadow-card transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-primary/30"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(min-width: 960px) 260px, (min-width: 720px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/35 to-transparent"
              />
              <div className="relative z-10">
                <p className="text-[11px] font-semibold tracking-[0.7px] text-fg-inverse-muted uppercase">
                  {card.caption}
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-white">
                  {card.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
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
