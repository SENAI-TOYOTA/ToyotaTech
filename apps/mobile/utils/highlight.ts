import type { ImageSourcePropType } from "react-native";

import type { HighlightItem } from "@/types/content";

export const highlightImages: Record<string, ImageSourcePropType> = {
  "corolla-main": require("@/assets/images/corolla-main.jpg"),
  "corolla-side": require("@/assets/images/corolla-side.jpg"),
  "corolla-news": require("@/assets/images/corolla-news.jpg"),
  "yaris-cross": require("@/assets/images/yaris-cross.jpg"),
  "economia-hibrida": require("@/assets/images/economia-hibrida.jpg"),
  "toyota-safety-sense": require("@/assets/images/toyota-safety-sense.jpg"),
  "acessorios-originais": require("@/assets/images/acessorios-originais.jpg"),
  "servicos-toyota": require("@/assets/images/servicos-toyota.jpg"),
  "estilo-de-vida": require("@/assets/images/estilo-de-vida.jpg"),
};

export const highlightFallbackImage = highlightImages["corolla-news"];

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
