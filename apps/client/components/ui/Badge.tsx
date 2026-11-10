import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "info";

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, { badge: string; dot: string }> = {
  neutral: { badge: "bg-surface-muted text-fg-secondary", dot: "bg-fg-secondary" },
  primary: { badge: "bg-primary-soft text-primary", dot: "bg-primary" },
  success: { badge: "bg-success-soft text-success", dot: "bg-success" },
  warning: { badge: "bg-warning-soft text-warning", dot: "bg-warning" },
  info: { badge: "bg-info-soft text-info", dot: "bg-info" },
};

export default function Badge({ label, tone = "neutral", className }: BadgeProps) {
  const palette = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 self-start rounded-full px-2.5 py-0.75",
        "text-[13px] font-semibold tracking-[0.3px]",
        palette.badge,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", palette.dot)} />
      <span className="truncate">{label}</span>
    </span>
  );
}

