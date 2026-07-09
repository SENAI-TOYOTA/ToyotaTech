import React from 'react';
import { Button } from '../ui/Button';

export const NavBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/92 backdrop-blur-md border-b border-border">
      <div className="max-w-[1180px] margin-0 mx-auto px-7 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-toyota-red">Toyota</span>
          <span className="text-ink">Tech</span>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline-flex items-center gap-2 text-[0.84rem] text-ink-soft">
            <i className="w-1.5 h-1.5 rounded-full bg-toyota-red shrink-0 animate-pulse-dot" aria-hidden="true" />
            Produção em tempo real
          </span>
          <a href="#acessos">
            <Button variant="ghost">Acessar plataforma</Button>
          </a>
        </div>
      </div>
    </header>
  );
};