"use client";

import Link from 'next/link';
import { VehicleCard } from '@/src/components/portal/VehicleCard';
import { VehicleJourney } from '@/src/components/portal/VehicleJourney';

export default function DetalhesPedidoPage() {
  return (
    <div className="space-y-8">
      
      {/* Botão de Voltar e Cabeçalho */}
      <div className="flex flex-col gap-3">
        <Link href="/cliente">
          <button className="flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-ink transition-colors bg-white border border-border px-4 py-2 rounded-xl shadow-toyota-sm w-max">
            ← Início
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Meu pedido</h1>
          <p className="text-ink-soft text-xs font-semibold">Pedido #1042 · Toyota Corolla Cross XRX</p>
        </div>
      </div>

      {/* Componentes Reaproveitados do Dashboard */}
      <VehicleCard />
      <VehicleJourney />

      {/* DETALHES DO PEDIDO — GRID DE CARDS */}
      <div>
        <h3 className="text-xs font-extrabold text-ink-soft uppercase tracking-widest mb-4">
          Detalhes do Pedido
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Veículo */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-toyota-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
              <span className="text-xl">🚗</span>
              <h4 className="text-sm font-extrabold text-ink">Veículo</h4>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Modelo</td><td className="py-2.5 text-right font-bold text-ink">Corolla Cross XRX</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Versão</td><td className="py-2.5 text-right font-bold text-ink">2026 1.8 Hybrid</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Cor</td><td className="py-2.5 text-right font-bold text-ink">Branco Pérola</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Câmbio</td><td className="py-2.5 text-right font-bold text-ink">e-CVT Automático</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Motorização</td><td className="py-2.5 text-right font-bold text-ink">1.8 + motor elétrico</td></tr>
                <tr><td className="py-2.5 text-ink-soft font-medium">Tração</td><td className="py-2.5 text-right font-bold text-ink">4x2 (FWD)</td></tr>
              </tbody>
            </table>
          </div>

          {/* Card: Produção (IIoT Telemetria) */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-toyota-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
              <span className="text-xl">⚙️</span>
              <h4 className="text-sm font-extrabold text-ink">Produção</h4>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Fábrica</td><td className="py-2.5 text-right font-bold text-ink">Sorocaba — SP</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Linha</td><td className="py-2.5 text-right font-bold text-ink">Linha 3 — Híbridos</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Etapa atual</td><td className="py-2.5 text-right font-bold text-toyota-red">Montagem Final</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Estação</td><td className="py-2.5 text-right font-bold text-ink">S4 - Interior</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Atualizado em</td><td className="py-2.5 text-right font-bold text-ink">hoje, 09:47</td></tr>
                <tr>
                  <td className="py-2.5 text-ink-soft font-medium">Sensor IIoT</td>
                  <td className="py-2.5 text-right font-bold text-green-600 flex items-center justify-end gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online — 180 ms
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Card: Financiamento */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-toyota-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
              <span className="text-xl">💳</span>
              <h4 className="text-sm font-extrabold text-ink">Financiamento</h4>
            </div>
            <table className="w-full text-xs mb-4">
              <tbody>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Banco</td><td className="py-2.5 text-right font-bold text-ink">Banco Toyota do Brasil</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Parcelas</td><td className="py-2.5 text-right font-bold text-ink">30 / 60</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Valor parcela</td><td className="py-2.5 text-right font-bold text-ink">R$ 1.840,00</td></tr>
                <tr><td className="py-2.5 text-ink-soft font-medium">Taxa de juros</td><td className="py-2.5 text-right font-bold text-ink">0,89% a.m.</td></tr>
              </tbody>
            </table>
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span className="text-ink-soft">Progresso</span>
                <span className="text-toyota-red">50%</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-1">
                <div className="h-full bg-toyota-red" style={{ width: '50%' }} />
              </div>
              <span className="text-[9px] text-ink-soft font-bold uppercase">30 pagas · 30 restantes</span>
            </div>
          </div>

          {/* Card: Concessionária */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-toyota-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
              <span className="text-xl">🏪</span>
              <h4 className="text-sm font-extrabold text-ink">Concessionária</h4>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Nome</td><td className="py-2.5 text-right font-bold text-ink">Toyota SP Centro</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Cidade</td><td className="py-2.5 text-right font-bold text-ink">São Paulo — SP</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Consultor</td><td className="py-2.5 text-right font-bold text-ink">Rafael Mendes</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2.5 text-ink-soft font-medium">Contato</td><td className="py-2.5 text-right font-bold text-ink">(11) 4002-8922</td></tr>
                <tr><td className="py-2.5 text-ink-soft font-medium">Previsão chegada</td><td className="py-2.5 text-right font-bold text-toyota-red">07 jul 2026</td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* OPCIONAIS CONTRATADOS */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-toyota-sm">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <span className="text-xl">🛡️</span>
          <h4 className="text-sm font-extrabold text-ink">Opcionais contratados</h4>
        </div>
        <div className="space-y-2">
          {[
            { item: 'Toyota Safety Sense 3.0', status: 'Incluído', isDone: true },
            { item: 'Central multimídia 12" JBL', status: 'Incluído', isDone: true },
            { item: 'Cobertura extra garantia 5 anos', status: 'Incluído', isDone: true },
            { item: 'Tapetes originais + protetor de porta', status: 'Pendente', isDone: false },
          ].map((op, idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50/50 border border-border/40 rounded-xl p-3.5">
              <span className="text-xs font-bold text-ink flex items-center gap-2">
                ⚙️ {op.item}
              </span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${op.isDone ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {op.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENTAÇÃO */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-toyota-sm">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <span className="text-xl">📄</span>
          <h4 className="text-sm font-extrabold text-ink">Documentação</h4>
        </div>
        <div className="space-y-2">
          {[
            { doc: 'Nota fiscal de venda', status: 'Incluído', isDone: true },
            { doc: 'Contrato de financiamento', status: 'Incluído', isDone: true },
            { doc: 'Manual do proprietário', status: 'Incluído', isDone: true },
            { doc: 'Termo de garantia', status: 'Pendente', isDone: false },
          ].map((doc, idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50/50 border border-border/40 rounded-xl p-3.5">
              <span className="text-xs font-bold text-ink flex items-center gap-2">
                📄 {doc.doc}
              </span>
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${doc.isDone ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {doc.status}
                </span>
                {doc.isDone && (
                  <button className="text-[10px] font-bold text-toyota-red border border-toyota-red/20 bg-toyota-red/5 px-2.5 py-1 rounded-md hover:bg-toyota-red hover:text-white transition-all flex items-center gap-1">
                    ⬇ Baixar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}