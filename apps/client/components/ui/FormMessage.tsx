import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/cn";

export type FormMessageTone = "error" | "success" | "info";

export interface FormMessageProps {
  message?: string | null;
  tone?: FormMessageTone;
  className?: string;
}

const tones = {
  error: { classes: "bg-primary-soft text-primary", icon: AlertCircle },
  success: { classes: "bg-success-soft text-success", icon: CheckCircle2 },
  info: { classes: "bg-info-soft text-info", icon: Info },
} as const;

export default function FormMessage({
  message,
  tone = "error",
  className,
}: FormMessageProps) {
  if (!message) {
    return null;
  }

  const { classes, icon: Icon } = tones[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 rounded-xl px-3.5 py-2.5", classes, className)}
    >
      <Icon aria-hidden size={18} strokeWidth={2} className="mt-px shrink-0" />
      <p className="flex-1 text-sm leading-[19px] font-medium">{message}</p>
    </div>
  );
}

