export type TrackingStepStatus = "completed" | "current" | "pending";

export interface TrackingStep {
  id: string;
  label: string;
  status: TrackingStepStatus;
  date?: string;
  station?: string;
  description?: string;
}

export interface TrackingInfo {
  vehicleId: string;
  vin?: string;
  chassi?: string;
  model: string;
  version: string;
  color: string;
  year: string;
  engine: string;
  currentStepIndex: number;
  steps: TrackingStep[];
  updatedAt?: string | number;
}

/**
 * Modelo de resposta do endpoint de produção/telemetria IIoT
 * (`GET /api/producao/{vin}` e `GET /garage/status`).
 */
export interface ProducaoStatus extends TrackingInfo {
  vin?: string;
  chassi?: string;
  stage?: string;
  progress?: number;
  lastTelemetryAt?: string;
}

export interface ProducaoStatusEnvelope {
  tracking?: ProducaoStatus;
  producao?: ProducaoStatus;
}
