import React from 'react';

export const Stats: React.FC = () => {
  return (
    <section className="pt-1.5 pb-17">
      <div className="max-w-[1180px] mx-auto px-7">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-white border border-border rounded-[18px] shadow-toyota-sm overflow-hidden">
          
          {/* Stat 1 */}
          <div className="p-6.5 border-r border-b md:border-b-0 border-border">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-toyota-red-tint text-toyota-red flex items-center justify-center mb-3.5">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 4 14h6l-1 8 9-12h-6z"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold block">142/h</span>
            <span className="text-[0.84rem] text-ink-soft">Veículos produzidos por hora</span>
          </div>

          {/* Stat 2 */}
          <div className="p-6.5 border-none md:border-r border-b md:border-b-0 border-border">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-toyota-red-tint text-toyota-red flex items-center justify-center mb-3.5">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold block">99,8%</span>
            <span className="text-[0.84rem] text-ink-soft">Disponibilidade da planta</span>
          </div>

          {/* Stat 3 */}
          <div className="p-6.5 border-r border-border">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-toyota-red-tint text-toyota-red flex items-center justify-center mb-3.5">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8"/>
                <path d="M12 8v4l3 2"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold block">180ms</span>
            <span className="text-[0.84rem] text-ink-soft">Latência dos sensores</span>
          </div>

          {/* Stat 4 */}
          <div className="p-6.5">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-toyota-red-tint text-toyota-red flex items-center justify-center mb-3.5">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/>
                <path d="M8.5 8.5a5 5 0 0 1 7 0"/>
                <path d="M5.5 5.5a9 9 0 0 1 13 0"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold block">4</span>
            <span className="text-[0.84rem] text-ink-soft">Estações monitoradas em tempo real</span>
          </div>

        </div>
      </div>
    </section>
  );
};