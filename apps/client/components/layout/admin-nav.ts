import {
  CarFront,
  LayoutDashboard,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Métricas Indústria 4.0 & Grafana",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/veiculos",
    label: "Gestão de Veículos",
    description: "Chassis ativos na esteira",
    icon: CarFront,
  },
  {
    href: "/admin/consultas",
    label: "Consultas",
    description: "Telemetria MQTT & InfluxDB",
    icon: Search,
  },
];

export function isAdminNavItemActive(
  item: AdminNavItem,
  pathname: string,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

