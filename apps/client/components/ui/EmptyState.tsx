import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "neutral" | "success";
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: EmptyStateProps) {
  const isSuccess = tone === "success";

  return (
    <div className={cn("flex flex-col items-center px-4 py-6 text-center", className)}>
      <div
        className={cn(
          "flex size-13 items-center justify-center rounded-2xl",
          isSuccess ? "bg-success-soft text-success" : "bg-surface-muted text-fg-secondary",
        )}
      >
        <Icon aria-hidden size={24} strokeWidth={1.8} />
      </div>
      <h3 className="mt-3 text-[17px] font-semibold text-fg">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-80 text-sm leading-5 text-fg-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-4 w-full max-w-60">{action}</div> : null}
    </div>
  );
}

