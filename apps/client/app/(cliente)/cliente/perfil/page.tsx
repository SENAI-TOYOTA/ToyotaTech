import type { Metadata } from "next";

import ProfileView from "@/components/profile/ProfileView";
import { requireSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const user = await requireSession();

  return <ProfileView initialEmail={user.email} initialName={user.name} />;
}
