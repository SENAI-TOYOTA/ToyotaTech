import { XMLParser } from "fast-xml-parser";
import { Platform } from "react-native";

import { NewsItem } from "@/types/news";

const NEWS_RSS_URL = "https://pt.motor1.com/rss/category/toyota/";

const FETCH_URL = Platform.OS === "web" 
  ? `https://corsproxy.io/?${encodeURIComponent(NEWS_RSS_URL)}` 
  : NEWS_RSS_URL;

const parser = new XMLParser({
  ignoreAttributes: false,
});

function normalizeNewsItems(items: unknown): NewsItem[] {
  if (!items) {
    return [];
  }
  const list = Array.isArray(items) ? items : [items];
  return list
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const entry = item as {
        title?: string;
        link?: string;
        pubDate?: string;
        guid?: { "#text"?: string } | string;
        source?: { "#text"?: string } | string;
      };
      const id =
        (typeof entry.guid === "string" ? entry.guid : entry.guid?.["#text"]) ||
        entry.link ||
        `${entry.title ?? "news"}-${index}`;
      const source =
        (typeof entry.source === "string" ? entry.source : entry.source?.["#text"]) ||
        "Motor1";

      if (!entry.title || !entry.link) {
        return null;
      }
      return {
        id,
        title: entry.title,
        link: entry.link,
        source,
        publishedAt: entry.pubDate ?? "",
      };
    })
    .filter((item): item is NewsItem => Boolean(item));
}

export async function fetchNews(limit = 6): Promise<NewsItem[]> {
  const response = await fetch(FETCH_URL);
  if (!response.ok) {
    throw new Error("Falha ao carregar noticias.");
  }

  const xml = await response.text();
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: unknown } };
  };
  const items = normalizeNewsItems(parsed?.rss?.channel?.item);
  return items.slice(0, limit);
}
