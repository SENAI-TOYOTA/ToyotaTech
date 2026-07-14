import React from 'react';

export const PortalHeader: React.FC = () => {
  return (
    <header className="bg-ink border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-[1180px] mx-auto px-4 md:px-7 h-16 flex items-center justify-between">
        
        {/* Logo carregando o seu arquivo .ico da pasta public */}
        <a href="#" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img 
            src="/favicon.ico" // Ajuste para /logo.ico se o nome do arquivo for esse
            alt="ToyotaTech Logo" 
            className="w-7 h-7 object-contain"
          />
          <div className="text-xl font-extrabold tracking-tight text-white">
            <span className="text-toyota-red">Toyota</span>
            <span>Tech</span>
          </div>
        </a>
        
        {/* Menu Hambúrguer */}
        <button className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Abrir menu">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};