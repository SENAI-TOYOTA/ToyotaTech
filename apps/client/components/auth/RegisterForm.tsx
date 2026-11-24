"use client";

import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Check,
  Loader2,
  MapPin,
  Search,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import {
  Button,
  FormMessage,
  PasswordInput,
  ProgressBar,
  TextInput,
} from "@/components/ui";
import { signUpAction } from "@/lib/auth/actions";
import { useRegisterMutation } from "@/store";

type RegisterStep = 1 | 2 | 3;
type VehicleLinkMode = "chassi" | "placa";

const STEP_META: { step: RegisterStep; label: string; icon: typeof UserCheck }[] = [
  { step: 1, label: "Identificação", icon: UserCheck },
  { step: 2, label: "Veículo", icon: CarFront },
  { step: 3, label: "Endereço", icon: MapPin },
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatBirthDate(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

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

  const [step, setStep] = useState<RegisterStep>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Etapa 1 — Identificação
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");

  // Etapa 2 — Vínculo do Veículo
  const [vehicleMode, setVehicleMode] = useState<VehicleLinkMode>("chassi");
  const [vehicleIdentifier, setVehicleIdentifier] = useState("");
  const [orderCode, setOrderCode] = useState("");

  // Etapa 3 — Endereço (CEP + fallback manual)
  const [cep, setCep] = useState("");
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);
  const [manualAddressMode, setManualAddressMode] = useState(false);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");

  const normalizedEmail = email.trim().toLowerCase();
  const isSubmitting = isMutating || isTransitioning;

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasNoEdgeSpaces = password === password.trim();
  const isStrongPassword =
    hasMinLength && hasUpper && hasLower && hasNumber && hasNoEdgeSpaces;

  const loginHref = normalizedEmail
    ? `/login?email=${encodeURIComponent(normalizedEmail)}`
    : "/login";

  const validateStep1 = (): string | null => {
    if (name.trim().length < 3) {
      return "Informe seu nome completo (mínimo de 3 caracteres).";
    }
    if (onlyDigits(cpf).length !== 11) {
      return "Informe um CPF válido com 11 dígitos.";
    }
    if (onlyDigits(birthDate).length !== 8) {
      return "Informe sua data de nascimento no formato DD/MM/AAAA.";
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return "Informe um endereço de e-mail válido.";
    }
    if (!isStrongPassword) {
      return "A senha precisa ter ao menos 8 caracteres, letra maiúscula, minúscula, número e sem espaços nas pontas.";
    }
    return null;
  };

  const validateStep2 = (): string | null => {
    const cleanId = vehicleIdentifier.trim();
    if (!cleanId) {
      return null;
    }
    if (vehicleMode === "chassi" && cleanId.length < 11) {
      return "Informe o número do chassi (VIN) com pelo menos 11 caracteres ou deixe em branco para vincular depois.";
    }
    if (vehicleMode === "placa" && cleanId.replace(/[^a-zA-Z0-9]/g, "").length < 7) {
      return "Informe uma placa válida com 7 caracteres ou deixe em branco para vincular depois.";
    }
    return null;
  };

  const handleCepLookup = async (rawCep?: string) => {
    const digits = onlyDigits(rawCep ?? cep);
    if (digits.length !== 8) {
      setCepFeedback("Digite os 8 dígitos do CEP para buscar automaticamente.");
      return;
    }

    setIsLookingUpCep(true);
    setCepFeedback(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) {
        throw new Error("CEP lookup failed");
      }
      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro) {
        setManualAddressMode(true);
        setCepFeedback(
          "CEP não encontrado. Preencha os campos de endereço manualmente.",
        );
        return;
      }

      setStreet(data.logradouro ?? "");
      setNeighborhood(data.bairro ?? "");
      setCity(data.localidade ?? "");
      setStateUf(data.uf ?? "");
      setManualAddressMode(true);
      setCepFeedback("Endereço localizado automaticamente! Confira o número.");
    } catch {
      setManualAddressMode(true);
      setCepFeedback(
        "Consulta de CEP indisponível no momento. Preencha seu endereço manualmente.",
      );
    } finally {
      setIsLookingUpCep(false);
    }
  };

  const handleNextStep = () => {
    setFormError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setFormError(err);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) {
        setFormError(err);
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 3) {
      handleNextStep();
      return;
    }

    const step1Err = validateStep1();
    if (step1Err) {
      setFormError(step1Err);
      setStep(1);
      return;
    }

    if (onlyDigits(cep).length !== 8 || !street.trim() || !city.trim() || !stateUf.trim()) {
      setManualAddressMode(true);
      setFormError(
        "Informe o CEP, logradouro, cidade e UF para concluir seu cadastro.",
      );
      return;
    }

    setFormError(null);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "toyotatech.onboarding",
          JSON.stringify({
            name: name.trim(),
            cpf,
            birthDate,
            email: normalizedEmail,
            vehicleLink: {
              mode: vehicleMode,
              identifier: vehicleIdentifier.trim().toUpperCase(),
              orderCode: orderCode.trim().toUpperCase(),
            },
            address: {
              cep,
              street: street.trim(),
              number: number.trim(),
              complement: complement.trim(),
              neighborhood: neighborhood.trim(),
              city: city.trim(),
              stateUf: stateUf.trim().toUpperCase(),
            },
          }),
        );
      } catch {
        // Ignora falha de localStorage
      }
    }

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
      {/* Indicador de progresso em 3 etapas */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {STEP_META.map(({ step: itemStep, label, icon: Icon }) => {
            const isCompleted = step > itemStep;
            const isCurrent = step === itemStep;
            return (
              <button
                key={itemStep}
                type="button"
                disabled={itemStep > step}
                onClick={() => {
                  if (itemStep < step) {
                    setFormError(null);
                    setStep(itemStep);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary-soft text-primary"
                    : isCompleted
                      ? "cursor-pointer border-success/30 bg-success-soft text-success"
                      : "border-border bg-surface-muted text-fg-muted"
                }`}
              >
                {isCompleted ? (
                  <Check aria-hidden size={14} strokeWidth={2.5} />
                ) : (
                  <Icon aria-hidden size={14} strokeWidth={2} />
                )}
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
        <ProgressBar
          value={step / 3}
          label={`Etapa ${step} de 3`}
          className="h-1.5"
        />
      </div>

      {/* ETAPA 1: Identificação */}
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <TextInput
            label="Nome completo"
            name="name"
            placeholder="Como devemos te chamar?"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <TextInput
              label="CPF"
              name="cpf"
              placeholder="000.000.000-00"
              inputMode="numeric"
              maxLength={14}
              required
              value={cpf}
              onChange={(event) => setCpf(formatCpf(event.target.value))}
            />
            <TextInput
              label="Data de nascimento"
              name="birthDate"
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
              maxLength={10}
              required
              value={birthDate}
              onChange={(event) =>
                setBirthDate(formatBirthDate(event.target.value))
              }
            />
          </div>

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
            placeholder="Crie uma senha segura"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-surface-muted p-3 text-xs">
            {[
              { ok: hasMinLength, text: "Mínimo 8 caracteres" },
              { ok: hasUpper, text: "1 letra maiúscula" },
              { ok: hasLower, text: "1 letra minúscula" },
              { ok: hasNumber, text: "1 número" },
            ].map((rule) => (
              <span
                key={rule.text}
                className={`flex items-center gap-1.5 font-medium ${
                  rule.ok ? "text-success" : "text-fg-muted"
                }`}
              >
                <Check
                  aria-hidden
                  size={13}
                  strokeWidth={2.5}
                  className={rule.ok ? "opacity-100" : "opacity-35"}
                />
                {rule.text}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* ETAPA 2: Vínculo do Veículo */}
      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface-muted p-3.5 text-sm text-fg-secondary">
            Informe o <strong>Chassi (VIN)</strong> ou a <strong>Placa</strong>{" "}
            para localizar automaticamente seu pedido ou veículo Toyota. Se
            ainda não tiver esse dado, você pode prosseguir e vincular depois.
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface-muted p-1">
            {(
              [
                { id: "chassi", label: "Por Chassi (VIN)" },
                { id: "placa", label: "Por Placa" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setVehicleMode(option.id);
                  setVehicleIdentifier("");
                }}
                className={`cursor-pointer rounded-lg py-2 text-xs font-semibold transition-colors ${
                  vehicleMode === option.id
                    ? "bg-ink text-white"
                    : "text-fg-secondary hover:text-fg"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <TextInput
            label={vehicleMode === "chassi" ? "Número do Chassi (VIN)" : "Placa do veículo"}
            name="vehicleIdentifier"
            placeholder={
              vehicleMode === "chassi" ? "Ex: 9BRB29BE0T0048210" : "Ex: BRA2E19"
            }
            maxLength={vehicleMode === "chassi" ? 17 : 8}
            hint="Opcional — usado para vincular seu Corolla à garagem digital"
            value={vehicleIdentifier}
            onChange={(event) =>
              setVehicleIdentifier(event.target.value.toUpperCase())
            }
          />

          <TextInput
            label="Número do pedido (Concessionária)"
            name="orderCode"
            placeholder="Ex: TT-48210"
            hint="Opcional"
            value={orderCode}
            onChange={(event) => setOrderCode(event.target.value.toUpperCase())}
          />
        </div>
      ) : null}

      {/* ETAPA 3: Endereço com busca de CEP e fallback manual */}
      {step === 3 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextInput
                label="CEP"
                name="cep"
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                required
                value={cep}
                onChange={(event) => {
                  const formatted = formatCep(event.target.value);
                  setCep(formatted);
                  if (onlyDigits(formatted).length === 8) {
                    void handleCepLookup(formatted);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isLookingUpCep}
              onClick={() => void handleCepLookup()}
              icon={
                isLookingUpCep ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )
              }
            >
              Buscar
            </Button>
          </div>

          {cepFeedback ? (
            <p className="text-xs font-medium text-fg-secondary">{cepFeedback}</p>
          ) : null}

          {!manualAddressMode ? (
            <button
              type="button"
              onClick={() => setManualAddressMode(true)}
              className="self-start cursor-pointer text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary-pressed"
            >
              Não sei meu CEP ou prefiro preencher manualmente
            </button>
          ) : null}

          {manualAddressMode || street || city ? (
            <div className="flex flex-col gap-3.5">
              <TextInput
                label="Logradouro"
                name="street"
                placeholder="Rua, Avenida..."
                required
                value={street}
                onChange={(event) => setStreet(event.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Número"
                  name="number"
                  placeholder="Ex: 1200"
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                />
                <TextInput
                  label="Complemento"
                  name="complement"
                  placeholder="Apto, Bloco..."
                  value={complement}
                  onChange={(event) => setComplement(event.target.value)}
                />
              </div>

              <TextInput
                label="Bairro"
                name="neighborhood"
                placeholder="Seu bairro"
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
              />

              <div className="grid grid-cols-[1fr_92px] gap-3">
                <TextInput
                  label="Cidade"
                  name="city"
                  placeholder="Ex: Sorocaba"
                  required
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
                <TextInput
                  label="UF"
                  name="stateUf"
                  placeholder="SP"
                  maxLength={2}
                  required
                  value={stateUf}
                  onChange={(event) =>
                    setStateUf(event.target.value.toUpperCase())
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <FormMessage message={formError} />

      <div className="mt-1 flex items-center gap-2.5">
        {step > 1 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFormError(null);
              setStep((prev) => (prev === 3 ? 2 : 1));
            }}
            icon={<ArrowLeft size={18} />}
          >
            Voltar
          </Button>
        ) : null}

        {step < 3 ? (
          <Button
            type="button"
            fullWidth
            onClick={handleNextStep}
            icon={<ArrowRight size={20} strokeWidth={2.4} />}
          >
            Continuar
          </Button>
        ) : (
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={<ArrowRight size={20} strokeWidth={2.4} />}
          >
            {isSubmitting ? "Criando conta..." : "Concluir cadastro"}
          </Button>
        )}
      </div>

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
