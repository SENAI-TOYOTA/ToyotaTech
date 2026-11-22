import { apiErrorMessage } from "@/services/api";
import { fetchHighlights } from "@/services/content";
import { HighlightItem } from "@/types/content";
import { useCallback, useEffect, useRef, useState } from "react";

interface HighlightsSnapshot {
  highlights: HighlightItem[];
  isLoading: boolean;
  error: string | null;
}

const initialSnapshot: HighlightsSnapshot = {
  highlights: [],
  isLoading: true,
  error: null,
};

export function useHighlights() {
  const [snapshot, setSnapshot] = useState<HighlightsSnapshot>(initialSnapshot);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async (force: boolean) => {
    setSnapshot((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const response = await fetchHighlights(force);
      if (isMounted.current) {
        setSnapshot({
          highlights: response.highlights,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      const message = apiErrorMessage(
        error,
        "Não foi possível carregar as novidades."
      );
      if (isMounted.current) {
        setSnapshot((current) => ({
          ...current,
          isLoading: false,
          error: message,
        }));
      }
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const reload = useCallback(() => {
    void load(true);
  }, [load]);

  return { ...snapshot, reload };
}
