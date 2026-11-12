import { CalendarCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, buttonStyles, Card, ProgressBar } from "@/components/ui";
import {
  addYears,
  CURRENT_MILEAGE,
  formatNumber,
  WARRANTY_COVERAGES,
  WARRANTY_START_DATE,
} from "@/lib/mocks/aftersales";
import { MOCK_GARAGE_DATA } from "@/lib/mocks/garage";

import BackLink from "./BackLink";

const conditions = [
  "Faça as revisões programadas em concessionárias autorizadas Toyota.",
  "Use peças originais Toyota e os fluidos recomendados.",
  "Mantenha seu histórico de serviços digital em dia.",
];

export default function WarrantyView() {
  const { vehicle } = MOCK_GARAGE_DATA;

  return (
    <div>
      <BackLink href="/cliente/servicos" />
      <PageHeader
        title="Garantia"
        description={`Cobertura do seu ${vehicle.model}, válida a partir da entrega (${WARRANTY_START_DATE}).`}
      />

      <div className="flex flex-col gap-5">
        <section className="flex flex-wrap items-center gap-4 rounded-2xl bg-ink p-6 text-white">
          <span className="flex size-13 items-center justify-center rounded-xl bg-success">
            <ShieldCheck aria-hidden size={28} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">Sua garantia está ativa</h2>
            <p className="text-fg-inverse-muted">
              Chassi {vehicle.chassi} · {formatNumber(CURRENT_MILEAGE)} km
            </p>
          </div>
          <Badge label="Ativa" tone="success" />
        </section>

        <div className="grid gap-5 tablet:grid-cols-3">
          {WARRANTY_COVERAGES.map((coverage) => (
            <Card key={coverage.id}>
              <p className="text-5xl font-bold text-fg">
                {coverage.years}
                <span className="text-xl font-medium text-fg-muted"> anos</span>
              </p>
              <h3 className="mt-2 text-lg font-semibold text-fg">{coverage.title}</h3>
              <p className="text-fg-secondary">{coverage.description}</p>
              <ProgressBar value={0.03} tone="success" label={`Tempo usado: ${coverage.title}`} className="mt-4" />
              <p className="mt-2 text-sm font-medium text-fg-secondary">
                Válida até {addYears(WARRANTY_START_DATE, coverage.years)}
                {coverage.mileage ? ` ou ${formatNumber(coverage.mileage)} km` : ""}
              </p>
            </Card>
          ))}
        </div>

        <Card title="Como manter sua garantia">
          <ul className="flex flex-col gap-3">
            {conditions.map((condition) => (
              <li key={condition} className="flex items-start gap-3 text-fg-secondary">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {condition}
              </li>
            ))}
          </ul>
          <Link href="/cliente/servicos/agendamento" className={buttonStyles({ size: "md", className: "mt-5" })}>
            <CalendarCheck aria-hidden size={18} />
            Agendar revisão
          </Link>
        </Card>
      </div>
    </div>
  );
}
