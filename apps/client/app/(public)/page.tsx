import {
  ArrowRight,
  CarFront,
  Factory,
  FileText,
  PackageCheck,
  Radio,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge, buttonStyles, Card, ProgressBar } from "@/components/ui";

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Factory,
    title: "Esteira em tempo real",
    text: "Sensores IIoT da linha de produção mostram em qual etapa o seu Toyota está agora.",
  },
  {
    icon: CarFront,
    title: "Garagem digital",
    text: "Dados do veículo, revisões e histórico de manutenção sempre atualizados.",
  },
  {
    icon: Wallet,
    title: "Financiamento",
    text: "Parcelas, vencimentos e boletos organizados em um só lugar.",
  },
  {
    icon: FileText,
    title: "Documentos",
    text: "Nota fiscal, manual e documentação do veículo disponíveis a qualquer momento.",
  },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: PackageCheck,
    title: "Pedido confirmado",
    text: "Seu pedido é vinculado à sua conta assim que a concessionária o registra.",
  },
  {
    icon: Radio,
    title: "Produção monitorada",
    text: "Cada estação da fábrica envia o status do veículo para o seu painel.",
  },
  {
    icon: Truck,
    title: "Entrega e pós-venda",
    text: "Acompanhe o transporte e, depois, toda a vida útil do seu carro.",
  },
];

/** Prévia estática do card de acompanhamento (ilustrativa). */
function TrackingPreview() {
  return (
    <Card className="w-full max-w-sm shadow-raised" as="div">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[1px] text-fg-muted uppercase">
            Pedido #TT-2048
          </p>
          <p className="mt-0.5 text-xl font-semibold text-fg">Corolla Cross XRE</p>
        </div>
        <Badge label="Em produção" tone="info" />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <span className="text-sm text-fg-secondary">Etapa atual: Pintura</span>
        <span className="text-sm font-semibold text-fg">62%</span>
      </div>
      <ProgressBar value={0.62} className="mt-2" label="Progresso da produção" />
      <p className="mt-4 text-[13px] text-fg-muted">Atualizado há 2 minutos · dados ilustrativos</p>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <Image
          src="/img/corollah.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" />

        <div className="relative mx-auto grid w-full max-w-content items-center gap-12 px-gutter py-16 wide:grid-cols-[1.2fr_1fr] wide:py-24">
          <div>
            <p className="text-xs font-bold tracking-[2px] text-primary">TOYOTA PÓS-VENDA</p>
            <h1 className="mt-3 text-4xl font-bold tablet:text-display">
              Seu Toyota, do pedido à garagem.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-7 text-fg-inverse-muted">
              O Toyota Tech conecta a fábrica ao cliente: acompanhe a produção do seu veículo em
              tempo real e gerencie financiamento, documentos e manutenção em um só lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 tablet:flex-row">
              <Link href="/cadastro" className={buttonStyles({ variant: "primary" })}>
                Criar minha conta
                <ArrowRight aria-hidden size={20} strokeWidth={2.4} />
              </Link>
              <Link href="/login" className={buttonStyles({ variant: "inverse" })}>
                Já sou cliente
              </Link>
            </div>
          </div>

          <div className="flex justify-center wide:justify-end">
            <TrackingPreview />
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="mx-auto w-full max-w-content px-gutter py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-fg tablet:text-4xl">Tudo sobre o seu carro</h2>
          <p className="mt-2 text-[17px] leading-6 text-fg-secondary">
            Uma experiência única de pós-venda, do primeiro parafuso à próxima revisão.
          </p>
        </div>

        <ul className="mt-8 grid gap-4 tablet:grid-cols-2 wide:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Card as="article" className="h-full">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon aria-hidden size={22} strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-fg">{title}</h3>
                <p className="mt-1 text-[15px] leading-5 text-fg-secondary">{text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Como funciona */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-content px-gutter py-16">
          <h2 className="text-2xl font-bold text-fg tablet:text-4xl">Como funciona</h2>
          <ol className="mt-8 grid gap-8 wide:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                  <Icon aria-hidden size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-xs font-bold tracking-[1.5px] text-fg-muted">
                    PASSO {index + 1}
                  </p>
                  <h3 className="text-xl font-semibold text-fg">{title}</h3>
                  <p className="mt-1 text-[15px] leading-5 text-fg-secondary">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto w-full max-w-content px-gutter py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-white tablet:flex-row tablet:items-center tablet:p-10">
          <div>
            <h2 className="text-2xl font-bold tablet:text-4xl">Pronto para acompanhar o seu Toyota?</h2>
            <p className="mt-1 text-[17px] text-white/85">Crie sua conta em menos de um minuto.</p>
          </div>
          <Link
            href="/cadastro"
            className={buttonStyles({
              variant: "secondary",
              className: "w-full tablet:w-auto",
            })}
          >
            Começar agora
          </Link>
        </div>
      </section>
    </>
  );
}

