"use client";

import {
  ArrowRight,
  Award,
  CalendarCheck,
  LifeBuoy,
  MapPin,
  Newspaper,
  ShieldCheck,
  ShoppingBag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { buttonStyles, Card, ListRow, ProgressBar, type ListRowIconTone } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  CURRENT_MILEAGE,
  formatCurrency,
  formatNumber,
  getNextMaintenance,
} from "@/lib/mocks/aftersales";
import { useAppSelector } from "@/store";

const serviceLinks: {
  href: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: ListRowIconTone;
}[] = [
  { href: "/cliente/servicos/revisoes", title: "Plano de revisões", subtitle: "Revisões programadas, preços e histórico", icon: Wrench, tone: "primary" },
  { href: "/cliente/servicos/agendamento", title: "Agendar serviço", subtitle: "Escolha concessionária, data e horário", icon: CalendarCheck, tone: "primary" },
  { href: "/cliente/servicos/garantia", title: "Garantia", subtitle: "Cobertura e validade do seu Toyota", icon: ShieldCheck, tone: "success" },
  { href: "/cliente/servicos/assistencia", title: "Assistência 24 horas", subtitle: "Guincho, pneu furado, bateria e mais", icon: LifeBuoy, tone: "warning" },
  { href: "/cliente/concessionarias", title: "Concessionárias", subtitle: "Mapa, contatos e como chegar", icon: MapPin, tone: "neutral" },
  { href: "/cliente/loja", title: "Loja Toyota", subtitle: "Acessórios originais e a coleção Toyota", icon: ShoppingBag, tone: "primary" },
  { href: "/cliente/recompensas", title: "Pontos e recompensas", subtitle: "Selos, recompensas e como ganhar pontos", icon: Award, tone: "success" },
  { href: "/cliente/noticias", title: "Notícias e vídeos", subtitle: "Veja como seu Toyota é feito e entregue", icon: Newspaper, tone: "info" },
];

export default function ServicesView() {
  const next = getNextMaintenance();
  const remaining = Math.max(next.mileage - CURRENT_MILEAGE, 0);
  const booking = useAppSelector((state) => state.engagement.bookings[0]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pós-venda"
        title="Serviços"
        description="Tudo o que você precisa para manter seu Toyota em perfeito estado."
      />
      <div className="grid items-start gap-5 wide:grid-cols-[340px_1fr]">
        <section className="rounded-2xl bg-ink p-6 text-white">
          <p className="text-xs font-bold tracking-[2px] text-primary uppercase">Próxima revisão</p>
          <h2 className="mt-2 text-[28px] leading-8 font-bold">{next.title}</h2>
          <p className="mt-1 text-fg-inverse-muted">
            Em cerca de {formatNumber(remaining)} km ou {next.months} meses · {formatCurrency(next.price)}
          </p>
          <ProgressBar value={CURRENT_MILEAGE / next.mileage} tone="inverse" label="Quilometragem até a revisão" className="mt-5" />
          <p className="mt-2 text-sm text-fg-inverse-muted">
            {formatNumber(CURRENT_MILEAGE)} km de {formatNumber(next.mileage)} km
          </p>
          {booking ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-white/8 p-3 text-sm">
              <CalendarCheck aria-hidden size={16} className="shrink-0" />
              Agendado: {booking.date} às {booking.time}, {booking.dealership}
            </p>
          ) : null}
          <Link
            href="/cliente/servicos/agendamento"
            className={buttonStyles({ fullWidth: true, className: "mt-5" })}
          >
            {booking ? "Agendar outro serviço" : "Agendar esta revisão"}
            <ArrowRight aria-hidden size={20} />
          </Link>
        </section>

        <Card padded={false}>
          <ul className="grid tablet:grid-cols-2">
            {serviceLinks.map((link, index) => (
              <li
                key={link.href}
                className={cn(
                  index > 0 && "border-t border-border",
                  index === 1 && "tablet:border-t-0",
                  index % 2 === 1 && "tablet:border-l tablet:border-border",
                )}
              >
                <ListRow
                  icon={link.icon}
                  iconTone={link.tone}
                  title={link.title}
                  subtitle={link.subtitle}
                  href={link.href}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
