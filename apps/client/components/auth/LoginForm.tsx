"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Button,
  FormMessage,
  PasswordInput,
  TextInput,
} from "@/components/ui";
import { setAuthTokenCookie } from "@/store/api";
import { useLoginMutation } from "@/store/slices/authSlice";

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const maybeError = err as {
      data?: { message?: string; error?: string };
    };
    if (maybeError.data?.message) return maybeError.data.message;
    if (maybeError.data?.error) return maybeError.data.error;
  }
  return "Não foi possível entrar. Verifique suas credenciais e tente novamente.";
}

export interface LoginFormProps {
  defaultEmail?: string;
  defaultName?: string;
  justRegistered?: boolean;
}

export default function LoginForm({
  defaultEmail = "",
  defaultName = "",
  justRegistered = false,
}: LoginFormProps) {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const canSubmit =
    normalizedEmail.includes("@") && password.length >= 8 && !isLoading;
  const registerHref = normalizedEmail
    ? `/cadastro?email=${encodeURIComponent(normalizedEmail)}`
    : "/cadastro";

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
      const response = await login({
        email: normalizedEmail,
        password,
      }).unwrap();

      const token = response.token ?? response.accessToken;
      if (token) {
        setAuthTokenCookie(token);
      }

      if (defaultName && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "toyotatech.user",
            JSON.stringify({
              ...response.user,
              name: response.user?.name || defaultName,
            }),
          );
        } catch {
          // Ignora falha de localStorage
        }
      }

      router.push("/cliente/acompanhamento");
      router.refresh();
    } catch (error) {
      setFormError(extractErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {justRegistered && !formError ? (
        <FormMessage
          tone="success"
          message="Conta criada com sucesso! Entre com sua senha para continuar."
        />
      ) : null}

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
        placeholder="Sua senha"
        autoComplete="current-password"
        required
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <FormMessage message={formError} />

      <Button
        type="submit"
        fullWidth
        className="mt-1"
        loading={isLoading}
        disabled={!canSubmit}
        icon={<ArrowRight size={20} strokeWidth={2.4} />}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm leading-5 text-fg-secondary">
        Ao entrar, você concorda com os{" "}
        <Link
          href="#"
          className="font-semibold text-fg underline underline-offset-2"
        >
          Termos e Condições do ToyotaTech
        </Link>
        .
      </p>

      <p className="flex items-center justify-center gap-1.5 border-t border-border pt-4 text-base text-fg-secondary">
        Novo no ToyotaTech?
        <Link
          href={registerHref}
          className="font-semibold text-primary hover:text-primary-pressed hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
