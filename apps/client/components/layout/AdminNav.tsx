"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { adminNavItems, isAdminNavItemActive } from "./admin-nav";

/** Sidebar lateral do Portal de Gestão (telas largas, ≥ 960px). */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 wide:block">
      <div className="sticky top-24 flex flex-col gap-4">
        <nav aria-label="Navegação do Portal de Gestão">
          <p className="mb-2 px-3.5 text-xs font-bold tracking-[1.4px] text-fg-muted uppercase">
            Menu Operacional
          </p>
          <ul className="flex flex-col gap-1.5">
            {adminNavItems.map((item) => {
              const isActive = isAdminNavItemActive(item, pathname);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3.5 py-3 outline-none transition-colors",
                      "focus-visible:ring-3 focus-visible:ring-primary/30",
                      isActive
                        ? "bg-surface font-semibold text-fg shadow-card"
                        : "font-medium text-fg-secondary hover:bg-surface hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-surface-muted text-fg-muted group-hover:text-fg-secondary",
                      )}
                    >
                      <Icon
                        aria-hidden
                        size={18}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base leading-5">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs font-normal text-fg-muted">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Card de status do Broker MQTT / InfluxDB na Sidebar */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.8px] text-fg uppercase">
            <Activity aria-hidden size={14} className="text-success" />
            <span>Telemetria Planta Sorocaba</span>
          </div>
          <p className="mt-1.5 text-xs leading-4 text-fg-secondary">
            Broker MQTT e bucket InfluxDB sincronizados com a esteira TNGA.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 font-mono text-[11px] text-fg-muted">
            <span>Tópico: toyota/+/status</span>
            <span className="font-semibold text-success">ONLINE</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Barra inferior de navegação do Gestor em telas estreitas. */
export function AdminTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação do Portal de Gestão"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-bar wide:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-content grid-cols-3">
        {adminNavItems.map((item) => {
          const isActive = isAdminNavItemActive(item, pathname);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium outline-none",
                  isActive
                    ? "text-primary"
                    : "text-fg-muted hover:text-fg-secondary",
                )}
              >
                <Icon
                  aria-hidden
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

