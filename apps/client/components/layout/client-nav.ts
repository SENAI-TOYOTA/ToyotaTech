import {
  Award,
  CarFront,
  Factory,
  Home,
  MapPin,
  Newspaper,
  ShoppingBag,
  User,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface ClientNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Quando true, só fica ativo na rota exata (evita "/cliente" casar tudo). */
  exact?: boolean;
  inTabBar?: boolean;
}

export const clientNavItems: ClientNavItem[] = [
  { href: "/cliente", label: "Início", icon: Home, exact: true, inTabBar: true },
  { href: "/cliente/acompanhamento", label: "Acompanhamento", icon: Factory, inTabBar: true },
  { href: "/cliente/garagem", label: "Garagem", icon: CarFront, inTabBar: true },
  { href: "/cliente/financiamento", label: "Financiamento", icon: Wallet, inTabBar: true },
  { href: "/cliente/servicos", label: "Serviços", icon: Wrench, inTabBar: true },
  { href: "/cliente/concessionarias", label: "Concessionárias", icon: MapPin },
  { href: "/cliente/loja", label: "Loja", icon: ShoppingBag },
  { href: "/cliente/recompensas", label: "Recompensas", icon: Award },
  { href: "/cliente/noticias", label: "Notícias", icon: Newspaper },
  { href: "/cliente/perfil", label: "Perfil", icon: User },
];

export const clientTabBarItems = clientNavItems.filter((item) => item.inTabBar);

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

