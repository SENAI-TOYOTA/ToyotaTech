"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import {
  Button,
  FormMessage,
  PasswordInput,
  TextInput,
} from "@/components/ui";
import { signInDemoAction } from "@/lib/auth/actions";
import { setCredentials, useAppDispatch, useLoginMutation } from "@/store";

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
  sessionExpired?: boolean;
  redirectTo?: string;
}

export default function LoginForm({
  defaultEmail = "",
  defaultName = "",
  justRegistered = false,
  sessionExpired = false,
  redirectTo = "/cliente",
}: LoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [isDemoLoading, startDemoTransition] = useTransition();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const canSubmit =
    normalizedEmail.includes("@") &&
    password.length >= 8 &&
    !isLoading &&
    !isDemoLoading;
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

      const resolvedToken = response.token ?? response.accessToken;
      if (resolvedToken && defaultName && !response.user?.name) {
        dispatch(
          setCredentials({
            token: resolvedToken,
            user: {
              ...response.user,
              name: defaultName,
            },
          }),
        );
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setFormError(extractErrorMessage(error));
    }
  };

  const handleDemoAccess = () => {
    setFormError(null);
    dispatch(
      setCredentials({
        token: "demo-mock-token",
        user: {
          id: "usr_demo_toyota_01",
          email: "demo@toyotatech.com.br",
          name: "Cliente Toyota",
          isVerified: true,
        },
      }),
    );
    startDemoTransition(async () => {
      await signInDemoAction();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {sessionExpired && !formError ? (
        <FormMessage
          tone="error"
          message="Sua sessão expirou. Entre novamente para continuar."
        />
      ) : null}

      {justRegistered && !formError && !sessionExpired ? (
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

      <div className="mt-1 flex flex-col gap-2.5">
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={!canSubmit}
          icon={<ArrowRight size={20} strokeWidth={2.4} />}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          loading={isDemoLoading}
          disabled={isLoading || isDemoLoading}
          onClick={handleDemoAccess}
          icon={<Sparkles size={18} strokeWidth={2} className="text-primary" />}
        >
          {isDemoLoading ? "Abrindo demonstração..." : "Pular login (Modo Demo)"}
        </Button>
      </div>

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
