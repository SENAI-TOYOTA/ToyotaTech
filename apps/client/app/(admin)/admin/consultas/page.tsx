"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import PageHeader from "@/components/layout/PageHeader";
import ProductionStepper from "@/components/tracking/ProductionStepper";
import {
  Badge,
  Button,
  Card,
  TextInput,
} from "@/components/ui";
import { useGetProducaoStatusQuery } from "@/store/slices/productionTrackingSlice";

export default function AdminConsultasPage() {
  const [searchInput, setSearchInput] = useState("9BRB29BE0T0048210");
  const [queriedVin, setQueriedVin] = useState("9BRB29BE0T0048210");

  const {
    data: trackingData,
    isFetching,
    refetch,
  } = useGetProducaoStatusQuery(queriedVin);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = searchInput.trim().toUpperCase();
    if (!cleaned) return;
    setQueriedVin(cleaned);
    void refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Rastreabilidade IIoT"
        title="Consulta de Chassi e Telemetria"
        description="Inspecione o histórico de eventos MQTT e o estado atual de qualquer chassi na esteira."
      />

      <Card
        title="Buscar veículo por Chassi / VIN"
        subtitle="Consulte diretamente o endpoint GET /api/producao/{vin}"
      >
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 tablet:flex-row tablet:items-end"
        >
          <div className="flex-1">
            <TextInput
              label="Código do Chassi (VIN)"
              placeholder="Ex.: 9BRB29BE0T0048210"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            loading={isFetching}
            iconPosition="left"
            icon={<Search size={18} />}
          >
            Consultar Telemetria
          </Button>
        </form>
      </Card>

      {trackingData ? (
        <div className="grid items-start gap-6 wide:grid-cols-[1fr_1.3fr]">
          <Card
            title="Payload de Telemetria (InfluxDB / MQTT)"
            subtitle={`Chassi consultado: ${queriedVin}`}
            action={<Badge label="Sincronizado" tone="success" />}
          >
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs font-medium text-fg-muted uppercase">
                  Modelo
                </dt>
                <dd className="mt-0.5 font-semibold text-fg">
                  {trackingData.model}
                </dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs font-medium text-fg-muted uppercase">
                  Motorização
                </dt>
                <dd className="mt-0.5 font-semibold text-fg">
                  {trackingData.engine}
                </dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs font-medium text-fg-muted uppercase">
                  Posição na Linha
                </dt>
                <dd className="mt-0.5 font-mono font-semibold text-fg">
                  Estação #{trackingData.currentStepIndex + 1} (
                  {trackingData.progress ?? 50}%)
                </dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3">
                <dt className="text-xs font-medium text-fg-muted uppercase">
                  Último Pulso MQTT
                </dt>
                <dd className="mt-0.5 font-mono font-semibold text-fg">
                  {trackingData.lastTelemetryAt ?? "Agora"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card
            title="Rastreamento Industrial do Chassi"
            subtitle="Estações validadas pelos sensores da linha de montagem"
          >
            <ProductionStepper steps={trackingData.steps} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}

