"use client";

import { Check, LogOut } from "lucide-react";
import { useState, type FormEvent } from "react";

import PageHeader from "@/components/layout/PageHeader";
import {
  Badge,
  Button,
  Card,
  FormMessage,
  TextInput,
} from "@/components/ui";
import { signOutAction } from "@/lib/auth/actions";
import { getInitials } from "@/lib/auth/session";
import {
  logout,
  setCredentials,
  useAppDispatch,
  useAppSelector,
} from "@/store";

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

export interface ProfileViewProps {
  initialEmail: string;
  initialName: string;
}

export default function ProfileView({
  initialEmail,
  initialName,
}: ProfileViewProps) {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const email = authState.user?.email || initialEmail;
  const [fullName, setFullName] = useState(
    authState.user?.profile?.fullName || authState.user?.name || initialName,
  );
  const [birthDate, setBirthDate] = useState(
    authState.user?.profile?.birthDate || "14/08/1992",
  );
  const [cpf, setCpf] = useState(
    authState.user?.profile?.cpf || "382.491.028-40",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const displayName = fullName.trim() || email.split("@")[0] || "Cliente Toyota";

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage(null);
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Informe seu nome completo.");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate.trim())) {
      setFormError("Informe uma data de nascimento válida (DD/MM/AAAA).");
      return;
    }
    if (cpf.replace(/\D/g, "").length !== 11) {
      setFormError("Informe um CPF válido.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      dispatch(
        setCredentials({
          token: authState.token ?? `dev-jwt-${btoa(email)}`,
          user: {
            email,
            name: fullName.trim(),
            isVerified: true,
            profile: {
              fullName: fullName.trim(),
              birthDate: birthDate.trim(),
              cpf: cpf.trim(),
            },
          },
        }),
      );
      setIsSaving(false);
      setSavedMessage("Seu perfil foi atualizado.");
    }, 300);
  };

  return (
    <div className="flex max-w-[960px] flex-col gap-6">
      <PageHeader
        eyebrow="Conta"
        title="Perfil"
        description="Gerencie seus dados pessoais."
      />

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-15 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-bold tracking-[0.5px] text-white">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[22px] font-bold text-fg">
              {displayName}
            </h2>
            <p className="truncate text-base text-fg-secondary">{email}</p>
          </div>
          <Badge label="Verificado" tone="success" />
        </div>
      </Card>

      <form onSubmit={handleSave} className="flex flex-col gap-6" noValidate>
        <div className="grid items-start gap-5 wide:grid-cols-2">
          <Card
            title="Dados pessoais"
            subtitle="Usados para vincular sua compra e documentos."
          >
            <div className="flex flex-col gap-4">
              <TextInput
                label="Nome completo"
                placeholder="Seu nome completo"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextInput
                label="Data de nascimento"
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
                value={birthDate}
                onChange={(e) =>
                  setBirthDate(formatBirthDate(e.target.value))
                }
              />
              <TextInput
                label="CPF"
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                hint="Seu CPF é utilizado para vincular seu pedido e documentos fiscais."
              />
            </div>
          </Card>

          <Card
            title="Dados de acesso"
            subtitle="Dados usados para acessar o ToyotaTech."
          >
            <div className="flex flex-col gap-4">
              <TextInput label="E-mail" value={email} readOnly />
              <TextInput
                label="Senha"
                type="password"
                value="********"
                readOnly
              />
            </div>
          </Card>
        </div>

        <FormMessage message={formError} />
        <FormMessage message={savedMessage} tone="success" />

        <div className="flex flex-col gap-2.5 wide:flex-row wide:justify-end">
          <Button
            type="button"
            variant="danger"
            iconPosition="left"
            icon={<LogOut size={18} strokeWidth={2} />}
            className="wide:w-[220px]"
            onClick={() => {
              dispatch(logout());
              void signOutAction();
            }}
          >
            Sair
          </Button>
          <Button
            type="submit"
            loading={isSaving}
            iconPosition="left"
            icon={<Check size={18} strokeWidth={2.4} />}
            className="wide:w-[220px]"
          >
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}

