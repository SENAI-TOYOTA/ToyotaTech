import { resetGarageCache, useGarage } from "@/hooks/useGarage";
import { ApiError } from "@/services/api";
import { AuthUser } from "@/types/auth";
import { GarageData, GarageResponse } from "@/types/garage";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockFetchGarageCurrent =
  jest.fn<(token: string) => Promise<GarageResponse>>();
let mockAuthValue: { token: string | null; user: AuthUser | null } = {
  token: null,
  user: null,
};

jest.mock("@/services/garage", () => ({
  fetchGarageCurrent: (token: string) => mockFetchGarageCurrent(token),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

const garage = {
  userId: "user-1",
  order: {},
  vehicle: { model: "Corolla" },
  financing: {},
  documents: [],
  recalls: [],
  tracking: {},
} as unknown as GarageData;

function buildUser(sub: string): AuthUser {
  return {
    email: `${sub}@toyota.com`,
    name: "Julio",
    isVerified: true,
    sub,
    profileComplete: true,
  };
}

function mockAuth(token: string | null, user: AuthUser | null) {
  mockAuthValue = { token, user };
}

beforeEach(() => {
  mockFetchGarageCurrent.mockReset();
  resetGarageCache();
  mockAuth("token-1", buildUser("user-1"));
  mockFetchGarageCurrent.mockResolvedValue({ garage });
});

describe("useGarage", () => {
  it("deduplica a requisicao entre instancias simultaneas", async () => {
    const first = await renderHook(() => useGarage());
    const second = await renderHook(() => useGarage());

    await waitFor(() => {
      expect(first.result.current.garage).toEqual(garage);
      expect(second.result.current.garage).toEqual(garage);
    });

    expect(mockFetchGarageCurrent).toHaveBeenCalledTimes(1);
  });

  it("reaproveita o cache ao remontar o hook", async () => {
    const first = await renderHook(() => useGarage());
    await waitFor(() => expect(first.result.current.garage).toEqual(garage));
    await first.unmount();

    const second = await renderHook(() => useGarage());

    expect(second.result.current.garage).toEqual(garage);
    expect(second.result.current.isLoading).toBe(false);
    expect(mockFetchGarageCurrent).toHaveBeenCalledTimes(1);
  });

  it("nao refaz a busca quando o token e renovado na mesma sessao", async () => {
    const hook = await renderHook(() => useGarage());
    await waitFor(() => expect(hook.result.current.garage).toEqual(garage));

    mockAuth("token-2", buildUser("user-1"));
    await hook.rerender(undefined);

    expect(mockFetchGarageCurrent).toHaveBeenCalledTimes(1);
    expect(mockFetchGarageCurrent).toHaveBeenLastCalledWith("token-1");
  });

  it("limpa o cache no logout e busca de novo no proximo login", async () => {
    const hook = await renderHook(() => useGarage());
    await waitFor(() => expect(hook.result.current.garage).toEqual(garage));

    mockAuth(null, null);
    await hook.rerender(undefined);

    await waitFor(() => expect(hook.result.current.garage).toBeNull());

    mockAuth("token-3", buildUser("user-2"));
    await hook.rerender(undefined);

    await waitFor(() =>
      expect(mockFetchGarageCurrent).toHaveBeenLastCalledWith("token-3")
    );
    expect(mockFetchGarageCurrent).toHaveBeenCalledTimes(2);
  });

  it("ignora o cache quando reload e acionado", async () => {
    const hook = await renderHook(() => useGarage());
    await waitFor(() => expect(hook.result.current.garage).toEqual(garage));

    await act(async () => {
      await hook.result.current.reload();
    });

    await waitFor(() =>
      expect(mockFetchGarageCurrent).toHaveBeenCalledTimes(2)
    );
  });

  it("expoe mensagem de erro quando a busca falha", async () => {
    mockFetchGarageCurrent.mockRejectedValueOnce(new Error("offline"));

    const hook = await renderHook(() => useGarage());

    await waitFor(() =>
      expect(hook.result.current.error).toBe(
        "Não foi possível carregar os dados do veículo."
      )
    );
    expect(hook.result.current.isLoading).toBe(false);
  });

  it("expoe o retryAfter da resposta de limite de taxa", async () => {
    mockFetchGarageCurrent.mockRejectedValueOnce(
      new ApiError("Muitas requisições.", 429, 7)
    );

    const hook = await renderHook(() => useGarage());

    await waitFor(() =>
      expect(hook.result.current.error).toBe(
        "Muitas requisições. Tente novamente em 7s."
      )
    );
    expect(hook.result.current.isLoading).toBe(false);
  });

  it("traduz a mensagem conhecida da API antes de expor o limite", async () => {
    mockFetchGarageCurrent.mockRejectedValueOnce(
      new ApiError("Limit exceeded", 429, 5)
    );

    const hook = await renderHook(() => useGarage());

    await waitFor(() =>
      expect(hook.result.current.error).toBe(
        "Muitas requisições. Tente novamente mais tarde. Tente novamente em 5s."
      )
    );
  });

  it("omite o retry quando o limite chega sem retryAfter", async () => {
    mockFetchGarageCurrent.mockRejectedValueOnce(
      new ApiError("Resposta inválida da API.", 429)
    );

    const hook = await renderHook(() => useGarage());

    await waitFor(() =>
      expect(hook.result.current.error).toBe("Resposta inválida da API.")
    );
  });
});
