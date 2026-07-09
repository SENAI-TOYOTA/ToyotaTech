import React from 'react';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  return (
    <section className="py-15 md:py-14">
      <div className="max-w-[1180px] mx-auto px-7 grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-14 items-center">
        
        {/* Lado Esquerdo - Conteúdo */}
        <div>
          <span className="inline-flex items-center gap-1.5 bg-toyota-red-tint text-toyota-red-tint-text text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full">
            Indústria 4.0 · IIoT
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12] my-4.5">
            Da fábrica até a sua garagem <span className="text-toyota-red">— em tempo real.</span>
          </h1>
          
          <p className="text-[1.05rem] text-ink-soft max-w-[480px] mb-7">
            Sensores instalados na linha de montagem publicam dados em tempo real via MQTT. 
            O mesmo fluxo abastece o seu painel de cliente e o centro de controle da fábrica — sem caixa-preta, sem relatório atrasado.
          </p>
          
          <div className="flex gap-3.5 flex-wrap">
            <a href="#acessos">
              <Button variant="solid">Área do Cliente</Button>
            </a>
            <a href="#acessos">
              <Button variant="charcoal">Portal de Gestão</Button>
            </a>
          </div>
        </div>

        {/* Lado Direito - Preview */}
        <div className="relative pb-6.5 max-w-[420px] md:max-w-none mx-auto w-full">
          
          {/* Card de Trás */}
          <div className="absolute right-[-10px] bottom-0 w-[64%] z-10 rotate-3 bg-white border border-border rounded-[18px] shadow-toyota-sm p-4 md:p-4.5">
            <span className="text-[0.7rem] font-bold text-ink-soft tracking-wider uppercase">Financiamento</span>
            <div className="flex items-center justify-between my-2.5">
              <span className="font-bold text-[0.94rem]">Corolla Altis 2026</span>
              <span className="bg-toyota-red text-white text-[0.72rem] font-bold px-2 py-1 rounded-[8px]">30/60</span>
            </div>
            <div className="h-1.5 rounded-[3px] bg-border overflow-hidden mb-2.5">
              <span className="block h-full bg-toyota-red" style={{ width: '50%' }}></span>
            </div>
            <span className="text-[0.78rem] text-ink-soft">Banco Toyota do Brasil</span>
          </div>

          {/* Card da Frente */}
          <div className="relative z-20 max-w-[86%] bg-white border border-border rounded-[18px] shadow-toyota-sm p-5.5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-[42px] h-[42px] rounded-[12px] bg-toyota-red-tint flex items-center justify-center text-toyota-red">
                <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12.5l1.2-3.8A2 2 0 0 1 6.1 7.3h7.6a2 2 0 0 1 1.8 1.1l1.7 3.4"/>
                  <path d="M2.5 12.5h19v2.7a1 1 0 0 1-1 1h-1.1"/>
                  <path d="M4.6 16.2H3.5a1 1 0 0 1-1-1v-1.7"/>
                  <circle cx="7" cy="16.2" r="1.6"/>
                  <circle cx="17" cy="16.2" r="1.6"/>
                </svg>
              </div>
              <span className="text-[0.76rem] font-semibold text-toyota-red-tint-text bg-toyota-red-tint px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <i className="w-1.5 h-1.5 rounded-full bg-toyota-red animate-pulse-dot" />
                Em produção
              </span>
            </div>
            
            <h4 className="text-[1.1rem] font-bold mb-0.5">Seu Corolla Altis</h4>
            <span className="text-[0.84rem] text-ink-soft block mb-4">Acompanhamento da linha de montagem</span>
            
            {/* linha de produção */}
            <div className="flex gap-1.5 mb-2">
              <div className="flex-1 h-1.25 rounded-[3px] bg-toyota-red"></div>
              <div className="flex-1 h-1.25 rounded-[3px] bg-toyota-red"></div>
              <div className="flex-1 h-1.25 rounded-[3px] bg-toyota-red"></div>
              <div className="flex-1 h-1.25 rounded-[3px] bg-border"></div>
            </div>
            <div className="flex justify-between mb-4.5">
              <span className="text-[0.66rem] text-ink-soft">Chassi</span>
              <span className="text-[0.66rem] text-ink-soft">Soldagem</span>
              <span className="text-[0.66rem] text-ink-soft">Pintura</span>
              <span className="text-[0.66rem] text-ink-soft">Montagem</span>
            </div>

            <Button variant="sm">Verificar status</Button>
          </div>

        </div>
      </div>
    </section>
  );
};