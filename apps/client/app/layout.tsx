import type { Metadata } from "next";
import { Afacad, Geist_Mono } from "next/font/google";

import StoreProvider from "@/store/provider";

import "./globals.css";

// Fonte oficial do design system (equivalente a Afacad_400..700 do mobile)
const afacad = Afacad({
  variable: "--font-afacad",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Toyota Tech",
    template: "%s · Toyota Tech",
  },
  description:
    "Pós-venda Toyota conectado: acompanhe a produção do seu veículo em tempo real, financiamento e documentos.",
};

/**
 * Root layout: apenas <html>/<body>, fontes e estilos globais.
 * Cabeçalhos e navegação ficam nos layouts dos Route Groups
 * `(public)` e `(cliente)`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${afacad.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
