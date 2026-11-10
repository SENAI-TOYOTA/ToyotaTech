import {
  Check,
  Clock,
  Cpu,
  Factory,
  PackageCheck,
  PaintBucket,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { TrackingStep } from "@/types/tracking";

const STEP_ICONS: Record<string, LucideIcon> = {
  "1": Factory,
  "2": PaintBucket,
  "3": Wrench,
  "4": ShieldCheck,
  "5": Truck,
  "6": PackageCheck,
};

export interface ProductionStepperProps {
  steps: TrackingStep[];
  className?: string;
}

export default function ProductionStepper({
  steps,
  className,
}: ProductionStepperProps) {
  return (
    <div
      role="list"
      aria-label="Etapas industriais da esteira de produção"
      className={cn("flex flex-col", className)}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";
        const StageIcon = STEP_ICONS[step.id] ?? Cpu;

        return (
          <div
            key={step.id}
            role="listitem"
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-stretch"
          >
            {/* Coluna do indicador e conector da linha do tempo */}
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted && "border-success bg-success text-white",
                  isCurrent &&
                    "border-primary bg-surface ring-4 ring-primary/15",
                  !isCompleted &&
                    !isCurrent &&
                    "border-border-strong bg-surface text-fg-muted",
                )}
              >
                {isCompleted ? (
                  <Check aria-hidden size={14} strokeWidth={3} />
                ) : isCurrent ? (
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full bg-primary"
                  />
                ) : (
                  <span className="text-[11px] font-bold">{index + 1}</span>
                )}
              </span>

              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-7 rounded-full transition-colors",
                    isCompleted ? "bg-success" : "bg-gray-light",
                  )}
                />
              ) : null}
            </div>

            {/* Conteúdo da etapa industrial */}
            <div
              className={cn(
                "min-w-0 flex-1 pl-3.5",
                isLast ? "pb-0" : "pb-6",
              )}
            >
              <div
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  isCurrent
                    ? "border-primary/30 bg-primary-soft/35"
                    : isCompleted
                      ? "border-border bg-surface"
                      : "border-border/70 bg-surface-muted/60",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        isCompleted && "bg-success-soft text-success",
                        isCurrent && "bg-primary text-white",
                        !isCompleted &&
                          !isCurrent &&
                          "bg-surface text-fg-muted border border-border",
                      )}
                    >
                      <StageIcon size={16} strokeWidth={2} />
                    </span>

                    <span
                      className={cn(
                        "text-[17px] leading-snug",
                        isCompleted && "font-semibold text-fg",
                        isCurrent && "font-bold text-fg",
                        !isCompleted && !isCurrent && "font-medium text-fg-muted",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {isCurrent ? (
                    <Badge label="Agora" tone="primary" />
                  ) : isCompleted ? (
                    <Badge label="Concluído" tone="success" />
                  ) : (
                    <Badge label="Pendente" tone="neutral" />
                  )}
                </div>

                {step.station ? (
                  <p className="mt-2 text-xs font-semibold tracking-[0.4px] text-fg-secondary uppercase">
                    {step.station}
                  </p>
                ) : null}

                {step.description ? (
                  <p className="mt-1 text-sm leading-5 text-fg-secondary">
                    {step.description}
                  </p>
                ) : null}

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-fg-muted">
                  <Clock aria-hidden size={13} strokeWidth={1.8} />
                  <span>
                    {step.date ?? (isCompleted ? "Concluído" : "Pendente")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

