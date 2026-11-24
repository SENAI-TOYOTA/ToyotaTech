import type { Metadata } from "next";

import ClienteHomeContent from "@/components/home/ClienteHomeContent";
import { requireSession } from "@/lib/auth/dal";
import { getDisplayName } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Início" };

export default async function ClienteHomePage() {
  const user = await requireSession();

  return <ClienteHomeContent userName={getDisplayName(user)} />;
}
