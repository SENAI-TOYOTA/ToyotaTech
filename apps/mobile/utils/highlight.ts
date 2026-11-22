import type { ImageSourcePropType } from "react-native";

import type { HighlightItem } from "@/types/content";

export function highlightImageSource(
  highlight: HighlightItem,
  images: Record<string, ImageSourcePropType>,
  fallback: ImageSourcePropType
): ImageSourcePropType {
  if (highlight.imageUrl) {
    return { uri: highlight.imageUrl };
  }
  return images[highlight.imageKey] ?? fallback;
}
