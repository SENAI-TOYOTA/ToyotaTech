import React from 'react';

const steps = [
  { label: 'Produção', date: '02 mar', status: 'done' },
  { label: 'Fab chassi', date: '05 mar', status: 'done' },
  { label: 'Pintura', date: '12 mar', status: 'done' },
  { label: 'Montagem', date: 'agora', status: 'current' },
  { label: 'Qualidade', date: '--', status: 'pending' },
  { label: 'Logística', date: '--', status: 'pending' },
  { label: 'Concessionária', date: '--', status: 'pending' },
  { label: 'Entrega', date: '17 jul', status: 'pending' },
];

export const VehicleJourney: React.FC = () => {
  return (
    <div className="mb-10">
      <h3 className="text-xs font-extrabold text-ink-soft uppercase tracking-widest mb-4">
        Jornada do Veículo — Etapa 4 de 8
      </h3>
      <div className="bg-white rounded-2xl border border-border shadow-toyota-sm p-6 overflow-x-auto">
        <div className="min-w-[800px] flex justify-between relative">
          {/* Linha de fundo */}
          <div className="absolute top-4 left-0 w-full h-[2px] bg-border z-0" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                ${step.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 
                  step.status === 'current' ? 'bg-toyota-red border-toyota-red text-white animate-pulse' : 
                  'bg-white border-border text-ink-soft'}`}
              >
                {step.status === 'done' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                ) : (
                  <span className="text-[10px] font-bold">{index + 1}</span>
                )}
              </div>
              <p className={`mt-2 text-[10px] font-bold uppercase ${step.status === 'pending' ? 'text-ink-soft' : 'text-ink'}`}>
                {step.label}
              </p>
              <p className="text-[9px] text-ink-soft font-medium uppercase">{step.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};