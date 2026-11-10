"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import TextInput, { type TextInputProps } from "./TextInput";

export type PasswordInputProps = Omit<TextInputProps, "type" | "rightAccessory">;

export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      {...props}
      type={isVisible ? "text" : "password"}
      rightAccessory={
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-fg-secondary outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ink/20 active:bg-gray-light"
        >
          <Icon aria-hidden size={20} strokeWidth={1.8} />
        </button>
      }
    />
  );
}

