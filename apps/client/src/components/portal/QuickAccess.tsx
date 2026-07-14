import React from 'react';

const links = [
  { title: 'Contrato de Compra', description: 'Visualizar PDFs assinados'},
  { title: 'Financiamento Banco Toyota', description: 'Parcelas e boletos'},
  { title: 'Manual do Proprietário', description: 'Guia digital completo'},
  { title: 'Agendamento', description: 'Escolha data e horário',},
  { title: 'Concessionárias', description: 'Descubra concessionárias próximas para te atender'},
  { title: 'Perfil', description: 'Configure seu perfil',},
];

export const QuickAccess: React.FC = () => {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-extrabold text-ink-soft uppercase tracking-widest mb-4">
        Acesso Rápido & Serviços
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link, idx) => (
          <button 
            key={idx} 
            className="flex items-center gap-4 bg-white p-4.5 border border-border rounded-xl shadow-toyota-sm text-left hover:border-toyota-red/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg group-hover:bg-toyota-red-tint transition-colors">
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink">{link.title}</h4>
              <p className="text-xs text-ink-soft">{link.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};