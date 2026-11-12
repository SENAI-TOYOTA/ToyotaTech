import { ApiError, apiErrorMessage, apiRequest } from "@/services/api";
import { TrackingInfo } from "@/types/tracking";

export type TrackingErrorKind =
  "unlinked" | "expired" | "throttled" | "server" | "unknown";

export interface TrackingErrorState {
  kind: TrackingErrorKind;
  title: string;
  description: string;
  retryable: boolean;
}

export async function fetchTrackingStatus(
  token: string
): Promise<TrackingInfo> {
  const data = await apiRequest<{ tracking: TrackingInfo }>("/garage/status", {
    method: "GET",
    token,
  });
  return data.tracking;
}

export function resolveTrackingError(error: unknown): TrackingErrorState {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return {
        kind: "unlinked",
        title: "Nenhum veículo vinculado",
        description:
          "Vincule um veículo à sua conta para acompanhar a montagem.",
        retryable: false,
      };
    }
    if (error.status === 401) {
      return {
        kind: "expired",
        title: "Sessão expirada",
        description: "Entre novamente para continuar acompanhando o status.",
        retryable: false,
      };
    }
    if (error.status === 429) {
      return {
        kind: "throttled",
        title: "Muitas tentativas",
        description: apiErrorMessage(
          error,
          "Aguarde alguns instantes e tente novamente."
        ),
        retryable: true,
      };
    }
    if (error.status >= 500) {
      return {
        kind: "server",
        title: "Falha no servidor",
        description: "Tente novamente em instantes.",
        retryable: true,
      };
    }
    return {
      kind: "unknown",
      title: "Não foi possível carregar o status",
      description: apiErrorMessage(error, "Tente novamente em instantes."),
      retryable: true,
    };
  }

  return {
    kind: "unknown",
    title: "Falha de conexão",
    description: "Verifique sua internet e tente novamente.",
    retryable: true,
  };
}

export function formatUpdatedAt(
  timestamp: number | null,
  now: number = Date.now()
): string {
  if (!timestamp) {
    return "";
  }

  const elapsedMinutes = Math.max(0, Math.floor((now - timestamp) / 60000));

  if (elapsedMinutes < 1) {
    return "Atualizado agora";
  }
  if (elapsedMinutes < 60) {
    return `Atualizado há ${elapsedMinutes} min`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `Atualizado há ${elapsedHours} h`;
}

export function hasTrackingData(data: TrackingInfo | null): boolean {
  if (!data) {
    return false;
  }
  return Boolean(
    data.vehicleId || (Array.isArray(data.steps) && data.steps.length > 0)
  );
}
