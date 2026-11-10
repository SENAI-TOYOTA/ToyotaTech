import {
  CarFront,
  Factory,
  Home,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface ClientNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Quando true, só fica ativo na rota exata (evita "/cliente" casar tudo). */
  exact?: boolean;
}

export const clientNavItems: ClientNavItem[] = [
  { href: "/cliente", label: "Início", icon: Home, exact: true },
  { href: "/cliente/acompanhamento", label: "Acompanhamento", icon: Factory },
  { href: "/cliente/garagem", label: "Garagem", icon: CarFront },
  { href: "/cliente/financiamento", label: "Financiamento", icon: Wallet },
  { href: "/cliente/perfil", label: "Perfil", icon: User },
];

export function isNavItemActive(item: ClientNavItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  const shortHref = item.href.replace(/^\/cliente/, "") || "/";
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (shortHref !== "/" &&
      (pathname === shortHref || pathname.startsWith(`${shortHref}/`)))
  );
}

