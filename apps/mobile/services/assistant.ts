import { Href } from "expo-router";

import {
  currentMileage,
  customerServicePhone,
  dealerships,
  getNextMaintenance,
  roadsidePhone,
  warrantyCoverages,
} from "@/constants/aftersales";
import { ServiceBooking } from "@/hooks/useServiceBooking";
import { formatNumber, t } from "@/i18n";
import { GarageData } from "@/types/garage";

export interface AssistantAction {
  label: string;
  route: Href;
}

export interface AssistantReply {
  text: string;
  actions?: AssistantAction[];
}

export interface AssistantContext {
  firstName: string;
  garage: GarageData | null;
  bookings: ServiceBooking[];
}

interface Intent {
  keywords: string[];
  reply: (context: AssistantContext) => AssistantReply;
}

export const suggestedQuestions = [
  "Where is my car?",
  "When is my next service?",
  "Book a service",
  "Financing status",
  "Roadside assistance",
  "Warranty coverage",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function orderReply({ garage }: AssistantContext): AssistantReply {
  if (!garage) {
    return {
      text: t(
        "I could not find an order linked to your account yet. Once your purchase is linked, I can tell you exactly where your car is."
      ),
    };
  }
  const current = garage.tracking?.steps.find(
    (step) => step.status === "current"
  );
  const stage = t(current?.label ?? garage.order.status);
  return {
    text: t(
      'Your {model} is currently at the stage "{stage}". The order was placed at {dealer}.',
      {
        model: garage.vehicle.model,
        stage,
        dealer: garage.order.dealership,
      }
    ),
    actions: [{ label: "Open order status", route: "/tracking" }],
  };
}

function financingReply({ garage }: AssistantContext): AssistantReply {
  const financing = garage?.financing;
  if (!financing) {
    return {
      text: t("There is no financing contract linked to your account."),
    };
  }
  return {
    text: t(
      "You have paid {paid} of {total} installments with {bank}. {remaining} remain. The next installment of {amount} is due on {date}.",
      {
        paid: financing.paidInstallments,
        total: financing.totalInstallments,
        bank: financing.bank,
        remaining: financing.totalInstallments - financing.paidInstallments,
        amount: financing.installmentAmount,
        date: financing.nextDueDate,
      }
    ),
    actions: [{ label: "Open financing", route: "/financing" }],
  };
}

function maintenanceReply({ bookings }: AssistantContext): AssistantReply {
  const next = getNextMaintenance();
  const booking = bookings[0];
  const base = t(
    "Your next scheduled maintenance is the {service}, due in about {km} km or {months} months, whichever comes first. Estimated price: {price}.",
    {
      service: t(next.title),
      km: formatNumber(Math.max(next.mileage - currentMileage, 0)),
      months: next.months,
      price: next.estimatedPrice,
    }
  );
  const bookingText = booking
    ? t(" You already have {service} booked at {dealer} on {date} at {time}.", {
        service: t(booking.serviceType).toLowerCase(),
        dealer: booking.dealershipName,
        date: booking.date,
        time: booking.time,
      })
    : "";
  return {
    text: `${base}${bookingText}`,
    actions: [
      { label: "Book a service", route: "/schedule-service" },
      { label: "Maintenance plan", route: "/maintenance" },
    ],
  };
}

const intents: Intent[] = [
  {
    keywords: [
      "financing",
      "installment",
      "payment",
      "invoice",
      "boleto",
      "bank",
      "financiamento",
      "parcela",
      "pagamento",
    ],
    reply: financingReply,
  },
  {
    keywords: [
      "where",
      "order",
      "delivery",
      "deliver",
      "track",
      "status",
      "arrive",
      "pedido",
      "entrega",
      "onde",
      "chega",
    ],
    reply: orderReply,
  },
  {
    keywords: [
      "book",
      "schedule",
      "appointment",
      "agendar",
      "agendamento",
      "marcar",
    ],
    reply: () => ({
      text: t(
        "I can help with that. Choose a dealership, the type of service and a time that works for you."
      ),
      actions: [{ label: "Book a service", route: "/schedule-service" }],
    }),
  },
  {
    keywords: [
      "service",
      "maintenance",
      "revision",
      "oil",
      "revisao",
      "manutencao",
      "oleo",
    ],
    reply: maintenanceReply,
  },
  {
    keywords: [
      "roadside",
      "tow",
      "breakdown",
      "emergency",
      "accident",
      "flat",
      "guincho",
      "socorro",
      "assistencia",
      "pane",
      "pneu",
      "bateria",
    ],
    reply: () => ({
      text: t(
        "Toyota roadside assistance is available 24 hours a day, 7 days a week. Call {phone}. Stay in a safe place and keep your chassis number at hand.",
        { phone: roadsidePhone }
      ),
      actions: [{ label: "Roadside assistance", route: "/roadside" }],
    }),
  },
  {
    keywords: ["warranty", "guarantee", "coverage", "garantia", "cobertura"],
    reply: () => ({
      text: t(
        "Your Toyota includes {coverages}. Keep your scheduled maintenance up to date to preserve it.",
        {
          coverages: warrantyCoverages
            .map((coverage) =>
              t("{title} ({years} years)", {
                title: t(coverage.title).toLowerCase(),
                years: coverage.years,
              })
            )
            .join(", "),
        }
      ),
      actions: [{ label: "Warranty details", route: "/warranty" }],
    }),
  },
  {
    keywords: ["document", "crlv", "paper", "recall", "documento", "nota"],
    reply: ({ garage }) => ({
      text: t(
        "You have {documents} documents and {recalls} open recalls in your account.",
        {
          documents: garage?.documents.length ?? 0,
          recalls: garage?.recalls.length ?? 0,
        }
      ),
      actions: [{ label: "Open documents", route: "/vehicle-management" }],
    }),
  },
  {
    keywords: [
      "dealer",
      "dealership",
      "store",
      "address",
      "near",
      "concessionaria",
      "loja",
      "endereco",
    ],
    reply: () => ({
      text: t(
        "There are {count} Toyota dealerships available for service, including {name} ({city}).",
        {
          count: dealerships.length,
          name: dealerships[0].name,
          city: dealerships[0].city,
        }
      ),
      actions: [{ label: "See dealerships", route: "/dealers" }],
    }),
  },
  {
    keywords: [
      "human",
      "agent",
      "person",
      "phone",
      "call",
      "contact",
      "atendente",
      "telefone",
      "contato",
      "humano",
    ],
    reply: () => ({
      text: t(
        "You can talk to a Toyota customer service agent at {phone}, Monday to Friday, 8am to 8pm.",
        { phone: customerServicePhone }
      ),
    }),
  },
  {
    keywords: ["hello", "hi", "hey", "ola", "oi", "bom", "boa"],
    reply: ({ firstName }) => ({
      text: t("Hi {name}! How can I help you with your Toyota today?", {
        name: firstName,
      }),
    }),
  },
  {
    keywords: ["thank", "thanks", "obrigad", "valeu"],
    reply: () => ({
      text: t("You are welcome! Anything else I can help with?"),
    }),
  },
];

export function getWelcomeMessage(firstName: string): AssistantReply {
  return {
    text: t(
      "Hi {name}, I am the Toyota Assistant. I can check your order, financing, maintenance, warranty and more. What do you need?",
      { name: firstName }
    ),
  };
}

export function getAssistantReply(
  message: string,
  context: AssistantContext
): AssistantReply {
  const words = normalize(message).split(/\s+/).filter(Boolean);
  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    const score = intent.keywords.filter((keyword) =>
      words.some((word) => word.startsWith(keyword))
    ).length;
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  if (best) {
    return best.reply(context);
  }

  return {
    text: t(
      "I am not sure I understood. I can help with your order status, maintenance and bookings, financing, warranty, documents, dealerships and roadside assistance."
    ),
  };
}
