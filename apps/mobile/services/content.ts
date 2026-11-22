import { apiRequest } from "@/services/api";
import { HighlightsResponse } from "@/types/content";

const HIGHLIGHTS_CACHE_TTL_MS = 60_000;

let cachedHighlights: HighlightsResponse | null = null;
let cachedAt = 0;
let inflightHighlights: Promise<HighlightsResponse> | null = null;

export async function fetchHighlights(force = false) {
  if (
    !force &&
    cachedHighlights &&
    Date.now() - cachedAt < HIGHLIGHTS_CACHE_TTL_MS
  ) {
    return cachedHighlights;
  }

  if (inflightHighlights) {
    return inflightHighlights;
  }

  const request = apiRequest<HighlightsResponse>("/content/highlights", {
    method: "GET",
  })
    .then((response) => {
      cachedHighlights = response;
      cachedAt = Date.now();
      return response;
    })
    .finally(() => {
      if (inflightHighlights === request) {
        inflightHighlights = null;
      }
    });

  inflightHighlights = request;
  return request;
}

export function resetHighlightsCache() {
  cachedHighlights = null;
  cachedAt = 0;
  inflightHighlights = null;
}
