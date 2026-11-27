export type ContentType = "guide" | "news";
export type ContentSort = "recent" | "oldest";

export interface HighlightItem {
  id: string;
  title: string;
  imageKey: string;
  imageUrl?: string;
  categoryLabel?: string;
  description?: string;
  category?: ContentType;
  summary?: string;
  publishedAt?: string;
}

export interface HighlightsResponse {
  highlights: HighlightItem[];
}

export interface ContentPageResponse {
  highlights: HighlightItem[];
  hasMore: boolean;
  nextOffset: number | null;
  total: number;
  categories: string[];
}

export interface ContentListingParams {
  type?: ContentType;
  category?: string;
  query?: string;
  sort?: ContentSort;
  limit?: number;
  offset?: number;
}

export interface ContentDetail extends HighlightItem {
  author?: string;
  readingTime?: number;
  body: string[];
  sourceName?: string;
  sourceUrl?: string;
}

export interface ContentDetailResponse {
  content: ContentDetail;
}
