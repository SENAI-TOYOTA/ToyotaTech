import { useHighlights } from "@/hooks/useHighlights";
import { ApiError } from "@/services/api";
import { HighlightsResponse } from "@/types/content";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockFetchHighlights =
  jest.fn<(force?: boolean) => Promise<HighlightsResponse>>();

jest.mock("@/services/content", () => ({
  fetchHighlights: (force?: boolean) => mockFetchHighlights(force),
}));

const payload: HighlightsResponse = {
  highlights: [
    { id: "corolla", title: "Corolla Altis", imageKey: "corolla-main" },
  ],
};

beforeEach(() => {
  mockFetchHighlights.mockReset();
});

describe("useHighlights", () => {
  it("expoe as novidades retornadas pela api", async () => {
    mockFetchHighlights.mockResolvedValue(payload);
    const hook = await renderHook(() => useHighlights());

    await waitFor(() =>
      expect(hook.result.current.highlights).toEqual(payload.highlights)
    );

    expect(hook.result.current.isLoading).toBe(false);
    expect(hook.result.current.error).toBeNull();
  });

  it("expoe estado vazio quando nao ha novidades", async () => {
    mockFetchHighlights.mockResolvedValue({ highlights: [] });
    const hook = await renderHook(() => useHighlights());

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(hook.result.current.highlights).toEqual([]);
    expect(hook.result.current.error).toBeNull();
  });

  it("expoe mensagem de erro quando a api falha", async () => {
    mockFetchHighlights.mockRejectedValue(new Error("offline"));
    const hook = await renderHook(() => useHighlights());

    await waitFor(() =>
      expect(hook.result.current.error).toBe(
        "Não foi possível carregar as novidades."
      )
    );

    expect(hook.result.current.isLoading).toBe(false);
  });

  it("expoe mensagem com retryafter quando a api responde 429", async () => {
    mockFetchHighlights.mockRejectedValue(
      new ApiError("Too many requests.", 429, 30)
    );
    const hook = await renderHook(() => useHighlights());

    await waitFor(() =>
      expect(hook.result.current.error).toContain("Tente novamente em 30s.")
    );

    expect(hook.result.current.isLoading).toBe(false);
  });

  it("nao dispara retry automatico apos o 429", async () => {
    mockFetchHighlights.mockRejectedValue(
      new ApiError("Too many requests.", 429, 30)
    );
    const hook = await renderHook(() => useHighlights());

    await waitFor(() => expect(hook.result.current.error).not.toBeNull());

    expect(mockFetchHighlights).toHaveBeenCalledTimes(1);
  });

  it("forca nova busca no reload", async () => {
    mockFetchHighlights.mockResolvedValue(payload);
    const hook = await renderHook(() => useHighlights());

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    await act(async () => {
      hook.result.current.reload();
    });

    await waitFor(() =>
      expect(mockFetchHighlights).toHaveBeenLastCalledWith(true)
    );
  });
});
