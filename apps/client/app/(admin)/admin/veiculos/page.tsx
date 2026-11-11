"use client";

import { CarFront, Factory } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, buttonStyles, Card, ListRow } from "@/components/ui";
import { setSimulatedStepCursor } from "@/store/api";
import { useGetProducaoStatusQuery } from "@/store/slices/productionTrackingSlice";

const ACTIVE_CHASSIS = [
  {
    vin: "9BRB29BE0T0048210",
    model: "Toyota Corolla Altis Hybrid Premium",
    color: "Branco Pérola",
    dealership: "Toyota Sorocaba",
    orderId: "TT-48210",
    stepIndex: 2,
    stage: "Em Montagem",
  },
  {
    vin: "9BRB29BE0T0048198",
    model: "Toyota Corolla Cross XRX Hybrid",
    color: "Prata Lua Nova",
    dealership: "Toyota Campinas",
    orderId: "TT-48198",
    stepIndex: 3,
    stage: "Inspeção de Qualidade",
  },
  {
    vin: "9BRB29BE0T0048175",
    model: "Toyota Hilux SRX 2.8 Diesel 4x4",
    color: "Cinza Granito",
    dealership: "Toyota São Paulo Morumbi",
    orderId: "TT-48175",
    stepIndex: 4,
    stage: "Em Transporte",
  },
  {
    vin: "9BRB29BE0T0048142",
    model: "Toyota Corolla Altis Hybrid",
    color: "Preto Eclipse",
    dealership: "Toyota Sorocaba",
    orderId: "TT-48142",
    stepIndex: 5,
    stage: "Pronto para Retirada",
  },
];

export default function AdminVeiculosPage() {
  const { data: liveTracking, refetch } = useGetProducaoStatusQuery(
    "9BRB29BE0T0048210",
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Gestão Industrial"
        title="Gestão de Veículos na Esteira"
        description="Chassis em fabricação ativa na planta de Sorocaba e expedição para concessionárias."
        action={
          <Link
            href="/admin/consultas"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Consultar Chassi / VIN
          </Link>
        }
      />

      <Card
        title="Lote Ativo na Linha TNGA"
        subtitle="Clique em um estágio para sincronizar o simulador com o chassi principal (#TT-48210)"
        padded={false}
        action={
          <Badge
            label={`${ACTIVE_CHASSIS.length} veículos monitorados`}
            tone="info"
          />
        }
      >
        <div>
          {ACTIVE_CHASSIS.map((item, index) => {
            const isPrimary = item.vin === "9BRB29BE0T0048210";
            const currentStage = isPrimary
              ? (liveTracking?.stage ?? item.stage)
              : item.stage;

            return (
              <ListRow
                key={item.vin}
                icon={isPrimary ? Factory : CarFront}
                iconTone={isPrimary ? "primary" : "neutral"}
                title={`${item.model} (${item.color})`}
                subtitle={`Chassi: ${item.vin} · Pedido #${item.orderId} · Destino: ${item.dealership}`}
                showDivider={index > 0}
                onClick={() => {
                  setSimulatedStepCursor(item.stepIndex);
                  void refetch();
                }}
                trailing={
                  <Badge
                    label={currentStage}
                    tone={isPrimary ? "primary" : "info"}
                  />
                }
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

