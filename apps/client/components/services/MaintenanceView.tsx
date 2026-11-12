"use client";

import { CalendarCheck, CalendarPlus, CheckCircle2, Circle, History } from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, buttonStyles, Card, ListRow } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  CURRENT_MILEAGE,
  formatCurrency,
  formatNumber,
  getNextMaintenance,
  MAINTENANCE_PLAN,
  SERVICE_HISTORY,
} from "@/lib/mocks/aftersales";
import { cancelBooking, useAppDispatch, useAppSelector } from "@/store";

import BackLink from "./BackLink";

export default function MaintenanceView() {
  const bookings = useAppSelector((state) => state.engagement.bookings);
  const dispatch = useAppDispatch();
  const next = getNextMaintenance();

  return (
    <div>
      <BackLink href="/cliente/servicos" />
      <PageHeader
        title="Plano de revisões"
        description="Mantenha sua garantia válida com as revisões programadas Toyota."
        action={
          <Link href="/cliente/servicos/agendamento" className={buttonStyles({ size: "md" })}>
            <CalendarPlus aria-hidden size={18} />
            Agendar serviço
          </Link>
        }
      />

      <div className="grid items-start gap-5 wide:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Card title="Seus agendamentos" subtitle="Serviços agendados nas concessionárias Toyota." padded={false}>
            {bookings.length ? (
              <ul>
                {bookings.map((booking, index) => (
                  <li key={booking.id}>
                    <ListRow
                      icon={CalendarCheck}
                      iconTone="success"
                      title={`${booking.date} às ${booking.time}`}
                      subtitle={`${booking.service} · ${booking.dealership}${booking.notes ? ` · "${booking.notes}"` : ""}`}
                      showDivider={index > 0}
                      trailing={
                        <span className="flex flex-col items-end gap-1.5">
                          <Badge label="Confirmado" tone="success" />
                          <button
                            type="button"
                            onClick={() => dispatch(cancelBooking(booking.id))}
                            className="cursor-pointer text-sm font-medium text-fg-secondary underline hover:text-primary"
                          >
                            Cancelar
                          </button>
                        </span>
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-3 px-5 pb-5">
                <p className="text-fg-secondary">Você não tem agendamentos futuros.</p>
                <Link href="/cliente/servicos/agendamento" className={buttonStyles({ size: "md", className: "w-fit" })}>
                  <CalendarPlus aria-hidden size={18} />
                  Agendar serviço
                </Link>
              </div>
            )}
          </Card>

          <Card title="Histórico de serviços" padded={false}>
            {SERVICE_HISTORY.map((record) => (
              <ListRow
                key={record.id}
                icon={History}
                title={record.title}
                subtitle={`${record.date} · ${record.mileage} km · ${record.dealership}`}
                trailing={<span className="text-sm font-semibold text-fg-secondary">{record.total}</span>}
              />
            ))}
          </Card>
        </div>

        <Card title="Revisões programadas" subtitle={`Quilometragem atual: ${formatNumber(CURRENT_MILEAGE)} km`}>
          <ol>
            {MAINTENANCE_PLAN.map((item, index) => {
              const done = item.mileage <= CURRENT_MILEAGE;
              const isNext = item.id === next.id;
              const Icon = done ? CheckCircle2 : Circle;
              return (
                <li key={item.id} className={cn("flex gap-3 py-3.5", index > 0 && "border-t border-border")}>
                  <Icon
                    aria-hidden
                    size={20}
                    className={cn("mt-0.5 shrink-0", done ? "text-success" : isNext ? "text-primary" : "text-fg-muted")}
                  />
                  <div className="flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-fg">
                      {item.title}
                      {isNext ? <Badge label="Próxima" tone="primary" /> : null}
                    </p>
                    <p className="text-sm font-medium text-fg-secondary">
                      {formatNumber(item.mileage)} km ou {item.months} meses · {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-fg-muted">{item.items.join(", ")}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    </div>
  );
}
