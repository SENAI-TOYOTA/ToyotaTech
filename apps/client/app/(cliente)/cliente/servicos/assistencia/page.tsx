import type { Metadata } from "next";

import RoadsideView from "@/components/services/RoadsideView";

export const metadata: Metadata = { title: "Assistência 24h" };

export default function Page() {
  return <RoadsideView />;
}
