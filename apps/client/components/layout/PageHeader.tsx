import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-bold tracking-[2px] text-primary uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold text-fg tablet:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[17px] leading-6 text-fg-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

