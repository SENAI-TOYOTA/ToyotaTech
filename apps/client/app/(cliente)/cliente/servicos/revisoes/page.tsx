import type { Metadata } from "next";

import MaintenanceView from "@/components/services/MaintenanceView";

export const metadata: Metadata = { title: "Plano de revisões" };

export default function Page() {
  return <MaintenanceView />;
}
