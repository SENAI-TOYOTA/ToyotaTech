import type { Metadata } from "next";

import NewsView from "@/components/news/NewsView";

export const metadata: Metadata = { title: "Notícias e vídeos" };

export default function Page() {
  return <NewsView />;
}
