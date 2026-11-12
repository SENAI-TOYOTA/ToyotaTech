"use client";

import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  CloudOff,
  Copy,
  Loader2,
  Receipt,
  RotateCcw,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import Viewer360 from "@/components/financing/Viewer360";
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
}: {
  garage: GarageData;
  financing: GarageFinancing;
}) {
  const total = Math.max(financing.totalInstallments, 0);
  const paid = Math.min(Math.max(financing.paidInstallments, 0), total);
  const remaining = total - paid;
  const progress = total ? paid / total : 0;
  const percent = Math.round(progress * 100);
  const isSettled = total > 0 && remaining === 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-[1.4px] text-fg-muted uppercase">
            Veículo financiado
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
            {paid}
            <span className="text-2xl font-medium text-fg-muted">
              {" "}
              / {total}
            </span>
          </p>
          <p className="mb-1.5 text-base font-semibold text-fg-secondary">
            {percent}% pago
          </p>
        </div>

        <ProgressBar
          value={progress}
          tone={isSettled ? "success" : "primary"}
          label="Andamento do contrato de financiamento"
          className="mt-2 h-2.5"
        />

        <p className="mt-2 text-[15px] text-fg-secondary">
          {isSettled
            ? "Todas as parcelas foram pagas."
            : remaining === 1
              ? "Falta 1 parcela"
              : `Faltam ${remaining} parcelas`}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Stat
          icon={Wallet}
          label="Parcela"
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
  const [invoiceNotice, setInvoiceNotice] = useState(false);

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
    setInvoiceNotice(true);
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
        {invoiceNotice ? (
          <p role="status" className="mt-3 text-sm text-fg-secondary">
            O PDF do boleto com vencimento em {dueDate} é emitido pelo banco. Use a linha
            digitável acima para pagar pelo app do seu banco.
          </p>
        ) : null}
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Financiamento"
        title="Seu financiamento"
        description="Acompanhe parcelas, vencimentos e boletos."
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
                  onClick={() => setMode(option.id)}
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

      {garage && financing ? (
        <div className="flex flex-col items-start gap-5 wide:flex-row">
          <div className="w-full min-w-0 flex-1">
            <FinancingOverview garage={garage} financing={financing} />
          </div>
          <div className="w-full shrink-0 wide:w-[360px]">
            <InvoiceCard
              available={financing.boletoAvailable}
              dueDate={financing.nextDueDate}
              amount={financing.installmentAmount}
            />
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Nenhum financiamento vinculado"
            description="Quando um contrato de financiamento for vinculado à sua compra, ele aparecerá aqui."
          />
        </Card>
      )}

      <Viewer360 model={garage?.vehicle.model ?? "Toyota"} />
    </div>
  );
}
