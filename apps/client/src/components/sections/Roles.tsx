import React from 'react';
import { Button } from '../ui/Button';

export const Roles: React.FC = () => {
  return (
    <section className="pt-2.5 pb-22.5" id="acessos">
      <div className="max-w-[1180px] mx-auto px-7">
        
        {/* Cabeçalho da Seção */}
        <div className="max-w-[680px] mb-10">
          <span className="inline-flex items-center gap-1.5 bg-toyota-red-tint text-toyota-red-tint-text text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full">
            Fluxo de acesso
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-3.5">
            Dois caminhos, um login.
          </h2>
          <p className="text-ink-soft mt-3 text-[1rem]">
            Cada perfil entra pelo seu próprio caminho: cliente de um lado, gestão do outro — sem mistura de informações entre as duas áreas.
          </p>
        </div>

        {/* Grid de Perfis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
          
          {/* Painel do Cliente */}
          <div className="bg-white border border-border rounded-[18px] shadow-toyota-sm p-7.5 md:p-7">
            <span className="inline-block text-[0.78rem] font-semibold bg-toyota-red-tint text-toyota-red-tint-text px-3.5 py-1.5 rounded-full mb-4.5">
              Perfil: cliente
            </span>
            <div className="w-11 h-11 rounded-full bg-toyota-red text-white flex items-center justify-center mb-4">
              <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="15" r="4"/><path d="M11 12l8-8"/><path d="M16 7l2 2"/><path d="M13 10l2 2"/>
              </svg>
            </div>
            <h3 className="text-[1.35rem] font-bold mb-2.5">Área do Cliente</h3>
            <p className="text-[0.96rem] text-ink-soft mb-6.5 max-w-[380px]">
              Acompanhe o seu veículo do pátio da fábrica até a concessionária.
            </p>
            
            <ul className="mb-6.5">
              <li className="text-[0.93rem] py-2.5 flex gap-2.5 items-start border-t border-border">
                <svg className="w-[17px] h-[17px] shrink-0 text-toyota-red mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                Rastreamento da esteira de produção
              </li>
              <li className="text-[0.93rem] py-2.5 flex gap-2.5 items-start border-t border-border">
                <svg className="w-[17px] h-[17px] shrink-0 text-toyota-red mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                Contratos e simulações de financiamento
              </li>
              <li className="text-[0.93rem] py-2.5 flex gap-2.5 items-start border-t border-border">
                <svg className="w-[17px] h-[17px] shrink-0 text-toyota-red mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                Itens opcionais e status de entrega
              </li>
            </ul>
            <Button variant="solid">Entrar como cliente</Button>
          </div>

          {/* Painel de Gestão */}
          <div className="bg-white border border-border rounded-[18px] shadow-toyota-sm p-7.5 md:p-7">
            <span className="inline-block text-[0.78rem] font-semibold bg-charcoal-tint text-charcoal-tint-text px-3.5 py-1.5 rounded-full mb-4.5">
              Perfil: admin · supervisor · operador
            </span>
            <div className="w-11 h-11 rounded-full bg-charcoal text-white flex items-center justify-center mb-4">
              <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <h3 className="text-[1.35rem] font-bold mb-2.5">Portal de Gestão</h3>
            <p className="text-[0.96rem] text-ink-soft mb-6.5 max-w-[380px]">
              Opere a planta com indicadores que chegam em tempo real.
            </p>
            
            <ul className="mb-6.5">
              <li className="text-[0.93rem] py-2.5 flex gap-2.5 items-start border-t border-border">
                <svg className="w-[17px] h-[17px] shrink-0 text-charcoal mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                Throughput de produção por linha
              </li>
              <li className="text-[0.93rem] py-2.5 flex gap-2.5 items-start border-t border-border">
                <svg className="w-[17px] h-[17px] shrink-0 text-charcoal mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                Histórico de falhas e paradas
              </li>
              <li className="text-[0.93rem] py-2.5 flex gap-2.5 items-start border-t border-border">
                <svg className="w-[17px] h-[17px] shrink-0 text-charcoal mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                Painéis analíticos da fábrica
              </li>
            </ul>
            <Button variant="charcoal">Acessar painel de gestão</Button>
          </div>

        </div>
      </div>
    </section>
  );
};