"use client";

import { CalendarPlus, Clock, MapPin, Navigation, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, buttonStyles, Card, EmptyState, TextInput } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DEALERSHIPS, mapQuery } from "@/lib/mocks/aftersales";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function DealershipsView() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(DEALERSHIPS[0].id);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return DEALERSHIPS;
    return DEALERSHIPS.filter((item) => normalize(`${item.name} ${item.city}`).includes(term));
  }, [query]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  return (
    <div>
      <PageHeader eyebrow="Serviços" title="Concessionárias" description="Serviço autorizado Toyota perto de você." />

      <TextInput
        aria-label="Buscar concessionária"
        placeholder="Buscar por nome ou cidade"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        rightAccessory={<Search aria-hidden size={18} className="text-fg-muted" />}
        containerClassName="mb-5"
      />

      {selected ? (
        <div className="grid items-start gap-5 wide:grid-cols-[1fr_1.2fr]">
          <ul className="flex flex-col gap-3" aria-label="Lista de concessionárias">
            {filtered.map((item) => {
              const active = item.id === selected.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-2xl border-2 bg-surface p-5 shadow-card transition-colors",
                    active ? "border-primary" : "border-transparent hover:border-border-strong",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedId(item.id)}
                    className="w-full cursor-pointer rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
                  >
                    <span className="block text-lg font-bold text-fg">{item.name}</span>
                    <span className="mt-2 flex items-center gap-2 text-sm text-fg-secondary">
                      <MapPin aria-hidden size={16} className="text-fg-muted" /> {item.address}, {item.city}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-sm text-fg-secondary">
                      <Clock aria-hidden size={16} className="text-fg-muted" /> {item.hours}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-sm text-fg-secondary">
                      <Phone aria-hidden size={16} className="text-fg-muted" /> {item.phone}
                    </span>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.services.map((service) => (
                      <Badge key={service} label={service} />
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}
                      className={buttonStyles({ variant: "outline", size: "md", className: "flex-1" })}
                    >
                      <Phone aria-hidden size={16} />
                      Ligar
                    </a>
                    <Link href="/cliente/servicos/agendamento" className={buttonStyles({ size: "md", className: "flex-1" })}>
                      <CalendarPlus aria-hidden size={16} />
                      Agendar
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="wide:sticky wide:top-24">
            <Card padded={false}>
              <iframe
                key={selected.id}
                title={`Mapa: ${selected.name}`}
                src={`https://www.google.com/maps?q=${mapQuery(selected)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[340px] w-full border-0 bg-surface-muted wide:h-[460px]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-lg font-bold text-fg">{selected.name}</p>
                  <p className="text-fg-secondary">
                    {selected.address}, {selected.city}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery(selected)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ size: "md" })}
                >
                  <Navigation aria-hidden size={16} />
                  Como chegar
                </a>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState icon={MapPin} title="Nenhuma concessionária encontrada" description="Tente outro nome ou cidade." />
        </Card>
      )}
    </div>
  );
}
