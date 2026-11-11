import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ListRowIconTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "info";

export interface ListRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  iconTone?: ListRowIconTone;
  showDivider?: boolean;
  className?: string;
}

const iconToneClasses: Record<ListRowIconTone, string> = {
  neutral: "bg-surface-muted text-fg",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export default function ListRow({
  icon: Icon,
  title,
  subtitle,
  trailing,
  onClick,
  href,
  target,
  iconTone = "neutral",
  showDivider = false,
  className,
}: ListRowProps) {
  const isInteractive = Boolean(onClick || href);

  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex size-10.5 shrink-0 items-center justify-center rounded-xl",
          iconToneClasses[iconTone],
        )}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="line-clamp-2 text-[17px] font-semibold text-fg">
          {title}
        </span>
        {subtitle ? (
          <span className="line-clamp-2 text-sm leading-[19px] text-fg-secondary">
            {subtitle}
          </span>
        ) : null}
      </span>

      {trailing ? <span className="shrink-0">{trailing}</span> : null}

      {isInteractive ? (
        <ChevronRight
          aria-hidden
          size={20}
          strokeWidth={1.8}
          className="shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5"
        />
      ) : null}
    </>
  );

  const rowClasses = cn(
    "group flex w-full items-center gap-4 px-5 py-3.5",
    showDivider && "border-t border-border",
    isInteractive &&
      "cursor-pointer transition-colors outline-none hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 active:bg-gray-light",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className={rowClasses}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rowClasses}>
        {content}
      </button>
    );
  }

  return <div className={rowClasses}>{content}</div>;
}

