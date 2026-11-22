import { HighlightItem } from "@/types/content";
import { highlightImageSource } from "@/utils/highlight";
import { describe, expect, it } from "@jest/globals";

const images = {
  "corolla-main": 1,
  "corolla-side": 2,
};
const fallback = 3;

function buildHighlight(overrides: Partial<HighlightItem> = {}): HighlightItem {
  return {
    id: "highlight",
    title: "Novidade",
    imageKey: "corolla-main",
    ...overrides,
  };
}

describe("highlightImageSource", () => {
  it("prioriza a url remota quando informada", () => {
    const source = highlightImageSource(
      buildHighlight({ imageUrl: "https://example.com/highlight.jpg" }),
      images,
      fallback
    );

    expect(source).toEqual({ uri: "https://example.com/highlight.jpg" });
  });

  it("usa o asset local quando a chave existe", () => {
    const source = highlightImageSource(buildHighlight(), images, fallback);

    expect(source).toBe(1);
  });

  it("usa o fallback quando a chave nao existe", () => {
    const source = highlightImageSource(
      buildHighlight({ imageKey: "desconhecida" }),
      images,
      fallback
    );

    expect(source).toBe(3);
  });

  it("ignora url vazia e usa o asset local", () => {
    const source = highlightImageSource(
      buildHighlight({ imageUrl: "" }),
      images,
      fallback
    );

    expect(source).toBe(1);
  });
});
