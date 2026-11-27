import type { Href } from "expo-router";

import type { AuthUser } from "@/types/auth";
import type { GarageData, GarageDocument, GarageVehicle } from "@/types/garage";
import type { TrackingInfo } from "@/types/tracking";

export type ChatAuthor = "user" | "bot";

export interface ChatAction {
  label: string;
  href: Href;
}

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  time: string;
  action?: ChatAction;
}

export interface ChatSuggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface ChatContext {
  firstName: string;
  garage: GarageData | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatReply {
  text: string;
  action?: ChatAction;
}

export interface ChatWelcome {
  title: string;
  subtitle: string;
  suggestions: ChatSuggestion[];
}

interface BuildChatContextInput {
  user: AuthUser | null;
  garage: GarageData | null;
  isLoading: boolean;
  error: string | null;
}

type ChatIntentId =
  | "status"
  | "financing"
  | "documents"
  | "recall"
  | "revision"
  | "order"
  | "vehicle"
  | "help"
  | "thanks"
  | "goodbye"
  | "howAreYou"
  | "greeting";

interface ChatIntent {
  id: ChatIntentId;
  keywords: string[];
}

interface DocumentRoute {
  id: string;
  keywords: string[];
  href: Href;
  label: string;
}

const chatIntents: ChatIntent[] = [
  {
    id: "status",
    keywords: ["status", "montagem", "fabrica", "produc", "entreg"],
  },
  {
    id: "financing",
    keywords: [
      "financ",
      "boleto",
      "parcela",
      "pagamento",
      "contrato",
      "vencimento",
    ],
  },
  {
    id: "documents",
    keywords: ["document", "nota", "fiscal", "crlv", "manual", "garantia"],
  },
  { id: "recall", keywords: ["recall", "campanha"] },
  {
    id: "revision",
    keywords: ["revisao", "revisoes", "manutenc", "servico", "plano"],
  },
  { id: "order", keywords: ["pedido", "compra", "concessionaria"] },
  { id: "vehicle", keywords: ["chassi", "garagem", "veicul", "carro"] },
  {
    id: "help",
    keywords: ["ajuda", "ajudar", "comando", "o que voce faz", "o que sabe"],
  },
  {
    id: "thanks",
    keywords: ["obrigad", "valeu", "vlw", "brigad", "agradec"],
  },
  {
    id: "goodbye",
    keywords: ["tchau", "ate mais", "ate logo", "falou", "adeus"],
  },
  {
    id: "howAreYou",
    keywords: [
      "tudo bem",
      "tudo bom",
      "td bem",
      "como vai",
      "beleza",
      "suave",
      "tranquilo",
    ],
  },
  {
    id: "greeting",
    keywords: [
      "oi",
      "ola",
      "opa",
      "eae",
      "e ai",
      "fala",
      "salve",
      "bom dia",
      "boa tarde",
      "boa noite",
      "hey",
      "hello",
      "techy",
    ],
  },
];

const documentRoutes: DocumentRoute[] = [
  {
    id: "invoice",
    keywords: ["nota", "fiscal"],
    href: "/nota-fiscal",
    label: "Ver nota fiscal",
  },
  { id: "crlv", keywords: ["crlv"], href: "/crlv", label: "Ver CRLV-e" },
  {
    id: "manual",
    keywords: ["manual"],
    href: "/manual-do-veiculo",
    label: "Ver manual",
  },
  {
    id: "warranty",
    keywords: ["garantia"],
    href: "/garantia-toyota",
    label: "Ver garantia",
  },
  {
    id: "maintenance-plan",
    keywords: ["revis", "manutenc"],
    href: "/plano-de-revisoes",
    label: "Ver plano de revisões",
  },
];

const baseSuggestions: ChatSuggestion[] = [
  {
    id: "status",
    label: "Status da montagem",
    prompt: "Como está a montagem do meu carro?",
  },
  {
    id: "documents",
    label: "Nota fiscal e CRLV",
    prompt: "Quais documentos eu tenho?",
  },
  {
    id: "financing",
    label: "Financiamento",
    prompt: "Quando vence a próxima parcela?",
  },
];

const fallbackReply =
  "Ainda não tenho esse dado no app. Posso ajudar com status da montagem, financiamento, documentos, revisões e recall.";

const greetingTemplates = [
  "Oi{name}! Tudo bem? Como posso ajudar?",
  "E aí{name}! Tudo certo? Posso ajudar com status, financiamento, documentos, revisões ou recall.",
  "Olá{name}! Em que posso ajudar hoje?",
  "Fala{name}! Como posso ajudar com o seu Toyota?",
  "Opa{name}! Tudo em ordem por aqui. O que você quer saber?",
];

const howAreYouTemplates = [
  "Tudo ótimo por aqui{name}! E com você? Como posso ajudar?",
  "Tudo em ordem{name}. E do seu lado?",
  "Por aqui está tudo bem{name}! Como posso ajudar?",
];

const thanksTemplates = [
  "De nada{name}! Qualquer coisa, é só chamar.",
  "Por nada{name}! Estou por aqui.",
  "Valeu{name}! Precisa de mais alguma coisa?",
];

const goodbyeTemplates = [
  "Até mais{name}! Conte com o Techy.",
  "Tchau{name}! Quando precisar, estou aqui.",
  "Falou{name}! Bom passeio com o seu Toyota.",
];

const helpReply =
  "Posso ajudar com status da montagem, financiamento e boleto, documentos, plano de revisões, recall, pedido e dados do veículo. Por onde começamos?";

function fillTemplate(template: string, context: ChatContext) {
  const name = context.firstName ? `, ${context.firstName}` : "";

  return template.replace("{name}", name);
}

function pickTemplate(templates: string[], variation: number) {
  return templates[Math.abs(variation) % templates.length];
}

export const chatReplyDelay = 900;

function normalizeChatText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesKeywords(
  normalized: string,
  words: string[],
  keywords: string[]
) {
  return keywords.some((keyword) => {
    if (keyword.includes(" ")) {
      return normalized.includes(keyword);
    }

    if (keyword.length <= 3) {
      return words.includes(keyword);
    }

    return words.some((word) => word.startsWith(keyword));
  });
}

function vehicleLabel(vehicle: GarageVehicle) {
  return `${vehicle.model} ${vehicle.version}`;
}

function currentTrackingStep(tracking: TrackingInfo | undefined) {
  if (!tracking || tracking.steps.length === 0) {
    return null;
  }

  const index = Math.min(
    Math.max(tracking.currentStepIndex, 0),
    tracking.steps.length - 1
  );

  return {
    step: tracking.steps[index],
    index,
    total: tracking.steps.length,
  };
}

function previousCompletedStep(tracking: TrackingInfo, currentIndex: number) {
  return (
    tracking.steps
      .slice(0, currentIndex)
      .reverse()
      .find((step) => step.status === "completed" && step.date) ?? null
  );
}

export function buildChatContext({
  user,
  garage,
  isLoading,
  error,
}: BuildChatContextInput): ChatContext {
  const fullName = user?.profile?.fullName || user?.name || "";
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  return { firstName, garage, isLoading, error };
}

function buildSuggestions(garage: GarageData): ChatSuggestion[] {
  const suggestions: ChatSuggestion[] = [];

  if (currentTrackingStep(garage.tracking)) {
    suggestions.push({
      id: "status",
      label: "Meu status",
      prompt: "Como está a montagem do meu carro?",
    });
  }

  if (garage.financing) {
    suggestions.push({
      id: "financing",
      label: garage.financing.boletoAvailable
        ? "Meu boleto"
        : "Meu financiamento",
      prompt: "Quando vence a próxima parcela?",
    });
  }

  if (garage.documents.length > 0) {
    suggestions.push({
      id: "documents",
      label: "Meus documentos",
      prompt: "Quais documentos eu tenho?",
    });
  }

  if (garage.recalls.length > 0) {
    suggestions.push({
      id: "recall",
      label: "Recall",
      prompt: "Tenho algum recall?",
    });
  }

  baseSuggestions.forEach((suggestion) => {
    if (!suggestions.some((item) => item.id === suggestion.id)) {
      suggestions.push(suggestion);
    }
  });

  return suggestions.slice(0, 3);
}

export function buildChatWelcome(context: ChatContext): ChatWelcome {
  const name = context.firstName ? `, ${context.firstName}` : "";
  const title = `Oi${name}! Tudo bem?`;
  const garage = context.garage;
  const subtitle = context.isLoading
    ? "Sou o Techy, seu assistente Toyota. Estou carregando os dados do seu veículo."
    : context.error
      ? "Sou o Techy, seu assistente Toyota. Não consegui carregar os dados do veículo agora."
      : garage
        ? "Sou o Techy, seu assistente Toyota. Como posso ajudar?"
        : "Sou o Techy, seu assistente Toyota. Ainda não encontrei um veículo vinculado à sua conta.";

  return {
    title,
    subtitle,
    suggestions: garage ? buildSuggestions(garage) : baseSuggestions,
  };
}

function missingGarageReply(context: ChatContext): ChatReply {
  if (context.isLoading) {
    return {
      text: "Ainda estou carregando os dados do seu veículo. Tenta de novo em instantes.",
    };
  }

  if (context.error) {
    return {
      text: "Não consegui carregar os dados do seu veículo agora. Tenta recarregar a Home em instantes.",
    };
  }

  return {
    text: "Ainda não encontrei um veículo vinculado à sua conta. A vinculação usa o CPF do perfil, então vale conferir se ele está completo.",
  };
}

function statusReply(garage: GarageData): ChatReply {
  const current = currentTrackingStep(garage.tracking);

  if (!current) {
    return {
      text: "Ainda não tenho o status da montagem do seu Toyota no app.",
      action: { label: "Ver status", href: "/tracking" },
    };
  }

  const previous = previousCompletedStep(garage.tracking, current.index);
  const previousText = previous?.date
    ? ` A etapa ${previous.label} foi concluída em ${previous.date}.`
    : "";

  return {
    text: `Seu ${vehicleLabel(garage.vehicle)} está em ${current.step.label} (etapa ${current.index + 1} de ${current.total}).${previousText}`,
    action: { label: "Ver status", href: "/tracking" },
  };
}

function financingReply(garage: GarageData): ChatReply {
  const financing = garage.financing;

  if (!financing) {
    return {
      text: "Não encontrei informações de financiamento para o seu Toyota no app.",
      action: { label: "Ver financiamento", href: "/financing" },
    };
  }

  const availability = financing.boletoAvailable
    ? ""
    : " A segunda via ainda não está disponível.";
  const action: ChatAction = financing.boletoAvailable
    ? { label: "Abrir boleto", href: "/boleto" }
    : { label: "Ver financiamento", href: "/financing" };

  return {
    text: `Sua próxima parcela é de ${financing.installmentAmount}, com vencimento em ${financing.nextDueDate} pelo ${financing.bank}. Você já pagou ${financing.paidInstallments} de ${financing.totalInstallments}.${availability}`,
    action,
  };
}

function documentReply(document: GarageDocument, route: DocumentRoute) {
  const text =
    document.status === "available"
      ? `${document.title} está disponível desde ${document.date}.`
      : `${document.title} está em processamento desde ${document.date}. O app avisa quando for liberado.`;

  return { text, action: { label: route.label, href: route.href } };
}

function documentsReply(
  garage: GarageData,
  normalized: string,
  words: string[]
): ChatReply {
  const route = documentRoutes.find((item) =>
    matchesKeywords(normalized, words, item.keywords)
  );

  if (route) {
    const document = garage.documents.find((item) => item.id === route.id);

    if (document) {
      return documentReply(document, route);
    }
  }

  const available = garage.documents.filter(
    (document) => document.status === "available"
  );
  const pending = garage.documents.filter(
    (document) => document.status === "pending"
  );
  const parts: string[] = [];

  if (available.length > 0) {
    parts.push(
      `Disponíveis: ${available.map((document) => document.title).join(", ")}.`
    );
  }

  if (pending.length > 0) {
    parts.push(
      `Em processamento: ${pending.map((document) => document.title).join(", ")}.`
    );
  }

  return {
    text:
      parts.length > 0 ? parts.join(" ") : "Não encontrei documentos no app.",
    action: { label: "Ver documentos", href: "/vehicle-management" },
  };
}

function recallReply(garage: GarageData): ChatReply {
  if (garage.recalls.length === 0) {
    return {
      text: `Não há campanhas de recall ativas para o seu ${garage.vehicle.model}.`,
    };
  }

  const [first] = garage.recalls;
  const plural = garage.recalls.length > 1;

  return {
    text: `Há ${garage.recalls.length} campanha${plural ? "s" : ""} de recall ativa${plural ? "s" : ""} para o seu ${garage.vehicle.model}. A principal é ${first.title}.`,
    action: {
      label: "Ver recall",
      href: { pathname: "/recall/[id]", params: { id: first.id } },
    },
  };
}

function revisionReply(garage: GarageData): ChatReply {
  const plan = garage.documents.find(
    (document) => document.id === "maintenance-plan"
  );
  const text =
    plan?.status === "available"
      ? "O plano de revisões já está disponível como documento, mas ainda não tenho a quilometragem da próxima revisão no app."
      : "O plano de revisões ainda não está disponível no app.";

  return {
    text,
    action: { label: "Ver plano de revisões", href: "/plano-de-revisoes" },
  };
}

function orderReply(garage: GarageData): ChatReply {
  const order = garage.order;

  if (!order) {
    return {
      text: "Não encontrei um pedido vinculado à sua conta.",
      action: { label: "Ver veículo", href: "/vehicle-management" },
    };
  }

  return {
    text: `Seu pedido ${order.orderId} foi registrado em ${order.purchaseDate} na ${order.dealership}.`,
    action: { label: "Ver veículo", href: "/vehicle-management" },
  };
}

function vehicleReply(garage: GarageData): ChatReply {
  const vehicle = garage.vehicle;
  const chassi = vehicle.chassi ? `, chassi ${vehicle.chassi}` : "";
  const order = garage.order
    ? ` Pedido ${garage.order.orderId}, de ${garage.order.purchaseDate}, na ${garage.order.dealership}.`
    : "";

  return {
    text: `Seu ${vehicle.model} ${vehicle.version}, ${vehicle.color}, ano ${vehicle.year}${chassi}, está vinculado à sua conta.${order}`,
    action: { label: "Ver veículo", href: "/vehicle-management" },
  };
}

function greetingReply(context: ChatContext, variation: number): ChatReply {
  return {
    text: fillTemplate(pickTemplate(greetingTemplates, variation), context),
  };
}

function howAreYouReply(context: ChatContext, variation: number): ChatReply {
  return {
    text: fillTemplate(pickTemplate(howAreYouTemplates, variation), context),
  };
}

function thanksReply(context: ChatContext, variation: number): ChatReply {
  return {
    text: fillTemplate(pickTemplate(thanksTemplates, variation), context),
  };
}

function goodbyeReply(context: ChatContext, variation: number): ChatReply {
  return {
    text: fillTemplate(pickTemplate(goodbyeTemplates, variation), context),
  };
}

export function resolveChatReply(
  prompt: string,
  context: ChatContext,
  variation = 0
): ChatReply {
  const normalized = normalizeChatText(prompt);
  const words = normalized.split(/[^a-z0-9]+/);
  const intent = chatIntents.find((item) =>
    matchesKeywords(normalized, words, item.keywords)
  );

  if (!intent) {
    return { text: fallbackReply };
  }

  const garage = context.garage;

  if (!garage) {
    switch (intent.id) {
      case "help":
        return { text: helpReply };
      case "thanks":
        return thanksReply(context, variation);
      case "goodbye":
        return goodbyeReply(context, variation);
      case "howAreYou":
        return howAreYouReply(context, variation);
      case "greeting":
        return greetingReply(context, variation);
      default:
        return missingGarageReply(context);
    }
  }

  switch (intent.id) {
    case "status":
      return statusReply(garage);
    case "financing":
      return financingReply(garage);
    case "documents":
      return documentsReply(garage, normalized, words);
    case "recall":
      return recallReply(garage);
    case "revision":
      return revisionReply(garage);
    case "order":
      return orderReply(garage);
    case "vehicle":
      return vehicleReply(garage);
    case "help":
      return { text: helpReply };
    case "thanks":
      return thanksReply(context, variation);
    case "goodbye":
      return goodbyeReply(context, variation);
    case "howAreYou":
      return howAreYouReply(context, variation);
    default:
      return greetingReply(context, variation);
  }
}

export function formatChatTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}
