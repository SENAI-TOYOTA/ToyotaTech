import React from 'react';

export const Features: React.FC = () => {
  return (
    <section className="pt-2.5 pb-17">
      <div className="max-w-[1180px] mx-auto px-7">
        
        {/* Cabeçalho da Seção */}
        <div className="max-w-[620px] mb-10">
          <span className="inline-flex items-center gap-1.5 bg-toyota-red-tint text-toyota-red-tint-text text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full">
            Pilares do sistema
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-3.5">
            Três camadas, um único fluxo de dados
          </h2>
          <p className="text-ink-soft mt-3 text-[1rem]">
            Tudo que aparece no painel do cliente e no portal de gestão nasce do mesmo conjunto de sensores na linha de produção.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1 */}
          <div className="bg-white border border-border rounded-[18px] shadow-toyota-sm p-6.5 pt-6 pb-7">
            <div className="w-12 h-12 rounded-[14px] bg-toyota-red text-white flex items-center justify-center mb-4.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="19" r="2"/>
                <path d="M7 19h4a3 3 0 0 0 3-3v-1a3 3 0 0 1 3-3h2" strokeDasharray="3 3"/>
                <path d="M17 9l3 3-3 3"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-bold mb-2.5">Rastreamento ponta-a-ponta</h3>
            <p className="text-ink-soft text-[0.95rem] m-0">
              Cada chassi recebe um identificador único. Você acompanha sua passagem por cada estação da linha, da soldagem à montagem final.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-border rounded-[18px] shadow-toyota-sm p-6.5 pt-6 pb-7">
            <div className="w-12 h-12 rounded-[14px] bg-toyota-red text-white flex items-center justify-center mb-4.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>
                <path d="M8.5 8.5a5 5 0 0 1 7 0"/>
                <path d="M5.5 5.5a9 9 0 0 1 13 0"/>
                <path d="M12 14v6"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-bold mb-2.5">Transparência IIoT</h3>
            <p className="text-ink-soft text-[0.95rem] m-0">
              Os mesmos sensores que monitoram a fábrica publicam os dados via MQTT. A informação chega direto da origem, sem intermediários.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-border rounded-[18px] shadow-toyota-sm p-6.5 pt-6 pb-7">
            <div className="w-12 h-12 rounded-[14px] bg-toyota-red text-white flex items-center justify-center mb-4.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="8" height="8" rx="1"/>
                <rect x="13" y="3" width="8" height="5" rx="1"/>
                <rect x="13" y="10" width="8" height="11" rx="1"/>
                <rect x="3" y="13" width="8" height="8" rx="1"/>
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-bold mb-2.5">Portal unificado</h3>
            <p className="text-ink-soft text-[0.95rem] m-0">
              Financiamento, itens opcionais e indicadores de throughput convivem em um só painel, adaptado ao perfil de quem está logado.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};