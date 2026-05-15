export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 15000;

function getApiUrl() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!baseUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_URL nao configurada. Execute o deploy em aws/scripts/deploy.ps1."
    );
  }
  return baseUrl.replace(/\/$/, "");
}

export async function apiRequest<T>(
  path: string,
  options?: {
    method?: "GET" | "POST";
    body?: unknown;
    token?: string;
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
      throw new ApiError("Tempo limite da requisicao excedido.", 408);
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
      parsed = { message: "Resposta invalida da API." } as { message?: string } & T;
    }
  }

  if (!response.ok) {
    const message = (parsed as { message?: string }).message ?? "Erro na API.";
    throw new ApiError(message, response.status);
  }

  return parsed as T;
}
