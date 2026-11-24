"use client";

import {
  Bell,
  BellOff,
  CheckCheck,
  Factory,
  FileText,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import PageHeader from "@/components/layout/PageHeader";
import { Badge, Button, Card, EmptyState } from "@/components/ui";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  href: string;
  icon: LucideIcon;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Seu Corolla entrou na Estação 03 · Montagem",
    description:
      "O powertrain 1.8 Hybrid Flex está sendo acoplado ao chassi na planta de Sorocaba.",
    date: "Hoje, 14:20",
    category: "Produção",
    href: "/cliente/acompanhamento",
    icon: Factory,
    unread: true,
  },
  {
    id: "n2",
    title: "Boleto da próxima parcela disponível",
    description:
      "A parcela do contrato FIN-8A4C92E10B com vencimento em 15/06/2026 já pode ser consultada.",
    date: "Ontem, 09:15",
    category: "Financiamento",
    href: "/cliente/financiamento",
    icon: Wallet,
    unread: true,
  },
  {
    id: "n3",
    title: "Nota fiscal e manual digital liberados",
    description:
      "Os documentos do seu pedido já estão disponíveis para visualização na Garagem Digital.",
    date: "12/05/2026",
    category: "Documentos",
    href: "/cliente/garagem",
    icon: FileText,
    unread: false,
  },
];

export default function NotificationsView() {
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = items.filter((item) => item.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Caixa de entrada"
        title="Notificações"
        description="Atualizações sobre o seu pedido, financiamento e documentos."
        action={
          items.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {unreadCount > 0 ? (
                <Button
                  size="md"
                  variant="secondary"
                  icon={<CheckCheck size={16} />}
                  onClick={markAllRead}
                >
                  Marcar como lidas
                </Button>
              ) : null}
              <button
                type="button"
                onClick={clearAll}
                className="cursor-pointer rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
              >
                Limpar caixa
              </button>
            </div>
          ) : null
        }
      />

      {items.length > 0 ? (
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((n) =>
                          n.id === item.id ? { ...n, unread: false } : n,
                        ),
                      )
                    }
                    className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-muted ${
                      item.unread ? "bg-primary-soft/25" : ""
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        item.unread
                          ? "bg-primary-soft text-primary"
                          : "bg-surface-muted text-fg-secondary"
                      }`}
                    >
                      <Icon aria-hidden size={19} strokeWidth={1.9} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-fg">
                          {item.title}
                        </p>
                        {item.unread ? (
                          <Badge label="Nova" tone="primary" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-fg-secondary">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-fg-muted">
                        <span>{item.category}</span>
                        <span aria-hidden>·</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={BellOff}
            title="Tudo em dia por aqui"
            description="Novas mensagens sobre o seu pedido, financiamento e documentos aparecerão aqui."
            action={
              <Button
                size="md"
                variant="secondary"
                icon={<Bell size={16} />}
                onClick={() => setItems(INITIAL_NOTIFICATIONS)}
              >
                Restaurar avisos de exemplo
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}
