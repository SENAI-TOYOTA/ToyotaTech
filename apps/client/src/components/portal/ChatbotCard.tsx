import React from 'react';
import { Button } from '../ui/Button';

export const ChatbotCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-toyota-sm flex flex-col h-[420px] overflow-hidden sticky top-20">
      {/* Header do Chat */}
      <div className="bg-ink text-white p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-toyota-red flex items-center justify-center font-bold text-xs">
          🤖
        </div>
        <div>
          <h4 className="text-sm font-bold">Assistente ToyotaTech</h4>
          <span className="text-[10px] text-white/60 block">Online · Respostas instantâneas</span>
        </div>
      </div>

      {/* Janela de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/60">
        <div className="bg-white text-ink text-xs p-3 rounded-xl rounded-tl-none border border-border max-w-[85%] shadow-sm">
          Olá, Tiago! Sou o assistente virtual da ToyotaTech. Posso te ajudar a entender qualquer etapa da montagem ou financiamento do seu Corolla Cross. Como posso ajudar hoje?
        </div>
        <div className="bg-toyota-red text-white text-xs p-3 rounded-xl rounded-tr-none max-w-[85%] ml-auto shadow-sm text-right">
          Qual é a previsão de entrega atualizada?
        </div>
        <div className="bg-white text-ink text-xs p-3 rounded-xl rounded-tl-none border border-border max-w-[85%] shadow-sm">
          A previsão atualizada de chegada na concessionária é para o dia <strong>17 de Julho de 2026</strong>. O processo está em ritmo normal!
        </div>
      </div>

      {/* Caixa de Entrada */}
      <div className="p-3 border-t border-border bg-white flex gap-2">
        <input 
          type="text" 
          placeholder="Digite sua dúvida..." 
          className="flex-1 bg-gray-50 border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-toyota-red/50 transition-colors"
        />
        <Button variant="charcoal" className="px-3.5 py-2 text-xs">
          Enviar
        </Button>
      </div>
    </div>
  );
};