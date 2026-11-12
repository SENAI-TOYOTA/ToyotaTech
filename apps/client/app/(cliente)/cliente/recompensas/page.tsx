import type { Metadata } from "next";

import RewardsView from "@/components/rewards/RewardsView";

export const metadata: Metadata = { title: "Pontos e recompensas" };

export default function Page() {
  return <RewardsView />;
}
