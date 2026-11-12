import type { Metadata } from "next";

import ServicesView from "@/components/services/ServicesView";

export const metadata: Metadata = { title: "Serviços" };

export default function Page() {
  return <ServicesView />;
}
