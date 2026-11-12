import { Headphones, LifeBuoy } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { CUSTOMER_SERVICE_PHONE, ROADSIDE_PHONE } from "@/lib/mocks/aftersales";

const columns = [
  {
    title: "Pós-venda",
    links: [
      { href: "/cliente/acompanhamento", label: "Acompanhamento" },
      { href: "/cliente/servicos/agendamento", label: "Agendar serviço" },
      { href: "/cliente/servicos/revisoes", label: "Plano de revisões" },
      { href: "/cliente/servicos/garantia", label: "Garantia" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/cliente/loja", label: "Loja Toyota" },
      { href: "/cliente/recompensas", label: "Pontos e recompensas" },
      { href: "/cliente/noticias", label: "Notícias e vídeos" },
      { href: "/cliente/concessionarias", label: "Concessionárias" },
    ],
  },
  {
    title: "Minha conta",
    links: [
      { href: "/cliente/garagem", label: "Garagem e documentos" },
      { href: "/cliente/financiamento", label: "Financiamento" },
      { href: "/cliente/perfil", label: "Perfil" },
      { href: "/cliente/servicos/assistencia", label: "Assistência 24h" },
    ],
  },
];

export default function ClientFooter() {
  return (
    <footer className="mb-17 bg-ink text-fg-inverse-muted wide:mb-0">
      <div className="mx-auto w-full max-w-content px-gutter pt-12 pb-8">
        <div className="grid gap-10 wide:grid-cols-[1.1fr_2fr]">
          <div className="flex flex-col gap-3">
            <Logo size="sm" inverse />
            <p className="max-w-sm text-[15px] leading-6">
              Tudo sobre o seu Toyota depois da compra: pedido, serviços, financiamento e muito mais.
            </p>
            <p className="flex items-center gap-2 text-sm text-white">
              <Headphones aria-hidden size={16} className="text-primary" />
              Atendimento: {CUSTOMER_SERVICE_PHONE}
            </p>
            <p className="flex items-center gap-2 text-sm text-white">
              <LifeBuoy aria-hidden size={16} className="text-primary" />
              Assistência 24h: {ROADSIDE_PHONE}
            </p>
          </div>
          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-8 tablet:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-2.5">
                <p className="text-sm font-bold tracking-wider text-white uppercase">{column.title}</p>
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-[15px] hover:text-white hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/50 tablet:flex-row">
          <p>© {new Date().getFullYear()} ToyotaTech. Todos os direitos reservados.</p>
          <p>Projeto acadêmico desenvolvido com o SENAI e a Toyota.</p>
        </div>
      </div>
    </footer>
  );
}
