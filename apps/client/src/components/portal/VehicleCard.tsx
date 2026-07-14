import React from 'react';
import { Button } from '../ui/Button';

export const VehicleCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-toyota-sm p-6 mb-8 flex flex-col md:flex-row gap-6 items-center">
      {/* Imagem do Carro */}
      <div className="w-full md:w-48 h-32 bg-gray-50 rounded-xl flex items-center justify-center p-2">
        <img 
          src="/img/corolla.webp" // Imagem carro - card
          alt="Toyota Corolla Cross" 
          className="max-h-full object-contain"
        />
      </div>

      {/* Info do Veículo */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[0.7rem] text-ink-soft font-bold uppercase tracking-wider">Pedido #1042</span>
            <h2 className="text-xl font-extrabold text-ink">Toyota Corolla Cross XRX</h2>
            <p className="text-xs text-ink-soft">Chassi: 9BR******3456 · Ano 2026</p>
          </div>
          <div className="text-right">
             <span className="text-[0.65rem] font-bold text-toyota-red bg-toyota-red-tint px-2 py-1 rounded-md">
               ● Em montagem
             </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[0.65rem] font-bold mb-1">
            <span className="text-ink-soft uppercase">Progresso de produção</span>
            <span className="text-toyota-red">65%</span>
          </div>
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-toyota-red" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <Button variant="sm" className="w-full md:w-auto">Ver acompanhamento completo</Button>
          <div className="text-[0.65rem] text-right">
            <p className="text-ink-soft font-bold uppercase">Previsão de entrega</p>
            <p className="text-ink font-extrabold text-sm">17 Jul 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};