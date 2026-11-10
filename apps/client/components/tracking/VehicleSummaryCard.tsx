import Image from "next/image";

import { Card, VehicleFallback } from "@/components/ui";
import type { TrackingInfo } from "@/types/tracking";

function canUseCorollaImage(model?: string) {
  return Boolean(model && model.toLowerCase().includes("corolla"));
}

function Spec({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex-1 rounded-xl bg-surface-muted p-3">
      <p className="text-xs font-medium tracking-[0.6px] text-fg-muted uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold text-fg">{value || "-"}</p>
    </div>
  );
}

export interface VehicleSummaryCardProps {
  data: TrackingInfo;
  chassi?: string;
  orderId?: string;
  dealership?: string;
}

export default function VehicleSummaryCard({
  data,
  chassi,
  orderId,
  dealership,
}: VehicleSummaryCardProps) {
  const showImage = canUseCorollaImage(data.model);
  const specsLine = [data.version, data.color].filter(Boolean).join(" • ");

  return (
    <Card>
      <div className="relative -mx-5 -mt-5 mb-4 h-48 overflow-hidden bg-ink">
        {showImage ? (
          <Image
            src="/img/corolla.webp"
            alt={data.model}
            fill
            sizes="(min-width: 960px) 380px, 100vw"
            className="object-cover"
          />
        ) : (
          <VehicleFallback model={data.model} variant="card" />
        )}
        {orderId ? (
          <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold tracking-[0.4px] text-white backdrop-blur-xs">
            Pedido #{orderId}
          </span>
        ) : null}
      </div>

      <h2 className="text-2xl font-bold text-fg">{data.model}</h2>
      {specsLine ? (
        <p className="mt-0.5 text-base text-fg-secondary">{specsLine}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Spec label="Ano" value={data.year} />
        <Spec label="Motor" value={data.engine} />
        <Spec label="Chassi / ID" value={chassi ?? data.vehicleId} />
        <Spec label="Concessionária" value={dealership ?? "Toyota Sorocaba"} />
      </div>
    </Card>
  );
}

