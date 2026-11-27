import { apiRequest } from "@/services/api";
import {
  ContentDetailResponse,
  ContentListingParams,
  ContentPageResponse,
  HighlightsResponse,
} from "@/types/content";

const CONTENT_CACHE_TTL_MS = 60_000;

let cachedHighlights: HighlightsResponse | null = null;
let cachedAt = 0;
let inflightHighlights: Promise<HighlightsResponse> | null = null;
const inflightDetails = new Map<string, Promise<ContentDetailResponse>>();
const cachedPages = new Map<
  string,
  { response: ContentPageResponse; cachedAt: number }
>();
const inflightPages = new Map<string, Promise<ContentPageResponse>>();

function buildPageQuery(params: ContentListingParams) {
  const entries: string[] = [];
  if (params.type) {
    entries.push(`type=${encodeURIComponent(params.type)}`);
  }
  if (params.category) {
    entries.push(`category=${encodeURIComponent(params.category)}`);
  }
  if (params.query) {
    entries.push(`q=${encodeURIComponent(params.query)}`);
  }
  if (params.sort) {
    entries.push(`sort=${encodeURIComponent(params.sort)}`);
  }
  if (params.limit !== undefined) {
    entries.push(`limit=${params.limit}`);
  }
  if (params.offset !== undefined) {
    entries.push(`offset=${params.offset}`);
  }
  return entries.length ? `?${entries.join("&")}` : "";
}

export async function fetchHighlights(force = false) {
  if (
    !force &&
    cachedHighlights &&
    Date.now() - cachedAt < CONTENT_CACHE_TTL_MS
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

export async function fetchContentPage(
  params: ContentListingParams,
  force = false
) {
  const query = buildPageQuery(params);
  if (!force) {
    const cached = cachedPages.get(query);
    if (cached && Date.now() - cached.cachedAt < CONTENT_CACHE_TTL_MS) {
      return cached.response;
    }
  }

  const inflight = inflightPages.get(query);
  if (inflight) {
    return inflight;
  }

  const request = apiRequest<ContentPageResponse>(
    `/content/highlights${query}`,
    { method: "GET" }
  )
    .then((response) => {
      cachedPages.set(query, { response, cachedAt: Date.now() });
      return response;
    })
    .finally(() => {
      if (inflightPages.get(query) === request) {
        inflightPages.delete(query);
      }
    });

  inflightPages.set(query, request);
  return request;
}

export async function fetchContentDetail(id: string) {
  const inflight = inflightDetails.get(id);
  if (inflight) {
    return inflight;
  }

  const request = apiRequest<ContentDetailResponse>(
    `/content/highlights/${encodeURIComponent(id)}`,
    { method: "GET" }
  ).finally(() => {
    if (inflightDetails.get(id) === request) {
      inflightDetails.delete(id);
    }
  });

  inflightDetails.set(id, request);
  return request;
}

export function resetHighlightsCache() {
  cachedHighlights = null;
  cachedAt = 0;
  inflightHighlights = null;
  inflightDetails.clear();
}

export function resetContentListingCache() {
  cachedPages.clear();
  inflightPages.clear();
}
