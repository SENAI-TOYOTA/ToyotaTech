export class ApiError extends Error {
  status: number;
  retryAfter?: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    retryAfter?: number,
    code?: string
  ) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
    this.code = code;
  }
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  if (error.status === 429 && error.retryAfter !== undefined) {
    return `${error.message} Try again in ${error.retryAfter}s.`;
  }
  return error.message;
}

function parseRetryAfter(
  body: { retryAfter?: number },
  header: string | null
): number | undefined {
  const fromBody = body.retryAfter;
  if (
    typeof fromBody === "number" &&
    Number.isFinite(fromBody) &&
    fromBody >= 0
  ) {
    return fromBody;
  }
  if (!header) {
    return undefined;
  }
  const fromHeader = Number(header);
  return Number.isFinite(fromHeader) && fromHeader >= 0
    ? fromHeader
    : undefined;
}

const REQUEST_TIMEOUT_MS = 15000;

function getApiUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_URL not configured. Run deploy at aws/scripts/deploy.ps1."
    );
  }
  return baseUrl.replace(/\/$/, "");
}

export async function apiRequest<T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PUT";
    body?: unknown;
    token?: string;
    suppressErrorLog?: boolean;
  }
) {
  const baseUrl = getApiUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout exceeded.", 408);
    }
    if (__DEV__) {
      console.error("[API] Request failed", { path, error });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await response.text();
  let parsed = {} as { message?: string } & T;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as { message?: string } & T;
    } catch {
      if (__DEV__) {
        console.error("[API] Invalid response", {
          path,
          status: response.status,
          body: raw,
        });
      }
      parsed = { message: "Invalid API response." } as {
        message?: string;
      } & T;
    }
  }

  if (!response.ok) {
    const message = (parsed as { message?: string }).message ?? "API error.";
    const retryAfter = parseRetryAfter(
      parsed as { retryAfter?: number },
      response.headers.get("Retry-After")
    );
    const code = (parsed as { code?: string }).code;
    if (__DEV__ && !options?.suppressErrorLog) {
      console.error("[API] Response error", {
        path,
        status: response.status,
        message,
        retryAfter,
        code,
        body: raw,
      });
    }
    throw new ApiError(message, response.status, retryAfter, code);
  }

  return parsed as T;
}
