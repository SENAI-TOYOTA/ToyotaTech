"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Cpu,
  ExternalLink,
  Flame,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import {
  Badge,
  Card,
  ListRow,
  ProgressBar,
} from "@/components/ui";
import {
  PRODUCTION_POLLING_INTERVAL_MS,
  useGetProducaoStatusQuery,
} from "@/store/slices/productionTrackingSlice";

interface StationMetric {
  id: string;
  station: string;
  avgMinutes: number;
  targetMinutes: number;
  taktSeconds: number;
  targetTaktSeconds: number;
  faults24h: number;
  reworks24h: number;
  isBottleneck?: boolean;
}

const STATION_METRICS: StationMetric[] = [
  {
    id: "st-01",
    station: "Estação 01 · Estamparia & Solda TNGA",
    avgMinutes: 145,
    targetMinutes: 150,
    taktSeconds: 54,
    targetTaktSeconds: 60,
    faults24h: 0,
    reworks24h: 1,
  },
  {
    id: "st-02",
    station: "Estação 02 · Pintura Robótica & Cura",
    avgMinutes: 210,
    targetMinutes: 200,
    taktSeconds: 61,
    targetTaktSeconds: 60,
    faults24h: 1,
    reworks24h: 2,
  },
  {
    id: "st-03",
    station: "Estação 03 · Montagem Powertrain Híbrido",
    avgMinutes: 268,
    targetMinutes: 230,
    taktSeconds: 68,
    targetTaktSeconds: 60,
    faults24h: 1,
    reworks24h: 3,
    isBottleneck: true,
  },
  {
    id: "st-04",
    station: "Estação 04 · Inspeção TSS & Qualidade",
    avgMinutes: 115,
    targetMinutes: 120,
    taktSeconds: 57,
    targetTaktSeconds: 60,
    faults24h: 0,
    reworks24h: 1,
  },
  {
    id: "st-05",
    station: "Estação 05 · Pátio & Expedição Logística",
    avgMinutes: 120,
    targetMinutes: 130,
    taktSeconds: 49,
    targetTaktSeconds: 60,
    faults24h: 0,
    reworks24h: 0,
  },
];

const RECENT_FAULT_EVENTS = [
  {
    id: "evt-101",
    station: "Estação 03 · Montagem Powertrain Híbrido",
    description:
      "Chassi 9BRB29BE0T0048210 · Torque fora da janela nominal no suporte inversor HV (recalibrado).",
    timestamp: "Há 14 min · Tópico: toyota/sorocaba/st03/fault",
    severity: "warning" as const,
  },
  {
    id: "evt-102",
    station: "Estação 02 · Pintura Robótica & Cura",
    description:
      "Chassi 9BRB29BE0T0048198 · Retrabalho de polimento localizado no para-lama dianteiro direito.",
    timestamp: "Há 42 min · Tópico: toyota/sorocaba/st02/rework",
    severity: "warning" as const,
  },
  {
    id: "evt-103",
    station: "Estação 04 · Inspeção TSS & Qualidade",
    description:
      "Lote #48200-48210 · 100% dos radares milimétricos aprovados sem desvios.",
    timestamp: "Há 1h 10min · Tópico: toyota/sorocaba/st04/quality",
    severity: "success" as const,
  },
];

function GrafanaEmbedFrame({
  title,
  metricQuery,
  iframeUrl,
}: {
  title: string;
  metricQuery: string;
  iframeUrl?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 aria-hidden size={16} className="text-primary" />
          <span className="text-xs font-bold tracking-[0.6px] text-fg uppercase">
            Container Grafana / InfluxDB — {title}
          </span>
        </div>
        <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-white">
          {metricQuery}
        </span>
      </div>

      {iframeUrl ? (
        <iframe
          title={`Painel Grafana: ${title}`}
          src={iframeUrl}
          className="h-64 w-full rounded-xl border border-border bg-ink"
          loading="lazy"
        />
      ) : (
        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-border bg-ink p-6 text-center text-white">
          <Cpu aria-hidden size={28} className="text-primary" />
          <p className="mt-2 text-base font-semibold">
            Slot de Incorporação Grafana (`&lt;iframe&gt;`) Pronto
          </p>
          <p className="mt-1 max-w-md text-xs leading-5 text-white/70">
            Configure a variável de ambiente{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-white">
              NEXT_PUBLIC_GRAFANA_DASHBOARD_URL
            </code>{" "}
            para renderizar o painel ao vivo do InfluxDB neste container.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [viewMode, setViewMode] = useState<"native" | "grafana">("native");
  const grafanaBaseUrl = process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_URL;

  const {
    data: liveProducao,
    isFetching,
    refetch,
  } = useGetProducaoStatusQuery("9BRB29BE0T0048210", {
    pollingInterval: PRODUCTION_POLLING_INTERVAL_MS,
  });

  const totalAvgMinutes = STATION_METRICS.reduce(
    (acc, item) => acc + item.avgMinutes,
    0,
  );
  const totalTargetMinutes = STATION_METRICS.reduce(
    (acc, item) => acc + item.targetMinutes,
    0,
  );
  const totalFaults = STATION_METRICS.reduce(
    (acc, item) => acc + item.faults24h,
    0,
  );
  const totalReworks = STATION_METRICS.reduce(
    (acc, item) => acc + item.reworks24h,
    0,
  );
  const bottleneck = STATION_METRICS.find((item) => item.isBottleneck);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Indústria 4.0 · Planta Sorocaba"
        title="Dashboard Operacional da Esteira"
        description="Monitoramento em tempo real de lead time, falhas, retrabalho e gargalos via telemetria MQTT / InfluxDB."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => setViewMode("native")}
                className={
                  viewMode === "native"
                    ? "cursor-pointer rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    : "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-surface-muted hover:text-fg"
                }
              >
                Gráficos Telemetria
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grafana")}
                className={
                  viewMode === "grafana"
                    ? "cursor-pointer rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    : "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-surface-muted hover:text-fg"
                }
              >
                Containers Iframe Grafana
              </button>
            </div>

            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg-secondary transition-colors hover:bg-surface-muted hover:text-fg"
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

      {/* Linha de KPIs Executivos da Fábrica */}
      <section
        aria-label="Indicadores-chave da linha de produção"
        className="grid gap-4 tablet:grid-cols-2 wide:grid-cols-4"
      >
        <Card>
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-info-soft text-info">
              <Clock aria-hidden size={20} />
            </span>
            <Badge label="-2,8% vs meta" tone="success" />
          </div>
          <p className="mt-3 text-xs font-bold tracking-[0.8px] text-fg-muted uppercase">
            Tempo Total de Produção
          </p>
          <p className="mt-1 text-3xl font-bold text-fg">
            {Math.floor(totalAvgMinutes / 60)}h {totalAvgMinutes % 60}min
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            Meta nominal: {Math.floor(totalTargetMinutes / 60)}h{" "}
            {totalTargetMinutes % 60}min por chassi
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-success-soft text-success">
              <Gauge aria-hidden size={20} />
            </span>
            <Badge label="OEE Estável" tone="success" />
          </div>
          <p className="mt-3 text-xs font-bold tracking-[0.8px] text-fg-muted uppercase">
            Eficiência Global (OEE)
          </p>
          <p className="mt-1 text-3xl font-bold text-fg">94,8%</p>
          <ProgressBar
            value={0.948}
            tone="success"
            label="Eficiência OEE da planta"
            className="mt-2.5"
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <AlertTriangle aria-hidden size={20} />
            </span>
            <Badge label={`${totalReworks} retrabalhos`} tone="warning" />
          </div>
          <p className="mt-3 text-xs font-bold tracking-[0.8px] text-fg-muted uppercase">
            Falhas Registradas (24h)
          </p>
          <p className="mt-1 text-3xl font-bold text-fg">
            {totalFaults} ocorrências
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            Índice First Time Through (FTT): 98,4%
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Flame aria-hidden size={20} />
            </span>
            <Badge label="Atenção Takt" tone="primary" />
          </div>
          <p className="mt-3 text-xs font-bold tracking-[0.8px] text-fg-muted uppercase">
            Gargalo Atual
          </p>
          <p className="mt-1 truncate text-xl font-bold text-fg">
            {bottleneck?.station.replace(/^Estação \d+ · /, "") ??
              "Sem gargalos"}
          </p>
          <p className="mt-1 text-xs text-fg-secondary">
            Takt atual: {bottleneck?.taktSeconds ?? 60}s (Meta:{" "}
            {bottleneck?.targetTaktSeconds ?? 60}s)
          </p>
        </Card>
      </section>

      {/* Painéis Gráficos Operacionais: Tempo Total de Produção & Gargalos */}
      <div className="grid items-start gap-6 wide:grid-cols-2">
        {/* Painel 1: Tempo Total de Produção */}
        <Card
          title="Tempo Total de Produção por Estação"
          subtitle="Lead time acumulado por estágio da linha (InfluxDB field: tempo_total)"
          action={<Badge label="InfluxDB · tempo_total" tone="info" />}
        >
          {viewMode === "grafana" ? (
            <GrafanaEmbedFrame
              title="Tempo Total de Produção"
              metricQuery='SELECT mean("tempo_total") FROM "producao_linha" GROUP BY "etapa"'
              iframeUrl={grafanaBaseUrl}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {STATION_METRICS.map((item) => {
                const ratio = Math.min(item.avgMinutes / 300, 1);
                const overTarget = item.avgMinutes > item.targetMinutes;
                return (
                  <div key={item.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-fg">
                        {item.station}
                      </span>
                      <span className="font-mono text-xs text-fg-secondary">
                        <strong className="text-fg">{item.avgMinutes} min</strong>{" "}
                        / meta {item.targetMinutes} min
                      </span>
                    </div>
                    <ProgressBar
                      value={ratio}
                      tone={overTarget ? "primary" : "success"}
                      label={`Tempo na ${item.station}`}
                    />
                  </div>
                );
              })}

              <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3 text-xs text-fg-secondary">
                <span>
                  Chassi monitorado em tempo real:{" "}
                  <strong className="font-mono text-fg">
                    {liveProducao?.chassi ?? "9BRB29BE0T0048210"}
                  </strong>
                </span>
                <span className="font-semibold text-primary">
                  Etapa: {liveProducao?.stage ?? "Em Montagem"}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Painel 2: Gargalos e Takt Time */}
        <Card
          title="Análise de Gargalos e Takt Time"
          subtitle="Comparativo de ciclo real por estação vs. Takt Time nominal de 60s (posicao_linha)"
          action={<Badge label="Gargalo na Estação 03" tone="primary" />}
        >
          {viewMode === "grafana" ? (
            <GrafanaEmbedFrame
              title="Gargalos e Takt Time"
              metricQuery='SELECT max("takt_time"), count("posicao_linha") FROM "producao_linha" GROUP BY "estacao"'
              iframeUrl={grafanaBaseUrl}
            />
          ) : (
            <div className="flex flex-col gap-3.5">
              {STATION_METRICS.map((item) => {
                const delta = item.taktSeconds - item.targetTaktSeconds;
                const isOver = delta > 0;
                return (
                  <div
                    key={item.id}
                    className={
                      item.isBottleneck
                        ? "rounded-xl border border-primary/40 bg-primary-soft/35 p-3.5"
                        : "rounded-xl border border-border bg-surface-muted/60 p-3.5"
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-fg">
                        {item.station}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-fg">
                          {item.taktSeconds}s / chassi
                        </span>
                        <Badge
                          label={
                            isOver
                              ? `+${delta}s (Gargalo)`
                              : `${delta}s (Folga)`
                          }
                          tone={isOver ? "primary" : "success"}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Painel 3: Monitoramento de Falhas e Retrabalho */}
      <Card
        title="Monitoramento de Falhas e Retrabalho (IIoT)"
        subtitle="Ocorrências industriais reportadas pelos sensores MQTT da linha (fields: falha, retrabalho)"
        padded={false}
        action={
          <div className="flex items-center gap-2">
            <Badge label="MQTT + InfluxDB" tone="warning" />
            <button
              type="button"
              onClick={() =>
                setViewMode((m) => (m === "grafana" ? "native" : "grafana"))
              }
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>
                {viewMode === "grafana" ? "Ver lista de eventos" : "Ver Iframe"}
              </span>
              <ExternalLink aria-hidden size={12} />
            </button>
          </div>
        }
      >
        {viewMode === "grafana" ? (
          <div className="p-5">
            <GrafanaEmbedFrame
              title="Histórico de Falhas e Retrabalho"
              metricQuery='SELECT sum("falha"), sum("retrabalho") FROM "producao_linha" WHERE time > now() - 24h'
              iframeUrl={grafanaBaseUrl}
            />
          </div>
        ) : (
          <div>
            {RECENT_FAULT_EVENTS.map((event, index) => (
              <ListRow
                key={event.id}
                icon={
                  event.severity === "warning"
                    ? ShieldAlert
                    : event.severity === "success"
                      ? Activity
                      : Wrench
                }
                iconTone={event.severity === "warning" ? "warning" : "success"}
                title={event.station}
                subtitle={`${event.description} — ${event.timestamp}`}
                showDivider={index > 0}
                trailing={
                  <Badge
                    label={
                      event.severity === "warning" ? "Tratado" : "Normal"
                    }
                    tone={event.severity === "warning" ? "warning" : "success"}
                  />
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

