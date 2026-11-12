import type { Metadata } from "next";

import WarrantyView from "@/components/services/WarrantyView";

export const metadata: Metadata = { title: "Garantia" };

export default function Page() {
  return <WarrantyView />;
}
