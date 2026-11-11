import { ArrowRight, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonStyles, VehicleFallback } from "@/components/ui";
import type { GarageData } from "@/types/garage";

function joinParts(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" • ");
}

function canUseCorollaImage(model?: string) {
  return Boolean(model && model.toLowerCase().includes("corolla"));
}

function Meta({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-[130px] flex-1 basis-[40%]">
      <p className="text-xs font-medium tracking-[0.6px] text-white/55 uppercase">
        {label}
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        {highlight ? (
          <span
            aria-hidden
            className="size-1.75 shrink-0 rounded-full bg-[#35C46F]"
          />
        ) : null}
        <p className="truncate text-base font-semibold text-white">{value}</p>
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
  const specs = joinParts([vehicle?.version, vehicle?.color]);
  const details = joinParts([vehicle?.year, vehicle?.engine]);
  const showImage = canUseCorollaImage(vehicle?.model);

  const metaItems = [
    { label: "Ano / motor", value: details },
    { label: "Chassi", value: vehicle?.chassi },
    { label: "Status do pedido", value: garage?.order?.status, highlight: true },
    { label: "Concessionária", value: garage?.order?.dealership },
  ].filter((item) => Boolean(item.value));

  return (
    <section
      aria-label="Destaque do veículo"
      className="flex flex-col overflow-hidden rounded-3xl bg-ink shadow-raised wide:min-h-[360px] wide:flex-row-reverse"
    >
      {/* Imagem / Mídia do carro */}
      <div className="relative h-56 bg-ink-soft wide:h-auto wide:flex-[1.15]">
        {showImage ? (
          <Image
            src="/img/corolla.webp"
            alt={model}
            fill
            priority
            sizes="(min-width: 960px) 520px, 100vw"
            className="object-cover"
          />
        ) : (
          <VehicleFallback model={vehicle?.model} variant="hero" />
        )}
      </div>

      {/* Informações do veículo */}
      <div className="flex flex-1 flex-col justify-center p-6 wide:p-10">
        <p className="text-xs font-bold tracking-[1.6px] text-primary uppercase">
          Seu veículo
        </p>
        <h2 className="mt-1 text-3xl leading-10 font-bold text-white tablet:text-4xl">
          {model}
        </h2>
        {specs ? (
          <p className="mt-0.5 text-[17px] text-fg-inverse-muted">{specs}</p>
        ) : null}

        {metaItems.length ? (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3.5">
            {metaItems.map((item) => (
              <Meta
                key={item.label}
                label={item.label}
                value={item.value ?? ""}
                highlight={item.highlight}
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

        <div className="mt-6 flex flex-col gap-2.5 wide:flex-row">
          <Link
            href="/cliente/acompanhamento"
            className={buttonStyles({
              variant: "primary",
              size: "lg",
              className: "wide:flex-1",
            })}
          >
            <span>Acompanhar pedido</span>
            <ArrowRight aria-hidden size={20} strokeWidth={2.4} />
          </Link>
          <Link
            href="/cliente/financiamento"
            className={buttonStyles({
              variant: "inverse",
              size: "lg",
              className: "wide:flex-1",
            })}
          >
            <Wallet aria-hidden size={18} strokeWidth={2} />
            <span>Financiamento</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

