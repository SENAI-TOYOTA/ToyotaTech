"use client";

import {
  Bot,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { cn } from "@/lib/cn";
import { MOCK_GARAGE_DATA } from "@/lib/mocks/garage";
import { API_BASE_URL, resolveAuthToken } from "@/store/api";
import { useGetVeiculoQuery } from "@/store/slices/garageSlice";
import type { VeiculoData } from "@/types/garage";

export interface ChatbotActionLink {
  label: string;
  href: string;
}

export interface ChatbotMessage {
  id: string;
  author: "user" | "bot";
  text: string;
  actions?: ChatbotActionLink[];
}

export interface ChatbotApiResponse {
  reply?: string;
  message?: string;
  answer?: string;
  actions?: ChatbotActionLink[];
}

const SUGGESTED_QUESTIONS = [
  "Há recalls abertos?",
  "Onde baixo o manual?",
  "Cobertura da garantia",
  "Onde está meu carro?",
  "Status do financiamento",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Fallback contextual sobre recalls, manuais, garantias, esteira e financiamento
 * quando a rota REST `/chatbot` está indisponível localmente.
 */
function buildContextualBotReply(
  question: string,
  garage: VeiculoData,
): { text: string; actions?: ChatbotActionLink[] } {
  const q = normalizeText(question);
  const model = garage.vehicle.model;
  const chassi = garage.vehicle.chassi;

  if (q.includes("recall") || q.includes("campanha") || q.includes("reparo")) {
    const count = garage.recalls.length;
    return {
      text:
        count > 0
          ? `Identifiquei ${count} campanha(s) de recall vinculada(s) ao chassi ${chassi} (${model}). Recomendamos agendar o atendimento gratuito em uma concessionária autorizada.`
          : `Consultei a base nacional da Toyota para o chassi ${chassi} (${model}): não há nenhuma campanha de recall pendente. Seu veículo está 100% em dia.`,
      actions: [{ label: "Ver Garagem e Recalls", href: "/cliente/garagem" }],
    };
  }

  if (
    q.includes("manual") ||
    q.includes("documento") ||
    q.includes("crlv") ||
    q.includes("nota")
  ) {
    return {
      text: `Você tem ${garage.documents.length} documentos digitais vinculados ao seu ${model}, incluindo o Manual do Proprietário, Certificado de Garantia, Plano de Revisões e Nota Fiscal.`,
      actions: [{ label: "Abrir Documentos Digitais", href: "/cliente/garagem" }],
    };
  }

  if (q.includes("garantia") || q.includes("cobertura") || q.includes("bateria")) {
    return {
      text: `Seu ${model} possui Garantia de Fábrica de 5 anos (sem limite de quilometragem para uso particular) e cobertura de 8 anos ou 200.000 km para o sistema híbrido (bateria, inversor e módulo de controle).`,
      actions: [{ label: "Consultar Certificado", href: "/cliente/garagem" }],
    };
  }

  if (
    q.includes("onde") ||
    q.includes("carro") ||
    q.includes("producao") ||
    q.includes("esteira") ||
    q.includes("pedido") ||
    q.includes("entrega")
  ) {
    const currentStep =
      garage.tracking.steps.find((s) => s.status === "current")?.label ??
      garage.order.status;
    return {
      text: `Seu ${model} (Pedido #${garage.order.orderId}) está na etapa "${currentStep}" na planta de Sorocaba. Concessionária de destino: ${garage.order.dealership}.`,
      actions: [
        { label: "Ver Esteira de Produção", href: "/cliente/acompanhamento" },
      ],
    };
  }

  if (
    q.includes("financiamento") ||
    q.includes("boleto") ||
    q.includes("parcela") ||
    q.includes("vencimento")
  ) {
    const { paidInstallments, totalInstallments, installmentAmount, nextDueDate, bank } =
      garage.financing;
    const remaining = totalInstallments - paidInstallments;
    return {
      text: `Contrato ativo com o ${bank}: ${paidInstallments} de ${totalInstallments} parcelas pagas (faltam ${remaining}). Próxima parcela de ${installmentAmount} com vencimento em ${nextDueDate}.`,
      actions: [{ label: "Acessar Financiamento", href: "/cliente/financiamento" }],
    };
  }

  return {
    text: `Posso consultar informações oficiais do seu ${model} sobre campanhas de recall, manual do proprietário, cobertura da garantia de 5/8 anos, esteira de produção IIoT ou boletos de financiamento. Sobre qual tema deseja falar?`,
    actions: [
      { label: "Garagem & Manuais", href: "/cliente/garagem" },
      { label: "Acompanhar Produção", href: "/cliente/acompanhamento" },
    ],
  };
}

async function requestChatbotEndpoint(
  message: string,
  garage: VeiculoData,
): Promise<{ text: string; actions?: ChatbotActionLink[] }> {
  const token = resolveAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chatbot`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        chassi: garage.vehicle.chassi,
        model: garage.vehicle.model,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as ChatbotApiResponse;
      const replyText = data.reply ?? data.message ?? data.answer;
      if (replyText) {
        return { text: replyText, actions: data.actions };
      }
    }
  } catch {
    // Backend /chatbot offline localmente — usa motor contextual local
  }

  return buildContextualBotReply(message, garage);
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { data: apiGarage } = useGetVeiculoQuery();
  const garage = apiGarage ?? MOCK_GARAGE_DATA;

  const dialogTitleId = useId();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageSeqRef = useRef(1);

  const [messages, setMessages] = useState<ChatbotMessage[]>(() => [
    {
      id: "welcome",
      author: "bot",
      text: "Olá! Sou o Assistente Toyota Tech. Tire dúvidas sobre recalls, manual do veículo, cobertura de garantia ou o status da produção do seu Toyota.",
    },
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isTyping) return;

    const userSeq = messageSeqRef.current;
    messageSeqRef.current += 1;

    const userMsg: ChatbotMessage = {
      id: `user-${userSeq}`,
      author: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const reply = await requestChatbotEndpoint(text, garage);

    const botSeq = messageSeqRef.current;
    messageSeqRef.current += 1;

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${botSeq}`,
        author: "bot",
        text: reply.text,
        actions: reply.actions,
      },
    ]);
    setIsTyping(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSendMessage(input);
  };

  return (
    <div className="fixed right-5 bottom-20 z-50 wide:right-8 wide:bottom-8">
      {/* Janela Modal do Chatbot */}
      {isOpen ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={dialogTitleId}
          className="mb-3 flex h-[500px] max-h-[calc(100vh-140px)] w-[calc(100vw-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-raised"
        >
          {/* Header */}
          <header className="flex items-center justify-between gap-3 border-b border-border bg-ink px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Bot aria-hidden size={20} strokeWidth={2} />
              </span>
              <div>
                <h2 id={dialogTitleId} className="text-base font-bold leading-5">
                  Assistente Toyota
                </h2>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
                  <span
                    aria-hidden
                    className="size-1.75 rounded-full bg-[#35C46F]"
                  />
                  <span>Online agora · IA Pós-venda (`/chatbot`)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar assistente"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden size={18} strokeWidth={2} />
            </button>
          </header>

          {/* Lista de mensagens */}
          <div
            ref={scrollContainerRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-background p-4"
          >
            {messages.map((message) => {
              const isUser = message.author === "user";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    isUser ? "justify-end" : "justify-start",
                  )}
                >
                  {!isUser ? (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                      <Bot aria-hidden size={14} strokeWidth={2} />
                    </span>
                  ) : null}

                  <div className="flex max-w-[82%] flex-col gap-1.5">
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-[15px] leading-5",
                        isUser
                          ? "rounded-br-xs bg-primary text-white"
                          : "rounded-bl-xs border border-border bg-surface text-fg",
                      )}
                    >
                      {message.text}
                    </div>

                    {message.actions?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {message.actions.map((action) => (
                          <Link
                            key={action.label}
                            href={action.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 rounded-full border border-primary bg-surface px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
                          >
                            <Sparkles aria-hidden size={12} />
                            <span>{action.label}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {isTyping ? (
              <div className="flex items-end gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                  <Bot aria-hidden size={14} strokeWidth={2} />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-xs border border-border bg-surface px-3.5 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:-0.2s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:-0.1s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-fg-muted" />
                </div>
              </div>
            ) : null}
          </div>

          {/* Sugestões rápidas + Input */}
          <div className="border-t border-border bg-surface p-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void handleSendMessage(question)}
                  className="shrink-0 cursor-pointer rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-fg-secondary transition-colors hover:border-border-strong hover:text-fg"
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte sobre recalls, manual, garantia..."
                aria-label="Digite sua pergunta para o Assistente Toyota"
                className="min-h-11 min-w-0 flex-1 rounded-full border border-border-strong bg-surface px-4 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-ink"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Enviar mensagem"
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-border-strong"
              >
                <SendHorizontal aria-hidden size={18} strokeWidth={2} />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {/* Botão Flutuante (FAB) */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Abrir Assistente Toyota"
          className="inline-flex h-14 min-w-14 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-primary px-5 font-semibold text-white shadow-raised transition-all outline-none hover:bg-primary-pressed focus-visible:ring-3 focus-visible:ring-primary/40 active:scale-[0.98]"
        >
          {isOpen ? (
            <X aria-hidden size={22} strokeWidth={2.2} />
          ) : (
            <MessageCircle aria-hidden size={22} strokeWidth={2.2} />
          )}
          <span className="hidden text-base wide:inline">
            {isOpen ? "Fechar assistente" : "Fale com o assistente"}
          </span>
        </button>
      </div>
    </div>
  );
}

