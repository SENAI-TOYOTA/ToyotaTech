import type { GarageData } from "@/types/garage";
import type { ChatContext } from "@/utils/chat";
import {
  buildChatContext,
  buildChatWelcome,
  formatChatTime,
  resolveChatReply,
} from "@/utils/chat";
import { describe, expect, it } from "@jest/globals";

const boletoBarcode = "00190500954014481606906809350314337370000000100";

const garage: GarageData = {
  userId: "user-1",
  chassi: "CHASSI_12345",
  order: {
    orderId: "TT-12345",
    status: "linked",
    purchaseDate: "03/10/2025",
    dealership: "Concessionária Toyota",
  },
  vehicle: {
    vehicleId: "CHASSI_12345",
    model: "Toyota Corolla Altis",
    version: "Hybrid 2025",
    color: "Branco Pérola",
    year: "2025",
    engine: "1.8 Hybrid",
    chassi: "CHASSI_12345",
  },
  financing: {
    bank: "Banco Toyota do Brasil S.A",
    contractNumber: "FIN-ABC",
    paidInstallments: 12,
    totalInstallments: 48,
    installmentAmount: "R$ 2.850,00",
    nextDueDate: "05/12/2026",
    boletoAvailable: true,
    boletoBarcode,
  },
  documents: [
    {
      id: "invoice",
      title: "Nota fiscal",
      date: "03/10/2025",
      status: "available",
    },
    {
      id: "crlv",
      title: "CRLV-e",
      date: "03/10/2025",
      status: "available",
    },
    {
      id: "warranty",
      title: "Garantia Toyota",
      date: "03/10/2025",
      status: "available",
    },
    {
      id: "manual",
      title: "Manual do Toyota",
      date: "03/10/2025",
      status: "available",
    },
    {
      id: "maintenance-plan",
      title: "Plano de revisões",
      date: "03/10/2025",
      status: "available",
    },
  ],
  recalls: [],
  tracking: {
    vehicleId: "CHASSI_12345",
    model: "Toyota Corolla Altis",
    version: "Hybrid 2025",
    color: "Branco Pérola",
    year: "2025",
    engine: "1.8 Hybrid",
    currentStepIndex: 3,
    steps: [
      {
        id: "1",
        label: "Início da produção",
        status: "completed",
        date: "10/05/2026",
      },
      { id: "2", label: "Pintura", status: "completed", date: "12/05/2026" },
      {
        id: "3",
        label: "Processo de montagem",
        status: "completed",
        date: "15/05/2026",
      },
      { id: "4", label: "Aguardando o embarque", status: "current" },
      { id: "5", label: "Em trânsito", status: "pending" },
      { id: "6", label: "Saiu para entrega", status: "pending" },
    ],
  },
  createdAt: 0,
  updatedAt: 0,
};

const context: ChatContext = {
  firstName: "Julio",
  garage,
  isLoading: false,
  error: null,
};

describe("resolveChatReply", () => {
  it("responde o status real da montagem", () => {
    const reply = resolveChatReply("Como está a montagem?", context);

    expect(reply.text).toContain("Aguardando o embarque");
    expect(reply.text).toContain("etapa 4 de 6");
    expect(reply.text).toContain("15/05/2026");
    expect(reply.action).toEqual({ label: "Ver status", href: "/tracking" });
  });

  it("responde a próxima parcela com valor e vencimento", () => {
    const reply = resolveChatReply("Quando vence a próxima parcela?", context);

    expect(reply.text).toContain("R$ 2.850,00");
    expect(reply.text).toContain("05/12/2026");
    expect(reply.text).toContain("12 de 48");
    expect(reply.text).not.toContain(boletoBarcode);
    expect(reply.action).toEqual({ label: "Abrir boleto", href: "/boleto" });
  });

  it("lista os documentos disponíveis", () => {
    const reply = resolveChatReply("Quais documentos eu tenho?", context);

    expect(reply.text).toContain("Nota fiscal");
    expect(reply.text).toContain("CRLV-e");
    expect(reply.text).toContain("Plano de revisões");
    expect(reply.action).toEqual({
      label: "Ver documentos",
      href: "/vehicle-management",
    });
  });

  it("abre o documento específico perguntado", () => {
    const reply = resolveChatReply("Onde vejo o CRLV?", context);

    expect(reply.text).toContain("CRLV-e está disponível");
    expect(reply.action).toEqual({ label: "Ver CRLV-e", href: "/crlv" });
  });

  it("informa quando não há recall ativo", () => {
    const reply = resolveChatReply("Tenho algum recall?", context);

    expect(reply.text).toContain("Não há campanhas de recall");
    expect(reply.action).toBeUndefined();
  });

  it("aponta a campanha de recall quando existe", () => {
    const recallGarage: GarageData = {
      ...garage,
      recalls: [{ id: "r1", title: "Campanha do airbag" }],
    };
    const reply = resolveChatReply("Tenho recall?", {
      ...context,
      garage: recallGarage,
    });

    expect(reply.text).toContain("Campanha do airbag");
    expect(reply.action).toEqual({
      label: "Ver recall",
      href: { pathname: "/recall/[id]", params: { id: "r1" } },
    });
  });

  it("não inventa quilometragem de revisão", () => {
    const reply = resolveChatReply("Qual a próxima revisão?", context);

    expect(reply.text).toContain("quilometragem");
    expect(reply.action).toEqual({
      label: "Ver plano de revisões",
      href: "/plano-de-revisoes",
    });
  });

  it("responde sobre o pedido", () => {
    const reply = resolveChatReply("Quero ver meu pedido", context);

    expect(reply.text).toContain("TT-12345");
    expect(reply.text).toContain("Concessionária Toyota");
    expect(reply.action).toEqual({
      label: "Ver veículo",
      href: "/vehicle-management",
    });
  });

  it("responde sobre o veículo e o chassi", () => {
    const reply = resolveChatReply("Qual é o meu chassi?", context);

    expect(reply.text).toContain("CHASSI_12345");
    expect(reply.text).toContain("Branco Pérola");
  });

  it("cumprimenta com o primeiro nome", () => {
    const reply = resolveChatReply("Oi", context);

    expect(reply.text).toContain("Julio");
    expect(reply.text).toContain("Como posso ajudar");
  });

  it("varia a saudação conforme a conversa", () => {
    const first = resolveChatReply("Oi", context, 0);
    const second = resolveChatReply("Eae", context, 1);

    expect(first.text).toContain("Julio");
    expect(second.text).toContain("Julio");
    expect(first.text).not.toBe(second.text);
  });

  it("responde como vai", () => {
    const reply = resolveChatReply("tudo bem?", context);

    expect(reply.text).toContain("Tudo ótimo");
    expect(reply.text).toContain("Julio");
  });

  it("responde agradecimento", () => {
    expect(resolveChatReply("obrigado", context).text).toContain("De nada");
  });

  it("responde despedida", () => {
    expect(resolveChatReply("tchau", context).text).toContain("Até mais");
  });

  it("explica o que faz", () => {
    expect(resolveChatReply("o que você faz?", context).text).toContain(
      "status da montagem"
    );
  });

  it("não confunde oi com oito", () => {
    expect(resolveChatReply("oito", context).text).toContain(
      "Ainda não tenho esse dado"
    );
  });

  it("usa o fallback para assunto desconhecido", () => {
    const reply = resolveChatReply("previsão do tempo para amanhã", context);

    expect(reply.text).toContain("Ainda não tenho esse dado");
    expect(reply.action).toBeUndefined();
  });

  it("avisa que está carregando quando não há garagem", () => {
    const reply = resolveChatReply("Como está a montagem?", {
      ...context,
      garage: null,
      isLoading: true,
    });

    expect(reply.text).toContain("carregando");
  });

  it("avisa quando não há veículo vinculado", () => {
    const reply = resolveChatReply("Como está a montagem?", {
      ...context,
      garage: null,
    });

    expect(reply.text).toContain("não encontrei um veículo");
  });
});

describe("buildChatWelcome", () => {
  it("usa nome e saudação curta", () => {
    const welcome = buildChatWelcome(context);

    expect(welcome.title).toBe("Oi, Julio! Tudo bem?");
    expect(welcome.subtitle).toBe(
      "Sou o Techy, seu assistente Toyota. Como posso ajudar?"
    );
    expect(welcome.suggestions.map((item) => item.label)).toEqual([
      "Meu status",
      "Meu boleto",
      "Meus documentos",
    ]);
  });

  it("mantém sugestões padrão sem garagem", () => {
    const welcome = buildChatWelcome({
      ...context,
      garage: null,
      isLoading: false,
    });

    expect(welcome.subtitle).toContain("não encontrei um veículo");
    expect(welcome.suggestions).toHaveLength(3);
  });
});

describe("buildChatContext", () => {
  it("extrai o primeiro nome do perfil", () => {
    const result = buildChatContext({
      user: {
        email: "julio@example.com",
        name: "Julio",
        isVerified: true,
        profile: {
          fullName: "Julio Coronetti",
          birthDate: "01/01/1990",
          cpf: "12345678909",
        },
      },
      garage,
      isLoading: false,
      error: null,
    });

    expect(result.firstName).toBe("Julio");
  });
});

describe("formatChatTime", () => {
  it("formata hora e minuto com dois dígitos", () => {
    expect(formatChatTime(new Date(2026, 0, 5, 9, 5))).toBe("09:05");
  });
});
