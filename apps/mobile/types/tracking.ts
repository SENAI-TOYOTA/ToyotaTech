export type TrackingStepStatus = "completed" | "current" | "pending";

export interface TrackingStep {
  id: string;
  label: string;
  status: TrackingStepStatus;
  date?: string;
}

export interface TrackingInfo {
  vehicleId: string;
  model: string;
  version: string;
  color: string;
  year: string;
  engine: string;
  currentStepIndex: number;
  steps: TrackingStep[];
}
