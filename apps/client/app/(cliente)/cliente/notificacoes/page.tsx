import type { Metadata } from "next";

import NotificationsView from "@/components/notifications/NotificationsView";

export const metadata: Metadata = { title: "Notificações" };

export default function NotificacoesPage() {
  return <NotificationsView />;
}
