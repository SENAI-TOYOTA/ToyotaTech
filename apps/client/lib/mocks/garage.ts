import type { GarageData } from "@/types/garage";
import type {
  ProducaoStatus,
  TrackingStep,
  TrackingStepStatus,
} from "@/types/tracking";

export const MOCK_TRACKING_STEPS: TrackingStep[] = [
  {
    id: "1",
    label: "Produção Iniciada",
    status: "completed",
    date: "10/05/2026",
    station: "Estação 01 · Estamparia e Solda do Chassi",
    description:
      "Chassi conformado em aço de alta resistência TNGA e validado pelos sensores laser.",
  },
  {
    id: "2",
    label: "Pintura",
    status: "completed",
    date: "12/05/2026",
    station: "Estação 02 · Banho Eletrostático e Cabine Robótica",
    description:
      "Aplicação de tratamento anticorrosivo, primer e pintura Branco Pérola com cura térmica.",
  },
  {
    id: "3",
    label: "Em Montagem",
    status: "current",
    date: "15/05/2026",
    station: "Estação 03 · Powertrain Híbrido e Acabamento",
    description:
      "Acoplamento do conjunto 1.8 Hybrid ao chassi, chicotes elétricos, painel e bancos.",
  },
  {
    id: "4",
    label: "Inspeção de Qualidade",
    status: "pending",
    date: "Previsão 18/05/2026",
    station: "Estação 04 · Inspeção Final de Qualidade e Expedição",
    description:
      "Testes dinâmicos de rodagem, calibração do Toyota Safety Sense e liberação para embarque.",
  },
  {
    id: "5",
    label: "Em Transporte",
    status: "pending",
    date: "Previsão 22/05/2026",
    station: "Estação 05 · Logística e Transporte",
    description:
      "Transporte dedicado da planta de Sorocaba (SP) até a concessionária de destino.",
  },
  {
    id: "6",
    label: "Pronto para Retirada",
    status: "pending",
    date: "Previsão 26/05/2026",
    station: "Estação 06 · Preparação Final (PDI) e Entrega",
    description:
      "Revisão de entrega na concessionária e agendamento para retirada pelo cliente.",
  },
];

export function buildProducaoStatusAtStep(
  stepIndex: number,
  vin = "9BRB29BE0T0048210",
): ProducaoStatus {
  const clamped = Math.max(0, Math.min(stepIndex, MOCK_TRACKING_STEPS.length));
  const steps: TrackingStep[] = MOCK_TRACKING_STEPS.map((step, index) => {
    let status: TrackingStepStatus = "pending";
    if (index < clamped) {
      status = "completed";
    } else if (index === clamped) {
      status = "current";
    }
    return {
      ...step,
      status,
      date:
        status === "completed"
          ? step.date?.replace(/^Previsão\s+/i, "") || "Concluído"
          : status === "current"
            ? "Em andamento · Telemetria IIoT ativa"
            : step.date,
    };
  });

  const activeStage =
    steps.find((s) => s.status === "current")?.label ?? "Pronto para Retirada";
  const progress = Math.round(
    ((clamped + (clamped < steps.length ? 0.5 : 0)) / steps.length) * 100,
  );

  return {
    vehicleId: "CHASSI_48210",
    vin,
    chassi: vin,
    model: "Toyota Corolla Altis",
    version: "Hybrid Premium",
    color: "Branco Pérola",
    year: "2026",
    engine: "1.8 Hybrid Flex",
    currentStepIndex: clamped,
    stage: activeStage,
    progress: Math.min(progress, 100),
    steps,
    lastTelemetryAt: new Date().toLocaleTimeString("pt-BR"),
  };
}

export const MOCK_TRACKING_INFO: ProducaoStatus =
  buildProducaoStatusAtStep(2);

export const MOCK_GARAGE_DATA: GarageData = {
  userId: "usr_demo_toyota_01",
  order: {
    orderId: "TT-48210",
    status: "Em produção",
    purchaseDate: "03/05/2026",
    dealership: "Toyota Sorocaba",
  },
  vehicle: {
    vehicleId: "CHASSI_48210",
    vin: "9BRB29BE0T0048210",
    model: "Toyota Corolla Altis",
    version: "Hybrid Premium",
    color: "Branco Pérola",
    year: "2026",
    engine: "1.8 Hybrid Flex",
    chassi: "9BRB29BE0T0048210",
  },
  financing: {
    bank: "Banco Toyota do Brasil S.A.",
    contractNumber: "FIN-8A4C92E10B",
    paidInstallments: 16,
    totalInstallments: 48,
    installmentAmount: "R$ 3.240,00",
    nextDueDate: "15/11/2026",
    boletoAvailable: true,
    status: "Ativo",
  },
  documents: [
    {
      id: "invoice",
      title: "Nota fiscal - 03/05/2026",
      date: "Emitido em 03/05/2026",
      status: "available",
      url: "/pdf/J.pdf",
    },
    {
      id: "crlv",
      title: "Documento do veículo (CRLV-e)",
      date: "Aguardando emplacamento final",
      status: "pending",
    },
    {
      id: "warranty",
      title: "Certificado de Garantia Toyota (5 anos)",
      date: "Emitido em 03/05/2026",
      status: "available",
      url: "/pdf/J.pdf",
    },
    {
      id: "manual",
      title: "Manual do Proprietário · Toyota Corolla Altis",
      date: "Edição 2026 · PDF Digital",
      status: "available",
      url: "/pdf/J.pdf",
    },
    {
      id: "maintenance-plan",
      title: "Plano de revisões programadas",
      date: "Cobertura até 50.000 km",
      status: "available",
      url: "/pdf/J.pdf",
    },
  ],
  recalls: [],
  tracking: MOCK_TRACKING_INFO,
  purchaseId: "demo-48210",
  matchSource: "generated_demo",
  matchConfidence: "generated",
  matchAlgorithmVersion: "cpf_v2",
  createdAt: 1762550000,
  updatedAt: 1762553600,
};
