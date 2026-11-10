import type { Metadata } from "next";

import AdminHeader from "@/components/layout/AdminHeader";
import { AdminSidebar, AdminTabBar } from "@/components/layout/AdminNav";
import { requireAdminSession } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: {
    default: "Dashboard de Gestão · Indústria 4.0",
    template: "%s · Toyota Tech Gestão",
  },
  robots: { index: false, follow: false },
};

/**
 * Layout exclusivo para o grupo `(admin)` (Portal do Gestor).
 * Verifica se há usuário autenticado e valida o perfil/role de gestor antes de renderizar.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await requireAdminSession();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface-muted">
      <AdminHeader user={adminUser} />

      <div className="mx-auto flex w-full max-w-content flex-1 gap-8 px-gutter pt-6 pb-24 wide:pt-8 wide:pb-12">
        <AdminSidebar />
        <main id="conteudo-admin" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <AdminTabBar />
    </div>
  );
}

