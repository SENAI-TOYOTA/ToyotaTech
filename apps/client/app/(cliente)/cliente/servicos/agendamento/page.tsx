import type { Metadata } from "next";

import BookingView from "@/components/services/BookingView";

export const metadata: Metadata = { title: "Agendar serviço" };

export default function Page() {
  return <BookingView />;
}
