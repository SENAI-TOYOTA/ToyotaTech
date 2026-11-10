"use client";

import {
  ArrowLeft,
  CloudOff,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ProductionStepper from "@/components/tracking/ProductionStepper";
import ProgressSummaryCard from "@/components/tracking/ProgressSummaryCard";
import VehicleSummaryCard from "@/components/tracking/VehicleSummaryCard";
import {
  Badge,
  Button,
  buttonStyles,
  Card,
  EmptyState,
} from "@/components/ui";
import {
  isAutoAdvanceEnabled,
  isSimulateApiErrorEnabled,
  setAutoAdvanceEnabled,
  setSimulateApiError,
  setSimulatedStepCursor,
} from "@/store/api";
import { useGetVeiculoQuery } from "@/store/slices/garageSlice";
import {
  PRODUCTION_POLLING_INTERVAL_MS,
  useGetProducaoStatusQuery,
} from "@/store/slices/productionTrackingSlice";

export default function AcompanhamentoPage() {
  const { data: garage } = useGetVeiculoQuery();
  const vin = garage?.vehicle?.chassi ?? "9BRB29BE0T0048210";

  const {
    data: trackingData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProducaoStatusQuery(vin, {
    pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
  });

  const [autoAdvance, setAutoAdvance] = useState(() => isAutoAdvanceEnabled());

  const handleToggleAutoAdvance = () => {
    const next = !autoAdvance;
    setAutoAdvance(next);
    setAutoAdvanceEnabled(next);
  };

  const handleSelectStage = (stepIndex: number) => {
    setAutoAdvance(false);
    setAutoAdvanceEnabled(false);
    setSimulateApiError(false);
    setSimulatedStepCursor(stepIndex);
    void refetch();
  };

  const handleToggleApiError = () => {
    setSimulateApiError(!isSimulateApiErrorEnabled());
    void refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          eyebrow="Produção IIoT"
          title="Status do pedido"
          description="Acompanhe seu Toyota da fábrica até a sua garagem."
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
              Carregando telemetria da linha de produção...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !trackingData) {
    return (
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4">
        <Link
          href="/cliente"
          className="inline-flex items-center gap-1.5 self-start rounded-lg py-1 pr-2 text-base font-medium text-fg-secondary transition-opacity outline-none hover:opacity-75 focus-visible:ring-3 focus-visible:ring-primary/30"
        >
          <ArrowLeft aria-hidden size={18} strokeWidth={2} />
          <span>Voltar</span>
        </Link>

        <Card>
          <EmptyState
            icon={CloudOff}
            title="Não foi possível carregar o status do pedido"
            description="Verifique sua conexão com o barramento IIoT e tente novamente em instantes."
            action={
              <div className="flex flex-col gap-2">
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
                <Link
                  href="/cliente"
                  className={buttonStyles({
                    variant: "ghost",
                    size: "md",
                    fullWidth: true,
                  })}
                >
                  Voltar ao início
                </Link>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/cliente"
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 text-base font-medium text-fg-secondary transition-opacity outline-none hover:opacity-75 focus-visible:ring-3 focus-visible:ring-primary/30"
        >
          <ArrowLeft aria-hidden size={18} strokeWidth={2} />
          <span>Voltar</span>
        </Link>

        <PageHeader
          eyebrow="Produção IIoT"
          title="Status do pedido"
          description="Acompanhe seu Toyota da fábrica até a sua garagem."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                label={
                  autoAdvance
                    ? "Polling 5s · Avanço IoT Automático"
                    : "Polling 5s · Estágio Fixo"
                }
                tone="info"
              />
              {trackingData.lastTelemetryAt ? (
                <span className="text-xs font-medium text-fg-muted">
                  Último pulso: {trackingData.lastTelemetryAt}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void refetch()}
                title="Consultar telemetria agora"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-fg-secondary transition-colors hover:bg-surface-muted hover:text-fg"
              >
                <RefreshCw
                  aria-hidden
                  size={13}
                  className={isFetching ? "animate-spin text-primary" : ""}
                />
                <span>{isFetching ? "Sincronizando..." : "Atualizar"}</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Painel de controle do simulador IIoT / RTK Query Polling */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAutoAdvance}
            className={
              autoAdvance
                ? "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white transition-colors"
                : "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-fg-secondary transition-colors hover:bg-gray-light hover:text-fg"
            }
          >
            {autoAdvance ? (
              <>
                <Pause aria-hidden size={12} />
                <span>Pausar avanço automático (5s)</span>
              </>
            ) : (
              <>
                <Play aria-hidden size={12} />
                <span>Retomar avanço automático (5s)</span>
              </>
            )}
          </button>

          {trackingData.steps.map((step, index) => {
            const isSelected = trackingData.currentStepIndex === index;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSelectStage(index)}
                className={
                  isSelected
                    ? "cursor-pointer rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition-colors"
                    : "cursor-pointer rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-fg-secondary transition-colors hover:bg-gray-light hover:text-fg"
                }
              >
                {index + 1}. {step.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleSelectStage(trackingData.steps.length)}
            className={
              trackingData.currentStepIndex === trackingData.steps.length
                ? "cursor-pointer rounded-full bg-success px-3 py-1 text-xs font-semibold text-white transition-colors"
                : "cursor-pointer rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-fg-secondary transition-colors hover:bg-gray-light hover:text-fg"
            }
          >
            Entregue (100%)
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleApiError}
          className="cursor-pointer text-xs font-semibold text-fg-muted underline-offset-2 hover:text-fg hover:underline"
        >
          Testar estado de erro (isError)
        </button>
      </div>

      <div className="flex flex-col items-start gap-5 wide:flex-row">
        <div className="w-full shrink-0 wide:w-[380px]">
          <VehicleSummaryCard
            data={trackingData}
            chassi={garage?.vehicle?.chassi ?? vin}
            orderId={garage?.order?.orderId ?? "TT-48210"}
            dealership={garage?.order?.dealership ?? "Toyota Sorocaba"}
          />
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
          <ProgressSummaryCard
            steps={trackingData.steps}
            vehicleId={trackingData.vehicleId || vin}
          />

          <Card
            title="Linha do tempo"
            subtitle="Etapas industriais de montagem e logística do chassi"
          >
            <ProductionStepper steps={trackingData.steps} />
          </Card>
        </div>
      </div>
    </div>
  );
}
