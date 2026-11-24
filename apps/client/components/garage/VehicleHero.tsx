import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";

import VehicleCanvas from "@/components/3d/VehicleCanvas";
import { buttonStyles } from "@/components/ui";
import type { GarageData } from "@/types/garage";

function joinParts(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" • ");
}

function Meta({
  label,
  value,
  highlight = false,
  mono = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium tracking-[0.6px] text-white/55 uppercase">
        {label}
      </p>
      <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
        {highlight ? (
          <span
            aria-hidden
            className="size-1.75 shrink-0 rounded-full bg-[#35C46F]"
          />
        ) : null}
        <p
          className={
            mono
              ? "break-all font-mono text-[13px] leading-snug font-semibold tracking-tight text-white"
              : "break-words text-[15px] leading-snug font-semibold text-white"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export interface VehicleHeroProps {
  garage: GarageData | null;
}

export default function VehicleHero({ garage }: VehicleHeroProps) {
  const vehicle = garage?.vehicle;
  const model = vehicle?.model ?? "Seu Toyota";
  const colorLabel = vehicle?.color ?? "Branco Pérola";
  const specs = joinParts([vehicle?.version, colorLabel]);
  const details = joinParts([vehicle?.year, vehicle?.engine]);

  const metaItems = [
    { label: "Ano / motor", value: details },
    { label: "Chassi", value: vehicle?.chassi, mono: true },
    { label: "Status do pedido", value: garage?.order?.status, highlight: true },
    { label: "Concessionária", value: garage?.order?.dealership },
  ].filter((item) => Boolean(item.value));

  return (
    <section
      aria-label="Destaque do veículo"
      className="grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-3xl bg-ink shadow-raised wide:min-h-[360px] wide:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <div className="order-2 flex min-w-0 flex-col justify-center p-6 wide:order-1 wide:p-7">
        <p className="text-xs font-bold tracking-[1.6px] text-primary uppercase">
          Seu veículo
        </p>
        <h2 className="mt-1 break-words text-3xl leading-10 font-bold text-white tablet:text-4xl">
          {model}
        </h2>
        {specs ? (
          <p className="mt-0.5 break-words text-[17px] leading-snug text-fg-inverse-muted">
            {specs}
          </p>
        ) : null}

        {metaItems.length ? (
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-x-5 gap-y-3.5 xl:grid-cols-2">
            {metaItems.map((item) => (
              <Meta
                key={item.label}
                label={item.label}
                value={item.value ?? ""}
                highlight={item.highlight}
                mono={item.mono}
              />
            ))}
          </div>
        ) : null}

        {!garage ? (
          <p className="mt-4 text-[15px] leading-[21px] text-fg-inverse-muted">
            Sua compra está sendo vinculada à sua conta. Os dados do veículo
            aparecerão aqui em breve.
          </p>
        ) : null}

        <div className="mt-6 flex min-w-0 flex-wrap gap-2.5">
          <Link
            href="/cliente/acompanhamento"
            className={buttonStyles({
              variant: "primary",
              size: "md",
              className: "min-w-fit flex-1 px-4",
            })}
          >
            <span>Acompanhar pedido</span>
            <ArrowRight aria-hidden size={18} strokeWidth={2.4} className="shrink-0" />
          </Link>
          <Link
            href="/cliente/financiamento"
            className={buttonStyles({
              variant: "inverse",
              size: "md",
              className: "min-w-fit flex-1 px-4",
            })}
          >
            <Wallet aria-hidden size={17} strokeWidth={2} className="shrink-0" />
            <span>Financiamento</span>
          </Link>
        </div>
      </div>

      <div className="order-1 relative min-h-[260px] min-w-0 overflow-hidden bg-ink-soft wide:order-2 wide:min-h-[360px]">
        <VehicleCanvas
          color={colorLabel}
          height={340}
          className="size-full rounded-none"
        />
      </div>
    </section>
  );
}
