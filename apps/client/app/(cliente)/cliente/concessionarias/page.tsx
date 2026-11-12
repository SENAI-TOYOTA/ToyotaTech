import type { Metadata } from "next";

import DealershipsView from "@/components/services/DealershipsView";

export const metadata: Metadata = { title: "Concessionárias" };

export default function Page() {
  return <DealershipsView />;
}
