import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { ApiError, apiRequest } from "../api";
import { StoredSession } from "../sessionStorage.types";
import {
  getSession,
  putSession,
  registerSessionOps,
  resetSessionStore,
} from "../sessionStore";

const originalFetch = globalThis.fetch;
const API = "https://api.example.com";

const SESSION: StoredSession = {
  accessToken: "old-access",
  idToken: "old-id",
  refreshToken: "the-refresh-token",
  expiresAt: 1_800_000_000,
};

const RENEWED: StoredSession = {
  accessToken: "new-access",
  idToken: "new-id",
  refreshToken: "the-refresh-token",
  expiresAt: 1_900_000_000,
};

type Handler = {
  renew: (current: StoredSession) => Promise<StoredSession>;
  drop: () => Promise<void>;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

type Route = (url: string, init?: RequestInit) => Response | Promise<Response>;

function routeThrough(handler: Route) {
  return jest.fn(async (input: unknown, init?: RequestInit) =>
    handler(String(input), init)
  );
}

function capture(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    () => {
      throw new Error("expected apiRequest to reject");
    },
    (caught) => caught
  );
}

describe("apiRequest token renewal", () => {
  let renew: jest.Mock<Handler["renew"]>;
  let drop: jest.Mock<Handler["drop"]>;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = API;
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
    resetSessionStore();
    renew = jest.fn(async () => RENEWED);
    drop = jest.fn(async () => undefined);
    registerSessionOps({ renew, drop });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    resetSessionStore();
  });

  it("renews once and retries the original request", async () => {
    const seen: (string | null)[] = [];
    let attempts = 0;
    globalThis.fetch = routeThrough((_url, init) => {
      const auth = new Headers(init?.headers).get("Authorization");
      seen.push(auth);
      attempts += 1;
      return attempts === 1
        ? json(401, { message: "Expirado." })
        : json(200, { ok: true });
    });
    putSession(SESSION);

    const result = await apiRequest<{ ok: boolean }>("/me", {
      token: "old-access",
    });

    expect(result).toEqual({ ok: true });
    expect(renew).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(["Bearer old-access", "Bearer new-access"]);
  });

  it("collapses parallel 401s into a single renewal", async () => {
    let renewalsInFlight = 0;
    let maxRenewalsInFlight = 0;
    renew.mockImplementation(async () => {
      renewalsInFlight += 1;
      maxRenewalsInFlight = Math.max(maxRenewalsInFlight, renewalsInFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      renewalsInFlight -= 1;
      return RENEWED;
    });
    globalThis.fetch = routeThrough(async (url, init) => {
      const auth = new Headers(init?.headers).get("Authorization");
      if (auth === "Bearer new-access") {
        return json(200, { path: new URL(url).pathname });
      }
      await new Promise((resolve) => setTimeout(resolve, 2));
      return json(401, { message: "Expirado." });
    });
    putSession(SESSION);

    const paths = ["/me", "/garage/current", "/garage/status", "/profile"];
    const results = await Promise.all(
      paths.map((path) => apiRequest(path, { token: "old-access" }))
    );

    expect(results).toHaveLength(4);
    expect(renew).toHaveBeenCalledTimes(1);
    expect(maxRenewalsInFlight).toBe(1);
  });

  it("does not renew again when a 401 lands after the token already changed", async () => {
    const order: string[] = [];
    const slowResponse = () =>
      new Promise((resolve) => setTimeout(resolve, 30));

    renew.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return RENEWED;
    });

    globalThis.fetch = routeThrough(async (url, init) => {
      const auth = new Headers(init?.headers).get("Authorization");
      const path = new URL(url).pathname;
      order.push(`${path}:${auth}`);
      if (auth === "Bearer new-access") {
        return json(200, { path });
      }
      if (path === "/me") {
        return json(401, { message: "Expirado." });
      }
      await slowResponse();
      return json(401, { message: "Expirado." });
    });
    putSession(SESSION);

    const results = await Promise.all([
      apiRequest("/me", { token: "old-access" }),
      apiRequest("/garage/current", { token: "old-access" }),
    ]);

    expect(results).toHaveLength(2);
    expect(renew).toHaveBeenCalledTimes(1);
    expect(order).toEqual([
      "/me:Bearer old-access",
      "/garage/current:Bearer old-access",
      "/me:Bearer new-access",
      "/garage/current:Bearer new-access",
    ]);
  });

  it("never retries more than once", async () => {
    let calls = 0;
    globalThis.fetch = routeThrough(() => {
      calls += 1;
      return json(401, { message: "Expirado." });
    });
    putSession(SESSION);

    const error = await capture(apiRequest("/me", { token: "old-access" }));

    expect(error).toBeInstanceOf(ApiError);
    expect(renew).toHaveBeenCalledTimes(1);
    expect(calls).toBe(2);
  });

  it("does not renew when the request carried no token", async () => {
    let calls = 0;
    globalThis.fetch = routeThrough(() => {
      calls += 1;
      return json(401, { message: "Email ou senha incorretos." });
    });

    const error = await capture(
      apiRequest("/auth/login", { method: "POST", body: { email: "a@b.co" } })
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect(renew).not.toHaveBeenCalled();
    expect(calls).toBe(1);
    expect(drop).not.toHaveBeenCalled();
  });

  it("clears the session and surfaces the original 401 when renewal is rejected", async () => {
    renew.mockRejectedValue(new ApiError("Refresh rejeitado.", 400));
    let calls = 0;
    globalThis.fetch = routeThrough(() => {
      calls += 1;
      return json(401, { message: "Expirado." });
    });
    putSession(SESSION);

    const error = await capture(apiRequest("/me", { token: "old-access" }));

    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).message).toBe("Expirado.");
    expect(drop).toHaveBeenCalledTimes(1);
    expect(getSession()).toBeNull();
    expect(calls).toBe(1);
  });

  it("keeps the session when renewal times out", async () => {
    renew.mockRejectedValue(new ApiError("Tempo limite.", 408));
    globalThis.fetch = routeThrough(() => json(401, { message: "Expirado." }));
    putSession(SESSION);

    const error = await capture(apiRequest("/me", { token: "old-access" }));

    expect((error as ApiError).status).toBe(401);
    expect(drop).not.toHaveBeenCalled();
    expect(getSession()).toEqual(SESSION);
  });

  it("keeps the session when renewal fails with a server error", async () => {
    renew.mockRejectedValue(new ApiError("Erro interno.", 500));
    globalThis.fetch = routeThrough(() => json(401, { message: "Expirado." }));
    putSession(SESSION);

    await capture(apiRequest("/me", { token: "old-access" }));

    expect(drop).not.toHaveBeenCalled();
    expect(getSession()).toEqual(SESSION);
  });

  it("keeps the session when the network is down", async () => {
    renew.mockRejectedValue(new Error("Failed to fetch"));
    globalThis.fetch = routeThrough(() => json(401, { message: "Expirado." }));
    putSession(SESSION);

    await capture(apiRequest("/me", { token: "old-access" }));

    expect(drop).not.toHaveBeenCalled();
    expect(getSession()).toEqual(SESSION);
  });

  it("does not renew on 429", async () => {
    let calls = 0;
    globalThis.fetch = routeThrough(() => {
      calls += 1;
      return json(429, { message: "Muitas requisições.", retryAfter: 60 });
    });
    putSession(SESSION);

    const error = await capture(apiRequest("/me", { token: "old-access" }));

    expect((error as ApiError).status).toBe(429);
    expect((error as ApiError).retryAfter).toBe(60);
    expect(renew).not.toHaveBeenCalled();
    expect(calls).toBe(1);
  });

  it("does not renew on other 4xx", async () => {
    globalThis.fetch = routeThrough(() =>
      json(403, { message: "Verifique o e-mail." })
    );
    putSession(SESSION);

    const error = await capture(apiRequest("/me", { token: "old-access" }));

    expect((error as ApiError).status).toBe(403);
    expect(renew).not.toHaveBeenCalled();
    expect(getSession()).toEqual(SESSION);
  });

  it("does not renew when there is no session to renew", async () => {
    globalThis.fetch = routeThrough(() => json(401, { message: "Expirado." }));

    const error = await capture(apiRequest("/me", { token: "orphan-access" }));

    expect((error as ApiError).status).toBe(401);
    expect(renew).not.toHaveBeenCalled();
    expect(drop).not.toHaveBeenCalled();
  });
});
