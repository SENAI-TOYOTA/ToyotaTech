import { ArrowRight, CalendarCheck, CheckCircle2, Gauge, Wrench } from "lucide-react";
import Link from "next/link";

import { Badge, buttonStyles, Card, ProgressBar } from "@/components/ui";
import { CURRENT_MILEAGE, MAINTENANCE_PLAN } from "@/lib/mocks/aftersales";

export default function MaintenanceSummaryCard() {
  const nextRevision =
    MAINTENANCE_PLAN.find((item) => item.mileage > CURRENT_MILEAGE) ??
    MAINTENANCE_PLAN[0];
  const remainingKm = Math.max(nextRevision.mileage - CURRENT_MILEAGE, 0);
  const progress = Math.min(CURRENT_MILEAGE / nextRevision.mileage, 1);

  return (
    <Card
      title="Plano de revisões"
      subtitle="Acompanhe a próxima manutenção programada do seu Toyota."
      action={
        <Badge
          label={`${CURRENT_MILEAGE.toLocaleString("pt-BR")} km atuais`}
          tone="info"
        />
      }
    >
      <div className="flex flex-col gap-5 wide:flex-row wide:items-center wide:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Wrench aria-hidden size={20} strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[1px] text-fg-muted uppercase">
                Próxima revisão recomendada
              </p>
              <h3 className="text-lg font-bold text-fg">
                {nextRevision.title} ·{" "}
                <span className="text-primary">
                  R$ {nextRevision.price.toLocaleString("pt-BR")},00
                </span>
              </h3>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-fg-secondary">
              <span className="inline-flex items-center gap-1">
                <Gauge aria-hidden size={14} />
                Faltam {remainingKm.toLocaleString("pt-BR")} km (ou{" "}
                {nextRevision.months} meses)
              </span>
              <span className="font-semibold text-fg">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <ProgressBar
              value={progress}
              label="Progresso até a próxima revisão"
              className="mt-1.5 h-2"
            />
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-fg-secondary">
            {nextRevision.items.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 aria-hidden size={13} className="text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 tablet:flex-row wide:flex-col">
          <Link
            href="/cliente/servicos/agendamento"
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            <CalendarCheck aria-hidden size={17} />
            <span>Agendar revisão</span>
          </Link>
          <Link
            href="/cliente/servicos/revisoes"
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            <span>Ver plano completo</span>
            <ArrowRight aria-hidden size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
