import { CarFront } from "lucide-react";

import { cn } from "@/lib/cn";

export interface VehicleFallbackProps {
  model?: string;
  variant?: "hero" | "card";
  className?: string;
}

export default function VehicleFallback({
  model,
  variant = "hero",
  className,
}: VehicleFallbackProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center p-6 text-center",
        isHero ? "bg-ink-soft" : "rounded-xl bg-surface-muted",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full border",
          isHero
            ? "size-24 border-white/16 bg-white/6 text-white"
            : "size-19 border-border bg-surface text-fg-secondary",
        )}
      >
        <CarFront aria-hidden size={isHero ? 44 : 36} strokeWidth={1.4} />
      </div>
      <p
        className={cn(
          "mt-3 text-xl font-semibold",
          isHero ? "text-white" : "text-fg",
        )}
      >
        {model ?? "Seu Toyota"}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm",
          isHero ? "text-fg-inverse-muted" : "text-fg-muted",
        )}
      >
        Imagem ilustrativa indisponível
      </p>
    </div>
  );
}

