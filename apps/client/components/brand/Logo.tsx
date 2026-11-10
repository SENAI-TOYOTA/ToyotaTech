import { cn } from "@/lib/cn";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-[26px]",
  lg: "text-4xl",
} as const;

/** Wordmark "ToyotaTech" — equivalente web de apps/mobile/components/Logo.tsx */
export default function Logo({ size = "md", inverse = false, className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="ToyotaTech"
      className={cn(
        "inline-flex items-center leading-[1.1] font-bold tracking-[-0.5px]",
        sizeClasses[size],
        className,
      )}
    >
      <span aria-hidden className="text-primary">
        Toyota
      </span>
      <span aria-hidden className={inverse ? "text-white" : "text-ink"}>
        Tech
      </span>
    </span>
  );
}

