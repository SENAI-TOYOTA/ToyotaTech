"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { clientNavItems, isNavItemActive } from "./client-nav";

/** Menu lateral (telas largas, ≥ 960px). */
export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 wide:block">
      <nav aria-label="Painel do cliente" className="sticky top-24">
        <ul className="flex flex-col gap-1">
          {clientNavItems.map((item) => {
            const isActive = isNavItemActive(item, pathname);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base outline-none transition-colors",
                    "focus-visible:ring-3 focus-visible:ring-primary/30",
                    isActive
                      ? "bg-surface font-semibold text-fg shadow-card"
                      : "font-medium text-fg-secondary hover:bg-surface hover:text-fg",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-soft text-primary"
                        : "text-fg-muted group-hover:text-fg-secondary",
                    )}
                  >
                    <Icon aria-hidden size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

/** Barra de abas inferior (telas estreitas) — equivalente às Tabs do mobile. */
export function ClientTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Painel do cliente"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-bar wide:hidden"
    >
      <ul className="mx-auto grid h-17 max-w-content grid-cols-5">
        {clientNavItems.map((item) => {
          const isActive = isNavItemActive(item, pathname);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium outline-none",
                  "focus-visible:bg-surface-muted",
                  isActive ? "text-primary" : "text-fg-muted hover:text-fg-secondary",
                )}
              >
                <Icon aria-hidden size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

