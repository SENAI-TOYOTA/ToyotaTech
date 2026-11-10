import { cn } from "@/lib/cn";

export type ProgressBarTone = "primary" | "success" | "inverse";

export interface ProgressBarProps {
  /** Valor normalizado entre 0 e 1 (mesma convenção do mobile). */
  value: number;
  tone?: ProgressBarTone;
  label?: string;
  className?: string;
}

const fillClasses: Record<ProgressBarTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  inverse: "bg-white",
};

export default function ProgressBar({
  value,
  tone = "primary",
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 1);
  const percent = Math.round(clamped * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full",
        tone === "inverse" ? "bg-white/18" : "bg-gray-light",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
          fillClasses[tone],
        )}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

