import { apiRequest } from "@/services/api";
import { GarageData, GarageResponse } from "@/types/garage";

export const MOCK_GARAGE_DATA: GarageData = {
  userId: "dev-user-001",
  order: {
    orderId: "PED-2026-8941",
    status: "Production",
    purchaseDate: "10/05/2026",
    dealership: "Toyota Sao Paulo Morumbi",
  },
  vehicle: {
    vehicleId: "corolla-altis-hybrid-2026",
    model: "Corolla Altis Hybrid",
    version: "Altis Hybrid Premium",
    color: "Pearl White",
    year: "2026/2026",
    engine: "1.8L VVT-i Hybrid Flex",
    chassi: "9BRBL30E8SZ123456",
  },
  financing: {
    bank: "Banco Toyota S.A.",
    contractNumber: "FIN-77492-TY",
    paidInstallments: 3,
    totalInstallments: 36,
    installmentAmount: "R$ 2.450,00",
    nextDueDate: "15/06/2026",
    boletoAvailable: true,
    status: "Active",
  },
  documents: [
    {
      id: "doc-1",
      title: "Vehicle registration (CRLV)",
      date: "12/05/2026",
      status: "available",
    },
    {
      id: "doc-2",
      title: "Warranty manual",
      date: "15/05/2026",
      status: "available",
    },
  ],
  recalls: [],
  tracking: {
    vehicleId: "corolla-altis-hybrid-2026",
    model: "Corolla Altis Hybrid",
    version: "Altis Hybrid Premium",
    color: "Pearl White",
    year: "2026/2026",
    engine: "1.8L VVT-i Hybrid Flex",
    currentStepIndex: 1,
    steps: [
      {
        id: "1",
        label: "Order confirmed",
        status: "completed",
        date: "10/05/2026",
      },
      {
        id: "2",
        label: "Production",
        status: "current",
        date: "15/05/2026",
      },
      {
        id: "3",
        label: "Quality inspection",
        status: "pending",
      },
      {
        id: "4",
        label: "Ready for delivery",
        status: "pending",
      },
    ],
  },
  createdAt: 1715340000,
  updatedAt: 1715772000,
};

export async function fetchGarageCurrent(token: string) {
  if (token === "dev-mock-access-token") {
    return { garage: MOCK_GARAGE_DATA };
  }
  try {
    return await apiRequest<GarageResponse>("/garage/current", {
      method: "GET",
      token,
    });
  } catch {
    return { garage: MOCK_GARAGE_DATA };
  }
}

export async function resolveGarage(token: string) {
  if (token === "dev-mock-access-token") {
    return { garage: MOCK_GARAGE_DATA };
  }
  return apiRequest<GarageResponse>("/garage/resolve", {
    method: "POST",
    token,
  });
}

export async function linkGaragePurchase(
  token: string,
  payload: { purchaseId?: string; orderId?: string }
) {
  if (token === "dev-mock-access-token") {
    return { garage: MOCK_GARAGE_DATA };
  }
  return apiRequest<GarageResponse>("/garage/link", {
    method: "POST",
    token,
    body: payload,
  });
}
