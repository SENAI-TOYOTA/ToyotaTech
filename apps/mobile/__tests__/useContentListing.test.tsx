import {
  CONTENT_PAGE_SIZE,
  useContentListing,
} from "@/hooks/useContentListing";
import { ApiError } from "@/services/api";
import type {
  ContentListingParams,
  ContentPageResponse,
  ContentType,
  HighlightItem,
} from "@/types/content";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockFetchContentPage =
  jest.fn<
    (
      params: ContentListingParams,
      force?: boolean
    ) => Promise<ContentPageResponse>
  >();

jest.mock("@/services/content", () => ({
  fetchContentPage: (params: ContentListingParams, force?: boolean) =>
    mockFetchContentPage(params, force),
}));

const corolla: HighlightItem = {
  id: "corolla",
  title: "Corolla Altis",
  imageKey: "corolla-main",
  categoryLabel: "LANÇAMENTO",
};
const yaris: HighlightItem = {
  id: "yaris",
  title: "Yaris Cross",
  imageKey: "yaris-cross",
  categoryLabel: "SUV COMPACTO",
};
const servicos: HighlightItem = {
  id: "servicos",
  title: "Serviços Toyota",
  imageKey: "servicos-toyota",
  categoryLabel: "SERVIÇOS",
};

const firstPage: ContentPageResponse = {
  highlights: [corolla, yaris],
  categories: ["LANÇAMENTO", "SUV COMPACTO"],
  total: 3,
  hasMore: true,
  nextOffset: 2,
};

const secondPage: ContentPageResponse = {
  highlights: [yaris, servicos],
  categories: ["LANÇAMENTO", "SUV COMPACTO", "SERVIÇOS"],
  total: 3,
  hasMore: false,
  nextOffset: null,
};

beforeEach(() => {
  mockFetchContentPage.mockReset();
});

describe("useContentListing", () => {
  it("carrega a primeira pagina com paginacao", async () => {
    mockFetchContentPage.mockResolvedValue(firstPage);
    const hook = await renderHook(() => useContentListing({ sort: "recent" }));

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    expect(mockFetchContentPage).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "recent",
        limit: CONTENT_PAGE_SIZE,
        offset: 0,
      }),
      false
    );
    expect(hook.result.current.highlights).toEqual(firstPage.highlights);
    expect(hook.result.current.categories).toEqual(firstPage.categories);
    expect(hook.result.current.total).toBe(3);
    expect(hook.result.current.hasMore).toBe(true);
    expect(hook.result.current.nextOffset).toBe(2);
    expect(hook.result.current.error).toBeNull();
  });

  it("anexa a proxima pagina sem duplicar itens", async () => {
    mockFetchContentPage
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);
    const hook = await renderHook(() => useContentListing({ sort: "recent" }));

    await waitFor(() => expect(hook.result.current.hasMore).toBe(true));

    await act(async () => {
      await hook.result.current.loadMore();
    });

    await waitFor(() =>
      expect(hook.result.current.highlights.map((item) => item.id)).toEqual([
        "corolla",
        "yaris",
        "servicos",
      ])
    );
    expect(mockFetchContentPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 2, limit: CONTENT_PAGE_SIZE }),
      false
    );
    expect(hook.result.current.hasMore).toBe(false);
    expect(hook.result.current.isLoadingMore).toBe(false);
  });

  it("nao busca mais quando o fim da lista foi atingido", async () => {
    mockFetchContentPage.mockResolvedValue({ ...firstPage, hasMore: false });
    const hook = await renderHook(() => useContentListing({ sort: "recent" }));

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    await act(async () => {
      await hook.result.current.loadMore();
    });

    expect(mockFetchContentPage).toHaveBeenCalledTimes(1);
  });

  it("refaz a primeira pagina quando o tipo muda", async () => {
    mockFetchContentPage.mockResolvedValue(firstPage);
    const hook = await renderHook(
      ({ type }: { type?: ContentType }) =>
        useContentListing({ type, sort: "recent" }),
      { initialProps: { type: undefined } }
    );

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    await act(async () => {
      hook.rerender({ type: "guide" });
    });

    await waitFor(() =>
      expect(mockFetchContentPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: "guide", offset: 0 }),
        false
      )
    );
  });

  it("expoe mensagem de erro quando a api falha", async () => {
    mockFetchContentPage.mockRejectedValue(
      new ApiError("Too many requests.", 429, 30)
    );
    const hook = await renderHook(() => useContentListing({ sort: "recent" }));

    await waitFor(() =>
      expect(hook.result.current.error).toContain("Tente novamente em 30s.")
    );

    expect(hook.result.current.isLoading).toBe(false);
  });

  it("forca nova busca no reload", async () => {
    mockFetchContentPage.mockResolvedValue(firstPage);
    const hook = await renderHook(() => useContentListing({ sort: "recent" }));

    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));

    await act(async () => {
      hook.result.current.reload();
    });

    await waitFor(() =>
      expect(mockFetchContentPage).toHaveBeenLastCalledWith(
        expect.objectContaining({ offset: 0 }),
        true
      )
    );
  });
});
