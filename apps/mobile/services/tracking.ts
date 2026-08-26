import { TrackingInfo } from "@/types/tracking";

export const fetchTrackingStatus = async (
  vehicleId: string
): Promise<TrackingInfo> => {
  // Simulating API call to Lambda
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const steps = [
    {
      id: "1",
      label: "Início da produção",
      status: "completed" as const,
      date: "10/05/2026",
    },
    {
      id: "2",
      label: "Pintura",
      status: "completed" as const,
      date: "12/05/2026",
    },
    {
      id: "3",
      label: "Processo de montagem",
      status: "completed" as const,
      date: "15/05/2026",
    },
    { id: "4", label: "Aguardando o embarque", status: "current" as const },
    { id: "5", label: "Em trânsito", status: "pending" as const },
    { id: "6", label: "Saiu para entrega", status: "pending" as const },
  ];

  return {
    vehicleId,
    model: "Toyota Corolla Altis",
    version: "Hybrid 2025",
    color: "Branco Pérola",
    year: "2025",
    engine: "1.8 Hybrid",
    currentStepIndex: 3,
    steps,
  };
};
