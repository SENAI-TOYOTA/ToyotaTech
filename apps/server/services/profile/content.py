import os
from typing import Any, Dict, List
from urllib.parse import urlparse

import validation

from common.ddb import get_table
from common.responses import ApiError

CONTENT_TABLE_NAME = os.environ.get("CONTENT_TABLE_NAME", "")
HIGHLIGHTS_KEY = "highlights"

DEFAULT_HIGHLIGHTS = [
    {"id": "corolla", "title": "Corolla Altis", "imageKey": "corolla-main"},
    {"id": "yaris", "title": "Yaris Cross", "imageKey": "yaris-cross"},
    {"id": "services", "title": "Serviços Toyota", "imageKey": "corolla-news"},
    {"id": "lifestyle", "title": "Estilo de vida", "imageKey": "corolla-main"},
]


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
        if not (content_id and title and image_key):
            continue
        highlight = {"id": content_id, "title": title, "imageKey": image_key}
        if image_url:
            try:
                parsed_image = urlparse(image_url)
            except ValueError:
                parsed_image = None
            if (
                parsed_image is not None
                and parsed_image.scheme == "https"
                and parsed_image.netloc
            ):
                highlight["imageUrl"] = image_url
        highlights.append(highlight)
    return highlights


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
        image_url = validation.coerce_text(item.get("imageUrl"))
        if image_url:
            try:
                parsed_image = urlparse(image_url)
            except ValueError:
                parsed_image = None
            if (
                parsed_image is not None
                and parsed_image.scheme == "https"
                and parsed_image.netloc
            ):
                detail["imageUrl"] = image_url

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
    detail = _normalize_detail(item.get("highlights"), content_id)
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


def get_highlights(event: Dict[str, Any]) -> Dict[str, Any]:
    table = get_table(CONTENT_TABLE_NAME)
    item = table.get_item(Key={"pk": HIGHLIGHTS_KEY}).get("Item") or {}
    stored = item.get("highlights")
    if stored is None:
        highlights = DEFAULT_HIGHLIGHTS
    else:
        highlights = _normalize_highlights(stored)

    limit, offset = _parse_pagination(event)
    if limit is None:
        highlights = highlights[offset:]
    else:
        highlights = highlights[offset:][:limit]
    return {"highlights": highlights}
