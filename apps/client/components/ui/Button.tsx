import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "inverse";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary border-primary text-white hover:bg-primary-pressed active:bg-primary-pressed",
  secondary:
    "bg-ink border-ink text-white hover:bg-ink-soft active:bg-ink-soft",
  outline:
    "bg-surface border-border-strong text-fg hover:bg-surface-muted active:bg-gray-light",
  ghost:
    "bg-transparent border-transparent text-fg hover:bg-surface-muted active:bg-gray-light",
  danger:
    "bg-surface border-border-strong text-primary hover:bg-primary-soft active:bg-primary-soft",
  inverse:
    "bg-white/6 border-white/32 text-white hover:bg-white/12 active:bg-white/16",
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "min-h-[54px] px-6 text-lg",
  md: "min-h-11 px-4 text-base",
};

/**
 * Classes visuais do botão, reutilizáveis em outros elementos
 * (ex.: `<Link className={buttonStyles({ variant: "outline" })}>`).
 */
export function buttonStyles({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  disabled = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border",
    "font-semibold tracking-[0.2px] whitespace-nowrap select-none",
    "transition-[background-color,transform,box-shadow] duration-150",
    "outline-none focus-visible:ring-3 focus-visible:ring-primary/30",
    "active:scale-[0.985] disabled:active:scale-100",
    sizeClasses[size],
    disabled
      ? "cursor-not-allowed border-gray-light bg-gray-light text-fg-muted"
      : variantClasses[variant],
    fullWidth && "w-full",
    className,
  );
}

export default function Button({
  variant = "primary",
  size = "lg",
  icon,
  iconPosition = "right",
  loading = false,
  fullWidth = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const isInactive = disabled || loading;

  return (
    <button
      type={type}
      disabled={isInactive}
      aria-busy={loading || undefined}
      className={buttonStyles({
        variant,
        size,
        fullWidth,
        disabled: disabled && !loading,
        className: cn(
          iconPosition === "left" && "flex-row-reverse",
          loading && "cursor-progress",
          className,
        ),
      })}
      {...rest}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-4.5 shrink-0 animate-spin" />
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
      {icon && !loading ? (
        <span aria-hidden className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
    </button>
  );
}

