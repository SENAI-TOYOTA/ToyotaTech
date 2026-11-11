"use client";

import {
  CloudOff,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import VehicleHero from "@/components/garage/VehicleHero";
import PageHeader from "@/components/layout/PageHeader";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ListRow,
} from "@/components/ui";
import {
  isSimulateApiErrorEnabled,
  setSimulateApiError,
} from "@/store/api";
import { useGetVeiculoQuery } from "@/store/slices/garageSlice";
import type { GarageDocument, GarageRecall } from "@/types/garage";

const documentDatePattern =
  /(?:\s*[-|,]\s*)?(?:\(?\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b\)?|\(?\b\d{4}[./-]\d{1,2}[./-]\d{1,2}\b\)?)/g;

export function getDocumentDisplayTitle(title: string) {
  const sanitizedTitle = title
    .replace(documentDatePattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return sanitizedTitle || title;
}

const SAMPLE_RECALLS: GarageRecall[] = [
  {
    id: "rec-tss-2026",
    title: "Atualização preventiva de software do radar frontal (TSS)",
    description:
      "Recalibração gratuita em concessionária autorizada · Tempo estimado: 45 min.",
    status: "Agendamento disponível",
  },
];

function DocumentsCard({ documents }: { documents: GarageDocument[] }) {
  return (
    <Card
      title="Documentos digitais"
      subtitle="Os documentos do seu veículo, sempre à mão."
      padded={false}
      action={
        documents.length ? (
          <Badge label={`${documents.length} arquivos`} tone="neutral" />
        ) : null
      }
    >
      {documents.length ? (
        <div>
          {documents.map((document, index) => {
            const isAvailable = document.status === "available";
            return (
              <ListRow
                key={document.id}
                icon={FileText}
                iconTone={isAvailable ? "primary" : "neutral"}
                title={getDocumentDisplayTitle(document.title)}
                subtitle={document.date}
                showDivider={index > 0}
                href={isAvailable && document.url ? document.url : undefined}
                target={isAvailable && document.url ? "_blank" : undefined}
                trailing={
                  <Badge
                    label={isAvailable ? "Disponível" : "Pendente"}
                    tone={isAvailable ? "success" : "warning"}
                  />
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum documento vinculado"
          description="Os documentos emitidos para o seu veículo aparecerão aqui."
          className="pb-8"
        />
      )}
    </Card>
  );
}

function RecallsCard({ recalls }: { recalls: GarageRecall[] }) {
  return (
    <Card
      title="Campanhas de recall"
      subtitle="Avisos e agendamento de reparos obrigatórios."
      padded={false}
    >
      {recalls.length ? (
        <div>
          {recalls.map((recall, index) => (
            <ListRow
              key={recall.id}
              icon={ShieldAlert}
              iconTone="warning"
              title={recall.title}
              subtitle={recall.description}
              showDivider={index > 0}
              trailing={
                recall.status ? (
                  <Badge label={recall.status} tone="warning" />
                ) : null
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          tone="success"
          title="Nenhum recall registrado"
          description="Seu veículo não tem campanhas de recall abertas."
          className="pb-8"
        />
      )}
    </Card>
  );
}

export default function GaragemPage() {
  const {
    data: garage,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetVeiculoQuery();

  const [simulateRecall, setSimulateRecall] = useState(false);

  const handleToggleApiError = () => {
    setSimulateApiError(!isSimulateApiErrorEnabled());
    void refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Meu veículo"
          title="Gestão do veículo"
          description="Documentos digitais, lembretes e campanhas de recall."
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
              Carregando dados do veículo...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !garage) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="Meu veículo"
          title="Gestão do veículo"
          description="Documentos digitais, lembretes e campanhas de recall."
        />
        <Card>
          <EmptyState
            icon={CloudOff}
            title="Não foi possível carregar os dados do seu veículo"
            description="Verifique sua conexão com o servidor Toyota Tech e tente novamente em instantes."
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

  const documents = garage.documents ?? [];
  const recalls = simulateRecall ? SAMPLE_RECALLS : (garage.recalls ?? []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Meu veículo"
        title="Gestão do veículo"
        description="Documentos digitais, lembretes e campanhas de recall."
        action={
          <div className="flex flex-wrap items-center gap-2">
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
              <span>{isFetching ? "Sincronizando..." : "Sincronizar"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSimulateRecall((prev) => !prev)}
              className="cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg-secondary transition-colors hover:bg-surface-muted hover:text-fg"
            >
              {simulateRecall
                ? "Mostrar sem recall (padrão)"
                : "Simular alerta de recall"}
            </button>
            <button
              type="button"
              onClick={handleToggleApiError}
              className="cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              Testar erro de API
            </button>
          </div>
        }
      />

      {/* Hero Section do Carro */}
      <VehicleHero garage={garage} />

      {/* Colunas de Documentos e Recalls */}
      <div className="grid items-start gap-5 wide:grid-cols-2">
        <DocumentsCard documents={documents} />
        <RecallsCard recalls={recalls} />
      </div>
    </div>
  );
}
