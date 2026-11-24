import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Entrar" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

function resolveSafeRedirect(target: string): string {
  if (target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/cliente";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const redirectTo = resolveSafeRedirect(first(params.redirect));

  if (await getSession()) {
    redirect(redirectTo);
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Informe sua senha para acessar sua conta ToyotaTech."
    >
      <LoginForm
        defaultEmail={first(params.email)}
        defaultName={first(params.nome)}
        justRegistered={first(params.cadastro) === "ok"}
        sessionExpired={first(params.expired) === "1"}
        redirectTo={redirectTo}
      />
    </AuthShell>
  );
}
