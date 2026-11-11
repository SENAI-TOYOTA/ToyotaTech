import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padded?: boolean;
  as?: "section" | "article" | "div";
}

export default function Card({
  children,
  title,
  subtitle,
  action,
  padded = true,
  as: Component = "section",
  className,
  ...rest
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <Component
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
        padded && "p-5",
        className,
      )}
      {...rest}
    >
      {hasHeader ? (
        <header
          className={cn(
            "flex items-start justify-between gap-4",
            padded ? "mb-4" : "mb-2 px-5 pt-5",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {title ? (
              <h3 className="text-xl font-semibold text-fg">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="text-[15px] leading-5 text-fg-secondary">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </Component>
  );
}

