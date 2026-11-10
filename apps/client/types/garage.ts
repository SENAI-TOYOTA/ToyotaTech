import type { ProducaoStatus, TrackingInfo } from "@/types/tracking";

export interface GarageVehicle {
  vehicleId: string;
  vin?: string;
  model: string;
  version: string;
  color: string;
  year: string;
  engine: string;
  chassi: string;
}

export interface GarageOrder {
  orderId: string;
  status: string;
  purchaseDate: string;
  dealership: string;
}

export interface GarageFinancing {
  bank: string;
  contractNumber?: string;
  paidInstallments: number;
  totalInstallments: number;
  installmentAmount: string;
  nextDueDate: string;
  boletoAvailable: boolean;
  status?: string;
}

export interface GarageDocument {
  id: string;
  title: string;
  date: string;
  status: "available" | "pending";
  url?: string;
}

export interface GarageRecall {
  id: string;
  title: string;
  description?: string;
  status?: string;
}

export interface GarageData {
  userId: string;
  order: GarageOrder;
  vehicle: GarageVehicle;
  financing: GarageFinancing;
  documents: GarageDocument[];
  recalls: GarageRecall[];
  tracking: TrackingInfo | ProducaoStatus;
  purchaseId?: string;
  matchSource?: string;
  matchConfidence?: string;
  matchAlgorithmVersion?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Tipagem de dados do veículo/garagem retornada pela API
 * (alias semântico para `GarageData`).
 */
export type VeiculoData = GarageData;

export interface GarageResponse {
  garage: VeiculoData;
}
