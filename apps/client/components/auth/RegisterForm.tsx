"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import {
  Button,
  FormMessage,
  PasswordInput,
  TextInput,
} from "@/components/ui";
import { signUpAction } from "@/lib/auth/actions";
import { useRegisterMutation } from "@/store";

function extractRegisterError(err: unknown): string | null {
  if (!err || typeof err !== "object") {
    return null;
  }
  const maybeError = err as {
    status?: number | string;
    data?: { message?: string; error?: string };
  };
  if (maybeError.status === "FETCH_ERROR") {
    return null;
  }
  return (
    maybeError.data?.message ??
    maybeError.data?.error ??
    "Não foi possível criar a conta. Tente novamente."
  );
}

export default function RegisterForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [register, { isLoading: isMutating }] = useRegisterMutation();
  const [isTransitioning, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const isSubmitting = isMutating || isTransitioning;
  const canSubmit =
    normalizedEmail.includes("@") && password.length >= 8 && !isSubmitting;
  const loginHref = normalizedEmail
    ? `/login?email=${encodeURIComponent(normalizedEmail)}`
    : "/login";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setFormError(
        "Informe um e-mail válido e uma senha com pelo menos 8 caracteres.",
      );
      return;
    }

    setFormError(null);

    try {
      await register({
        email: normalizedEmail,
        password,
        name: name.trim() || undefined,
      }).unwrap();
    } catch (error) {
      const apiErrorMessage = extractRegisterError(error);
      if (apiErrorMessage) {
        setFormError(apiErrorMessage);
        return;
      }
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("email", normalizedEmail);
    formData.set("password", password);

    startTransition(async () => {
      const result = await signUpAction(
        { error: null, email: normalizedEmail, name: name.trim() },
        formData,
      );
      if (result?.error) {
        setFormError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <TextInput
        label="Nome completo"
        name="name"
        placeholder="Como devemos te chamar?"
        autoComplete="name"
        hint="Opcional"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <TextInput
        label="E-mail"
        name="email"
        type="email"
        placeholder="nome@exemplo.com"
        autoComplete="email"
        autoCapitalize="none"
        inputMode="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <PasswordInput
        label="Senha"
        name="password"
        placeholder="Crie uma senha"
        autoComplete="new-password"
        required
        minLength={8}
        hint="Mínimo de 8 caracteres, com uma letra maiúscula, uma minúscula e um número."
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <FormMessage message={formError} />

      <Button
        type="submit"
        fullWidth
        className="mt-1"
        loading={isSubmitting}
        disabled={!canSubmit}
        icon={<ArrowRight size={20} strokeWidth={2.4} />}
      >
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="flex items-center justify-center gap-1.5 border-t border-border pt-4 text-base text-fg-secondary">
        Já tem uma conta?
        <Link
          href={loginHref}
          className="font-semibold text-primary hover:text-primary-pressed hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
