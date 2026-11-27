import json
import os
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import urlparse

import validation

from common.ddb import get_table
from common.responses import ApiError

CONTENT_TABLE_NAME = os.environ.get("CONTENT_TABLE_NAME", "")
HIGHLIGHTS_KEY = "highlights"
CONTENT_SEED_PATH = Path(__file__).with_name("content_seed.json")

DEFAULT_HIGHLIGHTS = json.loads(CONTENT_SEED_PATH.read_text(encoding="utf-8"))


def _normalize_highlights(value: Any) -> List[Dict[str, str]]:
    if not isinstance(value, list):
        return []

    highlights = []
    for item in value:
        if not isinstance(item, dict):
            continue
        content_id = validation.coerce_text(item.get("id"))
        title = validation.coerce_text(item.get("title"))
        image_key = validation.coerce_text(item.get("imageKey"))
        image_url = validation.coerce_text(item.get("imageUrl"))
        category_label = validation.coerce_text(item.get("categoryLabel"))
        description = validation.coerce_text(item.get("description"))
        category = validation.coerce_text(item.get("category"))
        summary = validation.coerce_text(item.get("summary"))
        published_at = validation.coerce_text(item.get("publishedAt"))
        if not (content_id and title and image_key):
            continue
        highlight = {"id": content_id, "title": title, "imageKey": image_key}
        if category_label:
            highlight["categoryLabel"] = category_label
        if description:
            highlight["description"] = description
        if category in ("guide", "news"):
            highlight["category"] = category
        if summary:
            highlight["summary"] = summary
        if published_at:
            highlight["publishedAt"] = published_at
        safe_image_url = _safe_https_url(image_url)
        if safe_image_url:
            highlight["imageUrl"] = safe_image_url
        highlights.append(highlight)
    return highlights


def _safe_https_url(value: Any) -> str | None:
    text = validation.coerce_text(value)
    if not text:
        return None
    try:
        parsed = urlparse(text)
    except ValueError:
        return None
    if parsed.scheme == "https" and parsed.netloc:
        return text
    return None


def _normalize_detail(value: Any, content_id: str) -> Dict[str, Any] | None:
    if not isinstance(value, list):
        return None

    for item in value:
        if not isinstance(item, dict):
            continue
        item_id = validation.coerce_text(item.get("id"))
        if item_id != content_id:
            continue
        title = validation.coerce_text(item.get("title"))
        image_key = validation.coerce_text(item.get("imageKey"))
        if not (item_id and title and image_key):
            return None

        detail: Dict[str, Any] = {
            "id": item_id,
            "title": title,
            "imageKey": image_key,
        }
        safe_image_url = _safe_https_url(item.get("imageUrl"))
        if safe_image_url:
            detail["imageUrl"] = safe_image_url

        category = validation.coerce_text(item.get("category"))
        if category in ("guide", "news"):
            detail["category"] = category
        author = validation.coerce_text(item.get("author"))
        if author:
            detail["author"] = author
        published_at = validation.coerce_text(item.get("publishedAt"))
        if published_at:
            detail["publishedAt"] = published_at
        reading_time = validation.coerce_text(item.get("readingTime"))
        if reading_time.isdigit():
            detail["readingTime"] = int(reading_time)
        summary = validation.coerce_text(item.get("summary"))
        if summary:
            detail["summary"] = summary
        source_name = validation.coerce_text(item.get("sourceName"))
        if source_name:
            detail["sourceName"] = source_name
        safe_source_url = _safe_https_url(item.get("sourceUrl"))
        if safe_source_url:
            detail["sourceUrl"] = safe_source_url

        body = item.get("body")
        paragraphs = []
        if isinstance(body, list):
            for paragraph in body:
                text = validation.coerce_text(paragraph)
                if text:
                    paragraphs.append(text)
        detail["body"] = paragraphs
        return detail
    return None


def get_content_detail(event: Dict[str, Any], content_id: str) -> Dict[str, Any]:
    _ = event
    table = get_table(CONTENT_TABLE_NAME)
    item = table.get_item(Key={"pk": HIGHLIGHTS_KEY}).get("Item") or {}
    stored = item.get("highlights")
    highlights = DEFAULT_HIGHLIGHTS if stored is None else stored
    detail = _normalize_detail(highlights, content_id)
    if detail is None:
        raise ApiError(404, "Conteúdo não encontrado.")
    return {"content": detail}


def _parse_pagination(event: Dict[str, Any]) -> tuple:
    params = event.get("queryStringParameters") or {}
    if not isinstance(params, dict):
        return None, 0
    limit_value = validation.coerce_text(params.get("limit"))
    offset_value = validation.coerce_text(params.get("offset"))
    limit = int(limit_value) if limit_value.isdigit() else None
    offset = int(offset_value) if offset_value.isdigit() else 0
    return limit, offset


def _normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", value)
    return (
        "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
        .lower()
        .strip()
    )


def _published_date(value: Any) -> datetime | None:
    text = validation.coerce_text(value)
    if not text:
        return None
    try:
        return datetime.strptime(text, "%d/%m/%Y")
    except ValueError:
        return None


def _matches_query(highlight: Dict[str, str], query: str) -> bool:
    for field in ("title", "summary"):
        if query in _normalize_text(highlight.get(field, "")):
            return True
    return False


def _available_categories(highlights: List[Dict[str, str]]) -> List[str]:
    categories = []
    for highlight in highlights:
        label = highlight.get("categoryLabel")
        if label and label not in categories:
            categories.append(label)
    return categories


def _sort_highlights(
    highlights: List[Dict[str, str]], sort: str
) -> List[Dict[str, str]]:
    dated = [
        highlight
        for highlight in highlights
        if _published_date(highlight.get("publishedAt")) is not None
    ]
    undated = [
        highlight
        for highlight in highlights
        if _published_date(highlight.get("publishedAt")) is None
    ]
    dated.sort(
        key=lambda highlight: _published_date(highlight.get("publishedAt")),
        reverse=sort != "oldest",
    )
    return dated + undated


def _parse_filters(event: Dict[str, Any]) -> tuple:
    params = event.get("queryStringParameters") or {}
    if not isinstance(params, dict):
        return None, None, None, "recent"
    content_type = validation.coerce_text(params.get("type")).lower()
    if content_type not in ("guide", "news"):
        content_type = None
    category = validation.coerce_text(params.get("category"))
    query = _normalize_text(validation.coerce_text(params.get("q")))
    sort = validation.coerce_text(params.get("sort")).lower()
    if sort not in ("recent", "oldest"):
        sort = "recent"
    return content_type, category or None, query or None, sort


def get_highlights(event: Dict[str, Any]) -> Dict[str, Any]:
    table = get_table(CONTENT_TABLE_NAME)
    item = table.get_item(Key={"pk": HIGHLIGHTS_KEY}).get("Item") or {}
    stored = item.get("highlights")
    if stored is None:
        highlights = _normalize_highlights(DEFAULT_HIGHLIGHTS)
    else:
        highlights = _normalize_highlights(stored)

    content_type, category, query, sort = _parse_filters(event)
    if content_type:
        highlights = [
            highlight
            for highlight in highlights
            if highlight.get("category") == content_type
        ]
    if query:
        highlights = [
            highlight for highlight in highlights if _matches_query(highlight, query)
        ]

    categories = _available_categories(highlights)

    if category:
        normalized_category = _normalize_text(category)
        highlights = [
            highlight
            for highlight in highlights
            if _normalize_text(highlight.get("categoryLabel", ""))
            == normalized_category
        ]

    highlights = _sort_highlights(highlights, sort)

    limit, offset = _parse_pagination(event)
    if limit is None:
        return {"highlights": highlights[offset:]}

    total = len(highlights)
    page = highlights[offset:][:limit]
    has_more = limit > 0 and offset + len(page) < total
    return {
        "highlights": page,
        "hasMore": has_more,
        "nextOffset": offset + len(page) if has_more else None,
        "total": total,
        "categories": categories,
    }
