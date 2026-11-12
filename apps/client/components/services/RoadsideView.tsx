import { BatteryWarning, Car, CircleDot, KeyRound, Phone, Truck } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { buttonStyles, Card } from "@/components/ui";
import { ROADSIDE_PHONE } from "@/lib/mocks/aftersales";
import { MOCK_GARAGE_DATA } from "@/lib/mocks/garage";

import BackLink from "./BackLink";

const coverages = [
  { icon: Truck, title: "Guincho", text: "Até a concessionária Toyota mais próxima." },
  { icon: CircleDot, title: "Pneu furado", text: "Troca pelo estepe no local." },
  { icon: BatteryWarning, title: "Bateria", text: "Carga na bateria e diagnóstico." },
  { icon: KeyRound, title: "Chaveiro", text: "Chave trancada dentro do carro." },
  { icon: Car, title: "Táxi ou carro reserva", text: "Transporte quando o reparo demorar." },
];

const steps = [
  "Fique em um local seguro e ligue o pisca-alerta.",
  "Ligue para o número 24h e informe o número do chassi.",
  "Compartilhe sua localização e aguarde o prestador de serviço.",
];

export default function RoadsideView() {
  return (
    <div>
      <BackLink href="/cliente/servicos" />
      <PageHeader
        title="Assistência 24 horas"
        description="Disponível 24 horas por dia, 7 dias por semana, em todo o Brasil."
      />

      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-5 rounded-2xl bg-ink p-6 text-white tablet:flex-row tablet:items-center tablet:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[2px] text-primary uppercase">Assistência Toyota 24h</p>
            <p className="mt-2 text-4xl font-bold tablet:text-5xl">{ROADSIDE_PHONE}</p>
            <p className="mt-1 text-fg-inverse-muted">
              Tenha o número do chassi em mãos: {MOCK_GARAGE_DATA.vehicle.chassi}
            </p>
          </div>
          <a href={`tel:${ROADSIDE_PHONE.replace(/\s/g, "")}`} className={buttonStyles({ className: "shrink-0" })}>
            <Phone aria-hidden size={20} />
            Ligar agora
          </a>
        </section>

        <div className="grid items-start gap-5 wide:grid-cols-[1.5fr_1fr]">
          <Card title="O que está coberto">
            <ul className="grid gap-3 tablet:grid-cols-2 wide:grid-cols-3">
              {coverages.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-xl bg-surface-muted p-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon aria-hidden size={20} strokeWidth={1.8} />
                  </span>
                  <p className="mt-3 font-semibold text-fg">{title}</p>
                  <p className="text-sm text-fg-secondary">{text}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="O que fazer">
            <ol className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-fg-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
