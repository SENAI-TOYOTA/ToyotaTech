import type { Metadata } from "next";

import ClientFooter from "@/components/layout/ClientFooter";
import ClientHeader from "@/components/layout/ClientHeader";
import { ClientSidebar, ClientTabBar } from "@/components/layout/ClientNav";
import { ChatbotWidget } from "@/components/ui";
import { requireSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Toyota Tech" },
  robots: { index: false, follow: false },
};

/**
 * Layout protegido do Portal do Cliente.
 * Inclui o `ChatbotWidget` flutuante em todas as páginas protegidas do consumidor.
 */
export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface-muted">
      <ClientHeader user={user} />

      <div className="mx-auto flex w-full max-w-content flex-1 gap-8 px-gutter pt-6 pb-10 wide:pt-8 wide:pb-12">
        <ClientSidebar />
        <main id="conteudo" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <ClientFooter />
      <ChatbotWidget />
      <ClientTabBar />
    </div>
  );
}
