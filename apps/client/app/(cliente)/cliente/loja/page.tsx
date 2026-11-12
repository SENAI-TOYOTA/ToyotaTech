import type { Metadata } from "next";

import StoreView from "@/components/store/StoreView";

export const metadata: Metadata = { title: "Loja Toyota" };

export default function Page() {
  return <StoreView />;
}
