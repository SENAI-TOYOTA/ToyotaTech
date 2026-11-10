"use client";

import { ArrowLeft, CloudOff, RefreshCw, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import {
  Badge,
  Button,
  buttonStyles,
  Card,
  EmptyState,
} from "@/components/ui";
import { MOCK_GARAGE_DATA } from "@/lib/mocks/garage";
import {
  PRODUCTION_POLLING_INTERVAL_MS,
  useGetGarageQuery,
  useGetProducaoQuery,
} from "@/store";
import type { TrackingInfo, TrackingStepStatus } from "@/types/tracking";

import ProductionStepper from "./ProductionStepper";
import ProgressSummaryCard from "./ProgressSummaryCard";
import VehicleSummaryCard from "./VehicleSummaryCard";

export interface TrackingViewProps {
  initialData?: TrackingInfo | null;
  orderId?: string;
  chassi?: string;
  dealership?: string;
}

export default function TrackingView({
  initialData = MOCK_GARAGE_DATA.tracking,
  orderId = MOCK_GARAGE_DATA.order.orderId,
  chassi = MOCK_GARAGE_DATA.vehicle.chassi,
  dealership = MOCK_GARAGE_DATA.order.dealership,
}: TrackingViewProps) {
  const { data: garageData } = useGetGarageQuery();

  const resolvedVin =
    garageData?.vehicle?.chassi ??
    garageData?.vehicle?.vehicleId ??
    chassi ??
    initialData?.vehicleId ??
    "CHASSI_48210";

  const {
    data: apiTrackingData,
    isFetching,
    isSuccess,
    refetch,
  } = useGetProducaoQuery(resolvedVin, {
    pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
  });

  const baseData = apiTrackingData ?? initialData;

  const [manualStepIndex, setManualStepIndex] = useState<number | null>(null);
  const [simulateOffline, setSimulateOffline] = useState(false);

  const activeIndex =
    manualStepIndex ?? baseData?.currentStepIndex ?? 3;

  const trackingData = useMemo<TrackingInfo | null>(() => {
    if (!baseData || simulateOffline) {
      return null;
    }

    const steps = baseData.steps.map((step, index) => {
      let status: TrackingStepStatus = "pending";
      if (index < activeIndex) {
        status = "completed";
      } else if (index === activeIndex) {
        status = "current";
      }
      return { ...step, status };
    });

    return {
      ...baseData,
      currentStepIndex: activeIndex,
      steps,
    };
  }, [baseData, activeIndex, simulateOffline]);

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
                  isSuccess
                    ? "API Online · Polling 5s"
                    : "Polling 5s ativo (Fallback Local)"
                }
                tone={isSuccess ? "success" : "info"}
              />
              <button
                type="button"
                onClick={() => void refetch()}
                title="Sincronizar telemetria agora"
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

      {/* Barra de inspeção / simulação de estágio da esteira */}
      {baseData ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-fg">
              Estação da esteira ({resolvedVin}):
            </span>
            {baseData.steps.map((step, index) => {
              const isSelected = !simulateOffline && activeIndex === index;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setSimulateOffline(false);
                    setManualStepIndex(index);
                  }}
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
              onClick={() => {
                setSimulateOffline(false);
                setManualStepIndex(baseData.steps.length);
              }}
              className={
                !simulateOffline && activeIndex === baseData.steps.length
                  ? "cursor-pointer rounded-full bg-success px-3 py-1 text-xs font-semibold text-white transition-colors"
                  : "cursor-pointer rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-fg-secondary transition-colors hover:bg-gray-light hover:text-fg"
              }
            >
              Entregue (100%)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSimulateOffline((prev) => !prev)}
            className="cursor-pointer text-xs font-semibold text-fg-muted underline-offset-2 hover:text-fg hover:underline"
          >
            {simulateOffline ? "Restaurar dados" : "Testar estado offline"}
          </button>
        </div>
      ) : null}

      {!trackingData ? (
        <div className="mx-auto w-full max-w-[560px]">
          <Card>
            <EmptyState
              icon={CloudOff}
              title="Não foi possível carregar o status do pedido"
              description="Verifique sua conexão e tente novamente em instantes."
              action={
                <div className="flex flex-col gap-2">
                  <Button
                    size="md"
                    fullWidth
                    icon={<RotateCcw size={16} />}
                    onClick={() => {
                      setSimulateOffline(false);
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
      ) : (
        <div className="flex flex-col items-start gap-5 wide:flex-row">
          <div className="w-full shrink-0 wide:w-[380px]">
            <VehicleSummaryCard
              data={trackingData}
              chassi={garageData?.vehicle?.chassi ?? chassi}
              orderId={garageData?.order?.orderId ?? orderId}
              dealership={garageData?.order?.dealership ?? dealership}
            />
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <ProgressSummaryCard
              steps={trackingData.steps}
              vehicleId={trackingData.vehicleId || resolvedVin}
            />

            <Card
              title="Linha do tempo"
              subtitle="Etapas industriais de montagem e logística do chassi"
            >
              <ProductionStepper steps={trackingData.steps} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
