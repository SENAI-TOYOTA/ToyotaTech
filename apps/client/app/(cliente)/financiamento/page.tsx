"use client";

import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  CloudOff,
  Copy,
  Loader2,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { resolveCarColor } from "@/components/3d/CorollaModel";
import VehicleCanvas from "@/components/3d/VehicleCanvas";
import PageHeader from "@/components/layout/PageHeader";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
} from "@/components/ui";
import {
  isSimulateApiErrorEnabled,
  setSimulateApiError,
} from "@/store/api";
import { useGetVeiculoQuery } from "@/store/slices/garageSlice";
import type { GarageData, GarageFinancing } from "@/types/garage";

const SAMPLE_BARCODE = "23793.38128 60082.401154 69000.063305 8 98940000324000";
const TOTAL_VEHICLE_VALUE = 168900;
const MONTHLY_DISCOUNT_RATE = 0.011;
const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function parseCurrencyBRL(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }
  const digits = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatCurrencyBRL(value: number): string {
  const rounded = Math.round(value);
  return rounded.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPayoffDate(
  nextDueDate: string | undefined,
  remainingMonths: number,
): string {
  if (remainingMonths <= 0) {
    return "Quitação imediata";
  }
  let baseMonth = 5;
  let baseYear = 2026;
  if (nextDueDate) {
    const parts = nextDueDate.split("/");
    if (parts.length === 3) {
      const m = Number.parseInt(parts[1], 10);
      const y = Number.parseInt(parts[2], 10);
      if (Number.isFinite(m) && m >= 1 && m <= 12) {
        baseMonth = m - 1;
      }
      if (Number.isFinite(y) && y > 2000) {
        baseYear = y;
      }
    }
  }
  const totalMonths = baseMonth + remainingMonths - 1;
  const targetYear = baseYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;
  return `${MONTH_NAMES[targetMonth]}/${targetYear}`;
}

interface SimulationMetrics {
  totalInstallments: number;
  basePaidInstallments: number;
  baseRemainingInstallments: number;
  installmentValue: number;
  baseOutstandingBalance: number;
  maxExtraAmortization: number;
  effectivePaidInstallments: number;
  remainingInstallments: number;
  remainingBalance: number;
  percentPaid: number;
  estimatedSavings: number;
  payoffDateLabel: string;
  isSimulated: boolean;
}

function computeSimulationMetrics(
  financing: GarageFinancing,
  extraAmortization: number,
  advancedInstallments: number,
): SimulationMetrics {
  const totalInstallments = Math.max(financing.totalInstallments, 1);
  const basePaidInstallments = Math.min(
    Math.max(financing.paidInstallments, 0),
    totalInstallments,
  );
  const baseRemainingInstallments = Math.max(
    totalInstallments - basePaidInstallments,
    0,
  );
  const installmentValue = parseCurrencyBRL(financing.installmentAmount, 2450);
  const baseOutstandingBalance = baseRemainingInstallments * installmentValue;

  const clampedAdvanced = Math.min(
    Math.max(advancedInstallments, 0),
    baseRemainingInstallments,
  );
  const balanceAfterInstallments = Math.max(
    0,
    (baseRemainingInstallments - clampedAdvanced) * installmentValue,
  );
  const maxExtraAmortization = baseOutstandingBalance;
  const effectiveExtra = Math.min(
    Math.max(extraAmortization, 0),
    balanceAfterInstallments,
  );

  const installmentsFromExtra =
    installmentValue > 0 ? effectiveExtra / installmentValue : 0;
  const additionalPaid = Math.min(
    baseRemainingInstallments,
    clampedAdvanced + installmentsFromExtra,
  );
  const effectivePaidInstallments = Math.min(
    totalInstallments,
    basePaidInstallments + additionalPaid,
  );
  const remainingInstallments = Math.max(
    0,
    Math.ceil(totalInstallments - effectivePaidInstallments - 0.001),
  );
  const remainingBalance = Math.max(
    0,
    baseOutstandingBalance -
      clampedAdvanced * installmentValue -
      effectiveExtra,
  );

  const rawPercent = (effectivePaidInstallments / totalInstallments) * 100;
  const percentPaid = Math.min(100, Math.round(rawPercent * 10) / 10);

  let savingsFromInstallments = 0;
  for (let i = 0; i < clampedAdvanced; i += 1) {
    const monthsAnticipated = baseRemainingInstallments - i;
    const discountFactor =
      1 - 1 / Math.pow(1 + MONTHLY_DISCOUNT_RATE, monthsAnticipated);
    savingsFromInstallments += installmentValue * discountFactor;
  }

  const avgRemainingMonths = Math.max(
    1,
    (baseRemainingInstallments - clampedAdvanced) * 0.55,
  );
  const extraDiscountFactor =
    1 - 1 / Math.pow(1 + MONTHLY_DISCOUNT_RATE, avgRemainingMonths);
  const savingsFromExtra = effectiveExtra * extraDiscountFactor;
  const estimatedSavings = Math.round(
    savingsFromInstallments + savingsFromExtra,
  );

  return {
    totalInstallments,
    basePaidInstallments,
    baseRemainingInstallments,
    installmentValue,
    baseOutstandingBalance,
    maxExtraAmortization,
    effectivePaidInstallments,
    remainingInstallments,
    remainingBalance,
    percentPaid,
    estimatedSavings,
    payoffDateLabel: formatPayoffDate(
      financing.nextDueDate,
      remainingInstallments,
    ),
    isSimulated: extraAmortization > 0 || advancedInstallments > 0,
  };
}

function ConquestStageCard({
  garage,
  metrics,
}: {
  garage: GarageData;
  metrics: SimulationMetrics;
}) {
  const formattedPercent =
    metrics.percentPaid % 1 === 0
      ? metrics.percentPaid.toFixed(0)
      : metrics.percentPaid.toFixed(1);

  return (
    <section
      aria-label="Conquista do veículo em 3D"
      className="overflow-hidden rounded-3xl bg-ink p-6 shadow-raised wide:p-8"
    >
      <div className="mb-5 flex flex-col justify-between gap-4 wide:flex-row wide:items-center">
        <div>
          <p className="text-xs font-bold tracking-[1.6px] text-primary uppercase">
            Conquista do veículo
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white tablet:text-3xl">
            {garage.vehicle.model} {garage.vehicle.year}
          </h2>
          <p className="mt-1 text-sm text-fg-inverse-muted">
            Simule uma amortização extra ou antecipação de parcelas e veja seu
            Corolla 3D ser preenchido em tempo real.
          </p>
        </div>

        <div className="inline-flex flex-col items-center self-start rounded-2xl border border-[#EB0A1E]/45 bg-[#EB0A1E]/15 px-6 py-3 wide:self-auto">
          <span className="text-3xl leading-9 font-bold text-white tablet:text-4xl">
            {formattedPercent}%
          </span>
          <span className="text-xs font-semibold tracking-[1px] text-[#EB0A1E] uppercase">
            quitado
          </span>
        </div>
      </div>

      <VehicleCanvas
        sideProfileOnly
        progress={metrics.percentPaid}
        color={garage.vehicle.color}
        height={290}
        className="rounded-2xl"
      />

      <div className="mt-5 flex flex-col gap-3">
        <ProgressBar
          value={metrics.percentPaid / 100}
          tone={metrics.percentPaid >= 100 ? "success" : "primary"}
          label="Percentual quitado do veículo"
          className="h-2.5 bg-white/12"
        />

        <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-fg-inverse-muted">
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: resolveCarColor(garage.vehicle.color),
              }}
              className="size-2.5 rounded-full border border-white/40"
            />
            <span>
              Parte quitada: Pintura sólida (
              {garage.vehicle.color || "Branco Pérola"})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full border border-white/50 bg-[#9CA3AF]/40" />
            <span>Saldo restante: Wireframe técnico (#9CA3AF)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SimulatorCard({
  metrics,
  extraAmortization,
  advancedInstallments,
  onChangeExtra,
  onChangeInstallments,
  onReset,
}: {
  metrics: SimulationMetrics;
  extraAmortization: number;
  advancedInstallments: number;
  onChangeExtra: (val: number) => void;
  onChangeInstallments: (val: number) => void;
  onReset: () => void;
}) {
  const maxInstallments = metrics.baseRemainingInstallments;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Sparkles aria-hidden size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-fg">
              Simulador de Antecipação e Entrada
            </h3>
            <p className="text-xs font-medium text-fg-muted">
              Passos de R$ 1.000 · Juros de 1,1% a.m.
            </p>
          </div>
        </div>
        <Badge
          label={metrics.isSimulated ? "Simulação ativa" : "Contrato original"}
          tone={metrics.isSimulated ? "primary" : "neutral"}
        />
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="extra-amortization-slider"
            className="text-base font-semibold text-fg"
          >
            Entrada extra (Amortização)
          </label>
          <span className="text-lg font-bold text-primary">
            {formatCurrencyBRL(extraAmortization)}
          </span>
        </div>

        <input
          id="extra-amortization-slider"
          type="range"
          min={0}
          max={metrics.maxExtraAmortization}
          step={1000}
          value={Math.min(extraAmortization, metrics.maxExtraAmortization)}
          onChange={(e) => onChangeExtra(Number(e.target.value))}
          className="mt-3 h-2.5 w-full cursor-pointer appearance-none rounded-full bg-surface-muted accent-[#EB0A1E]"
        />

        <div className="mt-2 flex justify-between text-xs font-medium text-fg-muted">
          <span>R$ 0,00</span>
          <span>Máx: {formatCurrencyBRL(metrics.maxExtraAmortization)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[0, 5000, 15000, 30000, metrics.maxExtraAmortization].map(
            (preset, idx) => {
              const isMax = idx === 4;
              const label = isMax
                ? "Quitar saldo"
                : preset === 0
                  ? "R$ 0"
                  : `+R$ ${preset / 1000} mil`;
              const isActive = Math.abs(extraAmortization - preset) < 500;
              return (
                <button
                  key={`${preset}-${idx}`}
                  type="button"
                  onClick={() => onChangeExtra(preset)}
                  className={
                    isActive
                      ? "cursor-pointer rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
                      : "cursor-pointer rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-fg-secondary hover:border-border-strong"
                  }
                >
                  {label}
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-fg">
              Antecipação de parcelas
            </p>
            <p className="text-xs text-fg-secondary">
              Adiante de 0 até {maxInstallments} parcelas restantes
            </p>
          </div>
          <span className="text-lg font-bold text-primary">
            {advancedInstallments === 1
              ? "1 parcela"
              : `${advancedInstallments} parcelas`}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-surface-muted p-3">
          <button
            type="button"
            aria-label="Diminuir parcelas antecipadas"
            disabled={advancedInstallments <= 0}
            onClick={() =>
              onChangeInstallments(Math.max(0, advancedInstallments - 1))
            }
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-fg transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus aria-hidden size={20} strokeWidth={2.2} />
          </button>

          <div className="text-center">
            <p className="text-2xl font-bold text-fg">
              +{advancedInstallments}
            </p>
            <p className="text-xs font-medium text-fg-secondary">
              {formatCurrencyBRL(
                advancedInstallments * metrics.installmentValue,
              )}
            </p>
          </div>

          <button
            type="button"
            aria-label="Aumentar parcelas antecipadas"
            disabled={advancedInstallments >= maxInstallments}
            onClick={() =>
              onChangeInstallments(
                Math.min(maxInstallments, advancedInstallments + 1),
              )
            }
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus aria-hidden size={20} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-muted p-3.5">
          <p className="text-xs font-medium tracking-[0.5px] text-fg-muted uppercase">
            Parcelas restantes
          </p>
          <p className="mt-1 text-lg font-bold text-fg">
            {metrics.remainingInstallments} de {metrics.totalInstallments}
          </p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3.5">
          <p className="text-xs font-medium tracking-[0.5px] text-fg-muted uppercase">
            Previsão de quitação
          </p>
          <p className="mt-1 text-lg font-bold text-fg">
            {metrics.payoffDateLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3.5 rounded-2xl border border-[#15803D]/25 bg-[#15803D]/8 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#15803D]/15 text-[#15803D]">
          <TrendingDown aria-hidden size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.5px] text-[#15803D] uppercase">
            Economia estimada em juros
          </p>
          <p className="mt-0.5 text-xl font-bold text-[#15803D]">
            {formatCurrencyBRL(metrics.estimatedSavings)}
          </p>
          <p className="mt-0.5 text-xs text-fg-secondary">
            Desconto proporcional de 1,1% a.m. sobre parcelas antecipadas
          </p>
        </div>
      </div>

      {metrics.isSimulated ? (
        <div className="mt-4">
          <Button
            fullWidth
            variant="secondary"
            icon={<RotateCcw size={16} />}
            onClick={onReset}
          >
            Resetar simulação
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[140px] flex-1 basis-[140px] rounded-xl bg-surface-muted p-3.5">
      <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-fg">
        <Icon aria-hidden size={18} strokeWidth={1.9} />
      </div>
      <p className="mt-2.5 text-xs font-medium tracking-[0.6px] text-fg-muted uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate text-lg font-semibold text-fg">{value}</p>
    </div>
  );
}

function FinancingOverview({
  garage,
  financing,
  metrics,
}: {
  garage: GarageData;
  financing: GarageFinancing;
  metrics: SimulationMetrics;
}) {
  const isSettled = metrics.remainingInstallments === 0;
  const effectivePaidCount = Math.round(metrics.effectivePaidInstallments);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-[1.4px] text-fg-muted uppercase">
            Resumo do contrato
          </p>
          <h2 className="mt-0.5 text-2xl font-bold text-fg">
            {garage.vehicle.model} {garage.vehicle.year}
          </h2>
        </div>
        <Badge
          label={isSettled ? "Quitado" : (financing.status ?? "Ativo")}
          tone={isSettled ? "success" : "info"}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between gap-2">
          <p className="text-[44px] leading-[46px] font-bold text-fg">
            {effectivePaidCount}
            <span className="text-2xl font-medium text-fg-muted">
              {" "}
              / {metrics.totalInstallments}
            </span>
          </p>
          <p className="mb-1.5 text-base font-semibold text-fg-secondary">
            {Math.round(metrics.percentPaid)}% pago
          </p>
        </div>

        <ProgressBar
          value={metrics.percentPaid / 100}
          tone={isSettled ? "success" : "primary"}
          label="Andamento do contrato de financiamento"
          className="mt-2 h-2.5"
        />

        <p className="mt-2 text-[15px] text-fg-secondary">
          {isSettled
            ? "Todas as parcelas foram pagas."
            : metrics.remainingInstallments === 1
              ? "Falta 1 parcela"
              : `Faltam ${metrics.remainingInstallments} parcelas`}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Stat
          icon={Wallet}
          label="Valor total do veículo"
          value={formatCurrencyBRL(TOTAL_VEHICLE_VALUE)}
        />
        <Stat
          icon={Wallet}
          label="Saldo devedor"
          value={formatCurrencyBRL(metrics.remainingBalance)}
        />
        <Stat
          icon={Wallet}
          label="Valor da parcela"
          value={financing.installmentAmount}
        />
        <Stat
          icon={CalendarClock}
          label="Próximo vencimento"
          value={isSettled ? "Quitado" : financing.nextDueDate}
        />
        <Stat icon={Building2} label="Instituição" value={financing.bank} />
      </div>

      {financing.contractNumber ? (
        <p className="mt-4 text-sm text-fg-secondary">
          Contrato{" "}
          <span className="font-semibold text-fg">
            {financing.contractNumber}
          </span>
        </p>
      ) : null}
    </Card>
  );
}

function InvoiceCard({
  available,
  dueDate,
  amount,
}: {
  available: boolean;
  dueDate: string;
  amount: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyBarcode = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_BARCODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard indisponível no contexto atual
    }
  };

  const handleAccessInvoice = () => {
    if (!available) return;
    window.open("/pdf/J.pdf", "_blank", "noopener,noreferrer");
  };

  return (
    <Card>
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Receipt aria-hidden size={22} strokeWidth={1.8} />
      </div>

      <h3 className="mt-3.5 text-xl font-bold text-fg">
        Segunda via do boleto
      </h3>

      <p className="mt-1 text-[15px] leading-[21px] text-fg-secondary">
        {available
          ? "Baixe seus boletos com facilidade sempre que precisar."
          : "Nenhum boleto disponível no momento. Avisaremos quando o próximo estiver pronto."}
      </p>

      <div className="mt-3">
        <Badge
          label={available ? "Boleto disponível" : "Nada a pagar agora"}
          tone={available ? "success" : "neutral"}
        />
      </div>

      {available ? (
        <div className="mt-4 rounded-xl border border-border bg-surface-muted p-3">
          <div className="flex items-center justify-between text-xs text-fg-secondary">
            <span>Vencimento: {dueDate}</span>
            <span className="font-semibold text-fg">{amount}</span>
          </div>
          <p className="mt-1.5 truncate font-mono text-xs text-fg-muted">
            {SAMPLE_BARCODE}
          </p>
          <button
            type="button"
            onClick={handleCopyBarcode}
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-pressed"
          >
            {copied ? (
              <>
                <Check aria-hidden size={14} />
                <span>Linha digitável copiada</span>
              </>
            ) : (
              <>
                <Copy aria-hidden size={14} />
                <span>Copiar linha digitável</span>
              </>
            )}
          </button>
        </div>
      ) : null}

      <div className="mt-5">
        <Button
          fullWidth
          disabled={!available}
          onClick={handleAccessInvoice}
          icon={<ArrowRight size={20} strokeWidth={2.4} />}
        >
          Acessar boleto
        </Button>
      </div>
    </Card>
  );
}

type DemoMode = "active" | "no-invoice" | "settled";

export default function FinanciamentoPage() {
  const {
    data: garage,
    isLoading,
    isError,
    refetch,
  } = useGetVeiculoQuery();

  const [mode, setMode] = useState<DemoMode>("active");
  const [extraAmortization, setExtraAmortization] = useState(0);
  const [advancedInstallments, setAdvancedInstallments] = useState(0);

  const financing: GarageFinancing | undefined = garage?.financing
    ? {
        ...garage.financing,
        paidInstallments:
          mode === "settled"
            ? garage.financing.totalInstallments
            : garage.financing.paidInstallments,
        boletoAvailable:
          mode === "active" ? garage.financing.boletoAvailable : false,
        status: mode === "settled" ? "Quitado" : "Ativo",
      }
    : undefined;

  const metrics = useMemo(() => {
    if (!financing) return null;
    return computeSimulationMetrics(
      financing,
      extraAmortization,
      advancedInstallments,
    );
  }, [financing, extraAmortization, advancedInstallments]);

  const handleReset = () => {
    setExtraAmortization(0);
    setAdvancedInstallments(0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Financiamento"
          title="Seu financiamento"
          description="Acompanhe parcelas, vencimentos e boletos."
        />
        <Card>
          <div
            role="status"
            className="flex flex-col items-center justify-center gap-3 py-12 text-center"
          >
            <Loader2
              aria-hidden
              size={32}
              className="animate-spin text-primary"
            />
            <p className="text-base font-medium text-fg-secondary">
              Carregando dados do financiamento...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Financiamento"
          title="Seu financiamento"
          description="Acompanhe parcelas, vencimentos e boletos."
        />
        <Card>
          <EmptyState
            icon={CloudOff}
            title="Não foi possível carregar o financiamento"
            description="Verifique sua conexão e tente novamente em alguns instantes."
            action={
              <Button
                size="md"
                fullWidth
                icon={<RotateCcw size={16} />}
                onClick={() => {
                  setSimulateApiError(false);
                  void refetch();
                }}
              >
                Tentar novamente
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Financiamento"
        title="Seu financiamento"
        description="Acompanhe parcelas, vencimentos e simule a conquista do seu Toyota."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-surface p-1">
              {(
                [
                  { id: "active", label: "Boleto disponível" },
                  { id: "no-invoice", label: "Sem boleto em aberto" },
                  { id: "settled", label: "Quitado (100%)" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setMode(option.id);
                    handleReset();
                  }}
                  className={
                    mode === option.id
                      ? "cursor-pointer rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      : "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-fg-secondary transition-colors hover:bg-surface-muted hover:text-fg"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSimulateApiError(!isSimulateApiErrorEnabled());
                void refetch();
              }}
              className="cursor-pointer rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              Testar erro de API
            </button>
          </div>
        }
      />

      {garage && financing && metrics ? (
        <>
          <ConquestStageCard garage={garage} metrics={metrics} />

          <div className="flex flex-col items-start gap-5 wide:flex-row">
            <div className="w-full min-w-0 flex-1">
              <SimulatorCard
                metrics={metrics}
                extraAmortization={extraAmortization}
                advancedInstallments={advancedInstallments}
                onChangeExtra={setExtraAmortization}
                onChangeInstallments={setAdvancedInstallments}
                onReset={handleReset}
              />
            </div>
            <div className="flex w-full shrink-0 flex-col gap-5 wide:w-[400px]">
              <FinancingOverview
                garage={garage}
                financing={financing}
                metrics={metrics}
              />
              <InvoiceCard
                available={financing.boletoAvailable}
                dueDate={financing.nextDueDate}
                amount={financing.installmentAmount}
              />
            </div>
          </div>
        </>
      ) : (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Nenhum financiamento vinculado"
            description="Quando um contrato de financiamento for vinculado à sua compra, ele aparecerá aqui."
          />
        </Card>
      )}
    </div>
  );
}
