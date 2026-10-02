import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import { ApiError, apiErrorMessage, apiRequest } from "../api";

const originalFetch = globalThis.fetch;

function responseWith(
  status: number,
  body: unknown,
  headers?: Record<string, string>
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (caught) {
    return caught;
  }
  throw new Error("expected apiRequest to reject");
}

describe("apiRequest on 429", () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("reads retryAfter from the response body", async () => {
    globalThis.fetch = () =>
      Promise.resolve(
        responseWith(429, {
          message: "Too many requests.",
          retryAfter: 60,
        })
      );

    const error = (await captureError(
      apiRequest("/auth/register", { method: "POST" })
    )) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(60);
    expect(apiErrorMessage(error, "fallback")).toBe(
      "Too many requests. Try again in 60s."
    );
  });

  it("falls back to the Retry-After header when the body omits retryAfter", async () => {
    globalThis.fetch = () =>
      Promise.resolve(
        responseWith(
          429,
          { message: "Too many requests." },
          { "Retry-After": "1" }
        )
      );

    const error = (await captureError(
      apiRequest("/auth/login", { method: "POST" })
    )) as ApiError;

    expect(error.retryAfter).toBe(1);
    expect(apiErrorMessage(error, "fallback")).toBe(
      "Too many requests. Try again in 1s."
    );
  });

  it("keeps the plain message when neither source carries retryAfter", async () => {
    globalThis.fetch = () =>
      Promise.resolve(responseWith(429, { message: "Too many requests." }));

    const error = (await captureError(
      apiRequest("/auth/login", { method: "POST" })
    )) as ApiError;

    expect(error.retryAfter).toBeUndefined();
    expect(apiErrorMessage(error, "fallback")).toBe("Too many requests.");
  });

  it("surfaces the machine code from the response body", async () => {
    globalThis.fetch = () =>
      Promise.resolve(
        responseWith(409, {
          message: "This account was created with Google.",
          code: "FEDERATED_USER_NO_PASSWORD",
        })
      );

    const error = (await captureError(
      apiRequest("/auth/login", { method: "POST" })
    )) as ApiError;

    expect(error.status).toBe(409);
    expect(error.code).toBe("FEDERATED_USER_NO_PASSWORD");
    expect(error.retryAfter).toBeUndefined();
  });

  it("returns the fallback for failures that are not ApiError", () => {
    expect(apiErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });
});
