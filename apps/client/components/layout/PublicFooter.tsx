import Logo from "@/components/brand/Logo";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-content flex-col items-center justify-between gap-3 px-gutter py-6 text-center tablet:flex-row tablet:text-left">
        <Logo size="sm" />
        <p className="text-[13px] text-fg-muted">
          © {new Date().getFullYear()} ToyotaTech. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

