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
  exact?: boolean;
  inTabBar?: boolean;
  inHeader?: boolean;
}

export const clientNavItems: ClientNavItem[] = [
  { href: "/cliente", label: "Início", icon: Home, exact: true, inTabBar: true, inHeader: true },
  { href: "/cliente/acompanhamento", label: "Acompanhamento", icon: Factory, inTabBar: true },
  { href: "/cliente/garagem", label: "Garagem", icon: CarFront, inTabBar: true, inHeader: true },
  { href: "/cliente/financiamento", label: "Financiamento", icon: Wallet, inTabBar: true, inHeader: true },
  { href: "/cliente/servicos", label: "Serviços", icon: Wrench, inTabBar: true, inHeader: true },
  { href: "/cliente/concessionarias", label: "Concessionárias", icon: MapPin },
  { href: "/cliente/loja", label: "Loja", icon: ShoppingBag, inHeader: true },
  { href: "/cliente/recompensas", label: "Recompensas", icon: Award, inHeader: true },
  { href: "/cliente/noticias", label: "Notícias", icon: Newspaper, inHeader: true },
  { href: "/cliente/perfil", label: "Perfil", icon: User },
];

export const clientTabBarItems = clientNavItems.filter((item) => item.inTabBar);

export const clientHeaderNavItems = clientNavItems.filter((item) => item.inHeader);

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

