import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  caption?: string;
}

export default function Chip({ selected = false, caption, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex min-h-10 cursor-pointer flex-col items-center justify-center rounded-xl border px-3.5 py-2",
        "text-[15px] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-primary/30",
        selected
          ? "border-ink bg-ink text-white"
          : "border-border-strong bg-surface text-fg hover:bg-surface-muted",
        className,
      )}
      {...rest}
    >
      {caption ? (
        <span className={cn("text-xs font-medium", selected ? "text-white/70" : "text-fg-muted")}>
          {caption}
        </span>
      ) : null}
      {children}
    </button>
  );
}
