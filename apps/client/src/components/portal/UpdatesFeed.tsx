import React from 'react';

const timeline = [
  { status: 'Montagem Iniciada', desc: 'O veículo entrou na linha de montagem final.', time: 'Hoje às 09:14' },
  { status: 'Pintura Concluída', desc: 'Cor Branco Polar aplicada com sucesso.', time: '12 Mar às 14:30' },
  { status: 'Soldagem Concluída', desc: 'Inspeção de robôs obteve 100% de aprovação.', time: '05 Mar às 10:15' },
];

export const UpdatesFeed: React.FC = () => {
  return (
    <div>
      <h3 className="text-xs font-extrabold text-ink-soft uppercase tracking-widest mb-4">
        Últimas Atualizações do Veículo
      </h3>
      <div className="bg-white rounded-2xl border border-border shadow-toyota-sm p-5 flex flex-col gap-5">
        {timeline.map((item, idx) => (
          <div key={idx} className="flex gap-4 relative last:after:hidden after:absolute after:left-[11px] after:top-7 after:bottom-[-20px] after:w-[2px] after:bg-border">
            {/* Indicador de Status Visual */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${idx === 0 ? 'bg-toyota-red-tint text-toyota-red' : 'bg-gray-100 text-ink-soft'}`}>
              <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-toyota-red animate-pulse' : 'bg-ink-soft'}`} />
            </div>
            
            {/* Conteúdo */}
            <div className="flex-1 pb-1">
              <div className="flex justify-between items-baseline flex-wrap gap-2">
                <h4 className="text-sm font-bold text-ink">{item.status}</h4>
                <span className="text-[10px] font-bold text-ink-soft uppercase">{item.time}</span>
              </div>
              <p className="text-xs text-ink-soft mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};