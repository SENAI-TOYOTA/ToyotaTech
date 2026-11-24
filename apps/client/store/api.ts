import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import {
  SESSION_COOKIE,
  TOKEN_COOKIE_KEY,
} from "@/lib/auth/session";
import {
  buildProducaoStatusAtStep,
  MOCK_GARAGE_DATA,
  MOCK_TRACKING_STEPS,
} from "@/lib/mocks/garage";

export const TOKEN_STORAGE_KEY = "toyotatech.token";
export const USER_STORAGE_KEY = "toyotatech.user";
export const LEGACY_SESSION_STORAGE_KEY = "toyotatech.auth.session";
export { SESSION_COOKIE, TOKEN_COOKIE_KEY };

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
 * Remove token JWT e metadados de sessão do armazenamento do cliente.
 */
export function clearAuthTokenCookie() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
    } catch {
      // Ignora falha de acesso ao localStorage
    }
  }

  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
    document.cookie = `token=; Path=/; Max-Age=0; SameSite=Lax`;
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
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

export const HAS_CONFIGURED_API_URL = Boolean(
  process.env.NEXT_PUBLIC_API_URL?.trim(),
);

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000"
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
let autoAdvanceSimulatedIoT = false;
let simulateApiError = false;
let localBackendUnavailable = false;

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

function isPublicAuthEndpoint(url: string): boolean {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/check-email")
  );
}

function extractRetryAfterSeconds(error: FetchBaseQueryError): number | null {
  if (
    error.data &&
    typeof error.data === "object" &&
    "retryAfter" in error.data &&
    typeof (error.data as { retryAfter?: unknown }).retryAfter === "number"
  ) {
    return (error.data as { retryAfter: number }).retryAfter;
  }
  return null;
}

/**
 * BaseQuery centralizada com:
 * 1. Injeção automática de `Authorization: Bearer <token>`.
 * 2. Tratamento de `401`/`403` (limpeza de sessão e redirecionamento para `/login`).
 * 3. Tratamento de `429` sem retry automático (respeitando rate limit da AWS).
 * 4. Fallback local resiliente quando o backend está indisponível (`FETCH_ERROR`).
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

  const { url, method, body } = extractUrlAndMethod(args);
  let result: Awaited<ReturnType<typeof rawBaseQuery>> | null = null;

  const shouldTryNetwork = HAS_CONFIGURED_API_URL && !localBackendUnavailable;

  if (shouldTryNetwork) {
    result = await rawBaseQuery(args, apiCtx, extraOptions);

    if (result.error) {
      const status = result.error.status;

      if ((status === 401 || status === 403) && !isPublicAuthEndpoint(url)) {
        const hadToken = Boolean(resolveAuthToken(apiCtx.getState()));
        if (hadToken) {
          clearAuthTokenCookie();
          apiCtx.dispatch({ type: "auth/logout" });
          apiCtx.dispatch(api.util.resetApiState());

          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/login")
          ) {
            const redirectPath = encodeURIComponent(window.location.pathname);
            window.location.assign(
              `/login?expired=1&redirect=${redirectPath}`,
            );
          }
        }

        return {
          error: {
            status,
            data: {
              message:
                status === 401
                  ? "Sua sessão expirou. Entre novamente para continuar."
                  : "Você não tem permissão para acessar este recurso.",
            },
          },
        };
      }

      if (status === 429) {
        const retryAfter = extractRetryAfterSeconds(result.error);
        return {
          error: {
            status: 429,
            data: {
              retryAfter,
              message: retryAfter
                ? `Muitas tentativas em sequência. Aguarde ${retryAfter} segundos para tentar novamente.`
                : "Muitas tentativas em sequência. Aguarde alguns instantes e tente novamente.",
            },
          },
        };
      }

      if (status !== "FETCH_ERROR" && status !== "TIMEOUT_ERROR") {
        return result;
      }

      localBackendUnavailable = true;
    } else {
      return result;
    }
  }

  // Fallback local do RTK Query quando o backend está offline (`FETCH_ERROR`/`TIMEOUT_ERROR`)
  if (method === "POST" && url.includes("/auth/login")) {
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

  if (method === "POST" && url.includes("/auth/register")) {
    return {
      data: {
        message: "Conta criada com sucesso.",
        requiresEmailVerification: false,
      },
    };
  }

  if (url.includes("/auth/me") || url === "/me") {
    return {
      data: {
        user: {
          id: "usr_demo_toyota_01",
          email: "cliente@toyota.com.br",
          name: "Cliente Toyota",
          isVerified: true,
        },
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

    if (autoAdvanceSimulatedIoT) {
      simulatedStepCursor =
        simulatedStepCursor >= MOCK_TRACKING_STEPS.length
          ? 0
          : simulatedStepCursor + 1;
    }

    return { data: currentStatus };
  }

  return (
    result ?? {
      error: {
        status: 404,
        data: { message: "Endpoint não encontrado no fallback local." },
      },
    }
  );
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithFallback,
  tagTypes: ["Auth", "Garage", "ProductionTracking"],
  endpoints: () => ({}),
});

export default api;
