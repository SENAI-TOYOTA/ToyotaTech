import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  rightAccessory?: ReactNode;
  containerClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export default function TextInput({
  label,
  hint,
  error,
  rightAccessory,
  containerClassName,
  className,
  id,
  readOnly,
  disabled,
  ref,
  ...rest
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const isLocked = readOnly || disabled;
  const message = error || hint;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold tracking-[0.2px] text-fg"
        >
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "flex min-h-13 items-center rounded-xl border px-4 transition-[border-color,box-shadow] duration-150",
          isLocked
            ? "border-border bg-surface-muted"
            : "border-border-strong bg-surface focus-within:border-ink focus-within:shadow-focus",
          error && "border-primary focus-within:border-primary",
          disabled && "cursor-not-allowed opacity-70",
        )}
      >
        <input
          ref={ref}
          id={inputId}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent py-3.5 text-[17px] outline-none",
            "placeholder:text-fg-muted disabled:cursor-not-allowed",
            isLocked ? "text-fg-secondary" : "text-fg",
            className,
          )}
          {...rest}
        />
        {rightAccessory ? (
          <div className="ml-2 flex shrink-0 items-center">{rightAccessory}</div>
        ) : null}
      </div>

      {message ? (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn(
            "text-[13px] leading-[18px]",
            error ? "font-medium text-primary" : "text-fg-secondary",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

