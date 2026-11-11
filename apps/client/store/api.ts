import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import {
  buildProducaoStatusAtStep,
  MOCK_GARAGE_DATA,
  MOCK_TRACKING_STEPS,
} from "@/lib/mocks/garage";

export const TOKEN_STORAGE_KEY = "toyotatech.token";
export const LEGACY_SESSION_STORAGE_KEY = "toyotatech.auth.session";
export const TOKEN_COOKIE_KEY = "toyotatech.token";

interface RootStateWithAuth {
  auth?: {
    token?: string | null;
  };
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined" || !document.cookie) {
    return null;
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Salva o token JWT em cookie e localStorage para uso pelo middleware Next.js e RTK Query.
 */
export function setAuthTokenCookie(token: string, maxAgeSeconds = 60 * 60 * 8) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Ignora falha de acesso ao localStorage
    }
  }

  if (typeof document !== "undefined") {
    const encoded = encodeURIComponent(token);
    document.cookie = `${TOKEN_COOKIE_KEY}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
    document.cookie = `token=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  }
}

/**
 * Recupera o token JWT do estado Redux, cookies ou localStorage do navegador.
 */
export function resolveAuthToken(state?: unknown): string | null {
  const stateToken = (state as RootStateWithAuth | undefined)?.auth?.token;
  if (stateToken) {
    return stateToken;
  }

  if (typeof window !== "undefined") {
    const cookieToken =
      readCookie(TOKEN_COOKIE_KEY) ?? readCookie("token") ?? null;
    if (cookieToken) {
      return cookieToken;
    }

    try {
      const directToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (directToken) {
        return directToken;
      }

      const rawSession = window.localStorage.getItem(LEGACY_SESSION_STORAGE_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as {
          token?: string;
          accessToken?: string;
        };
        if (parsed.token || parsed.accessToken) {
          return parsed.token ?? parsed.accessToken ?? null;
        }
      }
    } catch {
      // Ignora falha de acesso ao localStorage
    }
  }

  return null;
}

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = resolveAuthToken(getState());
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    return headers;
  },
});

// Estado do simulador embutido no RTK Query (quando o backend local não está rodando)
let simulatedStepCursor = 2;
let autoAdvanceSimulatedIoT = true;
let simulateApiError = false;

export function getSimulatedStepCursor(): number {
  return simulatedStepCursor;
}

export function setSimulatedStepCursor(stepIndex: number) {
  simulatedStepCursor = Math.max(
    0,
    Math.min(stepIndex, MOCK_TRACKING_STEPS.length),
  );
}

export function isAutoAdvanceEnabled(): boolean {
  return autoAdvanceSimulatedIoT;
}

export function setAutoAdvanceEnabled(enabled: boolean) {
  autoAdvanceSimulatedIoT = enabled;
}

export function isSimulateApiErrorEnabled(): boolean {
  return simulateApiError;
}

export function setSimulateApiError(enabled: boolean) {
  simulateApiError = enabled;
}

function extractUrlAndMethod(args: string | FetchArgs): {
  url: string;
  method: string;
  body?: unknown;
} {
  if (typeof args === "string") {
    return { url: args, method: "GET" };
  }
  return {
    url: args.url,
    method: (args.method ?? "GET").toUpperCase(),
    body: args.body,
  };
}

/**
 * BaseQuery com fallback resiliente:
 * 1. Tenta requisitar a API real (.NET / Python).
 * 2. Caso a flag `simulateApiError` esteja ativa, retorna `FetchBaseQueryError` (503) para acionar `isError`.
 * 3. Caso o backend local esteja desligado (`FETCH_ERROR`), resolve com dados mockados no RTK Query,
 *    inclusive avançando as etapas da esteira a cada ciclo de polling (5s).
 */
const baseQueryWithFallback: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiCtx, extraOptions) => {
  if (simulateApiError) {
    return {
      error: {
        status: 503,
        data: {
          message:
            "Não foi possível conectar ao servidor Toyota Tech. Verifique sua conexão ou tente novamente.",
        },
      },
    };
  }

  const result = await rawBaseQuery(args, apiCtx, extraOptions);
  if (!result.error || result.error.status !== "FETCH_ERROR") {
    return result;
  }

  // Fallback local do RTK Query quando o backend não está rodando localmente
  const { url, method, body } = extractUrlAndMethod(args);

  if (method === "POST" && url.includes("/api/auth/login")) {
    const payload = (body ?? {}) as { email?: string; name?: string };
    const email = (payload.email ?? "cliente@toyota.com.br")
      .trim()
      .toLowerCase();
    const name = payload.name?.trim() || email.split("@")[0];
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: "usr_demo_toyota_01", email, name }),
    )}.toyotatech_sig`;

    return {
      data: {
        token: mockJwt,
        accessToken: mockJwt,
        user: {
          id: "usr_demo_toyota_01",
          email,
          name,
          isVerified: true,
        },
      },
    };
  }

  if (method === "POST" && url.includes("/api/auth/register")) {
    return {
      data: {
        message: "Conta criada com sucesso.",
        requiresEmailVerification: false,
      },
    };
  }

  if (
    url.includes("/api/garagem") ||
    url.includes("/garage/current") ||
    url.includes("/api/veiculo")
  ) {
    return {
      data: {
        ...MOCK_GARAGE_DATA,
        tracking: buildProducaoStatusAtStep(simulatedStepCursor),
      },
    };
  }

  if (url.includes("/api/producao/") || url.includes("/garage/status")) {
    const vinMatch = url.split("/api/producao/")[1];
    const vin = vinMatch
      ? decodeURIComponent(vinMatch)
      : MOCK_GARAGE_DATA.vehicle.chassi;

    const currentStatus = buildProducaoStatusAtStep(simulatedStepCursor, vin);

    // Avança automaticamente a etapa para o próximo ciclo de polling (5s)
    if (autoAdvanceSimulatedIoT) {
      simulatedStepCursor =
        simulatedStepCursor >= MOCK_TRACKING_STEPS.length
          ? 0
          : simulatedStepCursor + 1;
    }

    return { data: currentStatus };
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithFallback,
  tagTypes: ["Auth", "Garage", "ProductionTracking"],
  endpoints: () => ({}),
});

export default api;
