export interface HighlightItem {
  id: string;
  title: string;
  imageKey: string;
  imageUrl?: string;
}

export interface HighlightsResponse {
  highlights: HighlightItem[];
}

export interface ContentDetail extends HighlightItem {
  category?: "guide" | "news";
  author?: string;
  publishedAt?: string;
  readingTime?: number;
  summary?: string;
  body: string[];
}

export interface ContentDetailResponse {
  content: ContentDetail;
}
