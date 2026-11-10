import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { getSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Criar conta" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CadastroPage({ searchParams }: { searchParams: SearchParams }) {
  if (await getSession()) {
    redirect("/cliente");
  }

  const { email } = await searchParams;

  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="Leva só um minuto para começar a acompanhar o seu Toyota."
    >
      <RegisterForm defaultEmail={(Array.isArray(email) ? email[0] : email) ?? ""} />
    </AuthShell>
  );
}

