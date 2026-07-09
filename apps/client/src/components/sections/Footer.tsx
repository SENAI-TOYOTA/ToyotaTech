import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border pt-10 pb-6.5">
      <div className="max-w-[1180px] mx-auto px-7">
        
        <div className="flex justify-between flex-wrap gap-7 pb-6.5">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-extrabold tracking-tight">
              <span className="text-toyota-red">Toyota</span>
              <span className="text-ink">Tech</span>
            </div>
            <span className="text-[0.78rem] color-ink-soft uppercase tracking-wider">
              Projeto acadêmico · SENAI-SP Sorocaba
            </span>
          </div>

          <div>
            <span className="text-[0.72rem] tracking-widest uppercase text-ink-soft block mb-2.5">Stack</span>
            <div className="flex gap-2 flex-wrap">
              {['MQTT', 'Node-RED', 'InfluxDB', 'Grafana', 'Docker'].map((tech) => (
                <span key={tech} className="text-[0.78rem] bg-charcoal-tint text-charcoal-tint-text px-3 py-1.25 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[0.84rem] text-ink-soft">
            <i className="w-1.5 h-1.5 rounded-full bg-toyota-red animate-pulse-dot" aria-hidden="true" />
            Sistema online
          </div>
        </div>

        <div className="border-t border-border pt-4.5 text-[0.8rem] text-ink-soft">
          © 2026 ToyotaTech. Documento de referência visual; dados de telemetria ilustrativos e não refletem produção real.
        </div>

      </div>
    </footer>
  );
};