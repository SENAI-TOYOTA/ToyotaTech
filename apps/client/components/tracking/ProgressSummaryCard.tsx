import { Radio } from "lucide-react";

import { Badge, ProgressBar } from "@/components/ui";
import type { TrackingStep } from "@/types/tracking";

export interface ProgressSummaryCardProps {
  steps: TrackingStep[];
  vehicleId?: string;
}

export default function ProgressSummaryCard({
  steps,
  vehicleId,
}: ProgressSummaryCardProps) {
  const completed = steps.filter((step) => step.status === "completed").length;
  const current = steps.find((step) => step.status === "current");
  const isDelivered = steps.length > 0 && completed === steps.length;
  const progress = steps.length
    ? (completed + (current ? 0.5 : 0)) / steps.length
    : 0;
  const percent = Math.round(progress * 100);

  return (
    <section
      aria-label="Resumo do estágio atual"
      className="rounded-2xl bg-ink p-6 text-white shadow-raised"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-[1.4px] text-white/60 uppercase">
            Etapa atual
          </span>
          {vehicleId ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white/80">
              <Radio aria-hidden size={12} className="text-primary" />
              {vehicleId}
            </span>
          ) : null}
        </div>
        <Badge
          label={isDelivered ? "Entregue" : "Em andamento"}
          tone={isDelivered ? "success" : "primary"}
        />
      </div>

      <h2 className="mt-2.5 text-[26px] leading-[30px] font-bold text-white">
        {isDelivered
          ? "Seu Toyota foi entregue"
          : (current?.label ?? "Preparando seu pedido")}
      </h2>

      {current?.station ? (
        <p className="mt-1 text-sm text-fg-inverse-muted">{current.station}</p>
      ) : null}

      <ProgressBar
        value={progress}
        tone="inverse"
        label="Progresso geral da produção"
        className="mt-5"
      />

      <div className="mt-2.5 flex items-center justify-between text-sm font-medium text-fg-inverse-muted">
        <span>
          {completed} de {steps.length} etapas concluídas
        </span>
        <span className="font-semibold text-white">{percent}%</span>
      </div>
    </section>
  );
}

