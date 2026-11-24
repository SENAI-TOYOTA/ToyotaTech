"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/lib/auth/actions";
import { clearGarageData, logout, useAppDispatch } from "@/store";
import { api } from "@/store/api";

export default function SignOutButton({ className }: { className: string }) {
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    dispatch(logout());
    dispatch(clearGarageData());
    dispatch(api.util.resetApiState());
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleSignOut}
      aria-label="Sair da conta"
      title="Sair"
      className={className}
    >
      <LogOut aria-hidden size={18} strokeWidth={1.8} />
    </button>
  );
}
