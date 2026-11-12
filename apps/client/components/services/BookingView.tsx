"use client";

import { CalendarCheck, Check, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Button, buttonStyles, Card, Chip, EmptyState, FormMessage } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  DEALERSHIPS,
  getUpcomingServiceDates,
  SERVICE_TIMES,
  SERVICE_TYPES,
} from "@/lib/mocks/aftersales";
import { addBooking, BOOKING_REWARD_POINTS, useAppDispatch, type ServiceBooking } from "@/store";

import BackLink from "./BackLink";

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {number}
        </span>
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export default function BookingView() {
  const dispatch = useAppDispatch();
  const dates = useMemo(() => getUpcomingServiceDates(10), []);
  const [dealershipId, setDealershipId] = useState(DEALERSHIPS[0].id);
  const [service, setService] = useState(SERVICE_TYPES[0]);
  const [dateIndex, setDateIndex] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Omit<ServiceBooking, "id"> | null>(null);

  const dealership = DEALERSHIPS.find((item) => item.id === dealershipId) ?? DEALERSHIPS[0];
  const date = dateIndex !== null ? dates[dateIndex] : null;

  const confirm = () => {
    if (!date || !time) {
      setError("Escolha uma data e um horário para continuar.");
      return;
    }
    const booking = {
      dealership: dealership.name,
      service,
      date: date.full,
      time,
      notes: notes.trim() || undefined,
    };
    dispatch(addBooking(booking));
    setError(null);
    setConfirmed(booking);
  };

  if (confirmed) {
    return (
      <Card className="mx-auto max-w-xl">
        <EmptyState
          icon={CalendarCheck}
          tone="success"
          title="Seu serviço está agendado!"
          description={`${confirmed.service} na ${confirmed.dealership} em ${confirmed.date} às ${confirmed.time}. A concessionária entrará em contato para confirmar. Você ganhou ${BOOKING_REWARD_POINTS} pontos.`}
          action={
            <div className="flex flex-col gap-2">
              <Link href="/cliente/servicos/revisoes" className={buttonStyles({ size: "md", fullWidth: true })}>
                Ver meus agendamentos
              </Link>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => {
                  setConfirmed(null);
                  setDateIndex(null);
                  setTime(null);
                  setNotes("");
                }}
              >
                Agendar outro
              </Button>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <BackLink href="/cliente/servicos" />
      <PageHeader title="Agendar serviço" description="Escolha a concessionária, o serviço e o melhor horário para você." />

      <div className="grid items-start gap-5 wide:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-5">
          <Step number={1} title="Concessionária">
            <div className="grid gap-2 tablet:grid-cols-3">
              {DEALERSHIPS.map((item) => {
                const selected = item.id === dealershipId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setDealershipId(item.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border p-3.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-primary/30",
                      selected ? "border-ink bg-ink text-white" : "border-border-strong hover:bg-surface-muted",
                    )}
                  >
                    <span className="block font-semibold">{item.name}</span>
                    <span className={cn("block text-sm", selected ? "text-white/70" : "text-fg-secondary")}>{item.city}</span>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step number={2} title="Tipo de serviço">
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((item) => (
                <Chip key={item} selected={item === service} onClick={() => setService(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          </Step>

          <Step number={3} title="Data e horário">
            <p className="mb-2 text-sm font-semibold text-fg-secondary">Data</p>
            <div className="flex flex-wrap gap-2">
              {dates.map((item, index) => (
                <Chip key={item.iso} caption={item.weekday} selected={index === dateIndex} onClick={() => setDateIndex(index)}>
                  {item.label}
                </Chip>
              ))}
            </div>
            <p className="mt-5 mb-2 text-sm font-semibold text-fg-secondary">Horário</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TIMES.map((item) => (
                <Chip key={item} selected={item === time} onClick={() => setTime(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          </Step>

          <Card>
            <label htmlFor="booking-notes" className="text-sm font-semibold text-fg">
              Observações para o técnico (opcional)
            </label>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Exemplo: barulho ao frear"
              className="mt-1.5 w-full resize-y rounded-xl border border-border-strong bg-surface p-3 text-fg outline-none placeholder:text-fg-muted focus:border-ink focus:shadow-focus"
            />
          </Card>
        </div>

        <aside className="wide:sticky wide:top-24">
          <Card title="Resumo">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-xs font-medium tracking-wide text-fg-muted uppercase">Concessionária</dt>
                <dd className="font-semibold text-fg">{dealership.name}</dd>
                <dd className="flex items-center gap-1 text-sm text-fg-secondary">
                  <MapPin aria-hidden size={14} /> {dealership.address}, {dealership.city}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-fg-muted uppercase">Serviço</dt>
                <dd className="font-semibold text-fg">{service}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-fg-muted uppercase">Data e horário</dt>
                <dd className="font-semibold text-fg">
                  {date ? `${date.weekday}, ${date.full}` : "Escolha uma data"}
                  {time ? ` às ${time}` : ""}
                </dd>
              </div>
            </dl>
            <FormMessage message={error} className="mt-4" />
            <Button fullWidth className="mt-5" icon={<Check size={20} />} onClick={confirm}>
              Confirmar agendamento
            </Button>
            <p className="mt-2 text-center text-sm text-fg-secondary">
              Agendando pelo portal você ganha {BOOKING_REWARD_POINTS} pontos.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
