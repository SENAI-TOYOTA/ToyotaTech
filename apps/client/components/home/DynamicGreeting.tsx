"use client";

import { useSyncExternalStore } from "react";

import PageHeader from "@/components/layout/PageHeader";

const subscribe = () => () => {};

function computeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getServerGreeting(): string {
  return "Painel do cliente";
}

export default function DynamicGreeting({ name }: { name: string }) {
  const greeting = useSyncExternalStore(
    subscribe,
    computeGreeting,
    getServerGreeting,
  );

  return (
    <PageHeader
      eyebrow={greeting}
      title={`Olá de novo, ${name}`}
      description="Tudo sobre o seu Toyota em um só lugar."
    />
  );
}
