import { apiErrorMessage } from "@/services/api";
import { fetchContentPage } from "@/services/content";
import type {
  ContentListingParams,
  ContentSort,
  HighlightItem,
} from "@/types/content";
import { useCallback, useEffect, useRef, useState } from "react";

export const CONTENT_PAGE_SIZE = 4;

interface ContentListingFilters {
  type?: ContentListingParams["type"];
  category?: string;
  query?: string;
  sort: ContentSort;
}

interface ContentListingSnapshot {
  highlights: HighlightItem[];
  categories: string[];
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const initialSnapshot: ContentListingSnapshot = {
  highlights: [],
  categories: [],
  total: 0,
  hasMore: false,
  nextOffset: null,
  isLoading: true,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
};

export function useContentListing({
  type,
  category,
  query,
  sort,
}: ContentListingFilters) {
  const [snapshot, setSnapshot] =
    useState<ContentListingSnapshot>(initialSnapshot);
  const requestId = useRef(0);
  const isLoadingMore = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadFirstPage = useCallback(
    async (mode: "initial" | "refresh") => {
      const currentRequest = requestId.current + 1;
      requestId.current = currentRequest;
      isLoadingMore.current = false;
      setSnapshot((current) => ({
        ...current,
        highlights: mode === "initial" ? [] : current.highlights,
        isLoading: mode === "initial",
        isRefreshing: mode === "refresh",
        isLoadingMore: false,
        error: null,
      }));

      try {
        const response = await fetchContentPage(
          { type, category, query, sort, limit: CONTENT_PAGE_SIZE, offset: 0 },
          mode === "refresh"
        );
        if (!isMounted.current || requestId.current !== currentRequest) {
          return;
        }
        setSnapshot({
          highlights: response.highlights,
          categories: response.categories,
          total: response.total,
          hasMore: response.hasMore,
          nextOffset: response.nextOffset,
          isLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted.current || requestId.current !== currentRequest) {
          return;
        }
        setSnapshot((current) => ({
          ...current,
          isLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          error: apiErrorMessage(
            error,
            "Não foi possível carregar os guias e notícias."
          ),
        }));
      }
    },
    [type, category, query, sort]
  );

  useEffect(() => {
    void loadFirstPage("initial");
  }, [loadFirstPage]);

  const reload = useCallback(() => {
    void loadFirstPage("refresh");
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (
      isLoadingMore.current ||
      snapshot.isLoading ||
      snapshot.isRefreshing ||
      !snapshot.hasMore ||
      snapshot.nextOffset === null
    ) {
      return;
    }

    isLoadingMore.current = true;
    const currentRequest = requestId.current;
    setSnapshot((current) => ({
      ...current,
      isLoadingMore: true,
      error: null,
    }));

    try {
      const response = await fetchContentPage(
        {
          type,
          category,
          query,
          sort,
          limit: CONTENT_PAGE_SIZE,
          offset: snapshot.nextOffset,
        },
        false
      );
      if (!isMounted.current || requestId.current !== currentRequest) {
        return;
      }
      setSnapshot((current) => {
        const existing = new Set(current.highlights.map((item) => item.id));
        const appended = response.highlights.filter(
          (item) => !existing.has(item.id)
        );
        return {
          ...current,
          highlights: [...current.highlights, ...appended],
          categories: response.categories,
          total: response.total,
          hasMore: response.hasMore,
          nextOffset: response.nextOffset,
          isLoadingMore: false,
          error: null,
        };
      });
    } catch (error) {
      if (!isMounted.current || requestId.current !== currentRequest) {
        return;
      }
      setSnapshot((current) => ({
        ...current,
        isLoadingMore: false,
        error: apiErrorMessage(
          error,
          "Não foi possível carregar mais guias e notícias."
        ),
      }));
    } finally {
      isLoadingMore.current = false;
    }
  }, [snapshot, type, category, query, sort]);

  return { ...snapshot, reload, loadMore };
}
