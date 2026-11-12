import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BackLink({ href, label = "Voltar" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-lg py-1 pr-2 font-medium text-fg-secondary outline-none hover:text-fg focus-visible:ring-3 focus-visible:ring-primary/30"
    >
      <ArrowLeft aria-hidden size={18} />
      {label}
    </Link>
  );
}
