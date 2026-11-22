export interface HighlightItem {
  id: string;
  title: string;
  imageKey: string;
  imageUrl?: string;
}

export interface HighlightsResponse {
  highlights: HighlightItem[];
}
