"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import {
  clientHeaderNavItems,
  clientTabBarItems,
  isNavItemActive,
} from "./client-nav";

export function ClientHeaderNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal do cliente"
      className="hidden min-w-0 items-center gap-0.5 wide:flex"
    >
      {clientHeaderNavItems.map((item) => {
        const isActive = isNavItemActive(item, pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1.5 text-[13px] whitespace-nowrap outline-none transition-colors xl:px-3 xl:text-sm",
              "focus-visible:ring-3 focus-visible:ring-primary/30",
              isActive
                ? "bg-primary-soft font-semibold text-primary"
                : "font-medium text-fg-secondary hover:bg-surface-muted hover:text-fg",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ClientHeaderSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Atalhos do cliente"
      className="border-t border-border/70 bg-surface wide:hidden"
    >
      <div className="mx-auto flex w-full max-w-content items-center gap-1.5 overflow-x-auto px-gutter py-2">
        {clientHeaderNavItems.map((item) => {
          const isActive = isNavItemActive(item, pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs whitespace-nowrap outline-none transition-colors",
                "focus-visible:ring-3 focus-visible:ring-primary/30",
                isActive
                  ? "bg-primary-soft font-semibold text-primary"
                  : "bg-surface-muted font-medium text-fg-secondary hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
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
        {clientTabBarItems.map((item) => {
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

