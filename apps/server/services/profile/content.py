import os
from typing import Any, Dict, List
from urllib.parse import urlparse

import validation

from common.ddb import get_table

CONTENT_TABLE_NAME = os.environ.get("CONTENT_TABLE_NAME", "")
HIGHLIGHTS_KEY = "highlights"

DEFAULT_HIGHLIGHTS = [
    {"id": "corolla", "title": "Corolla Altis", "imageKey": "corolla-main"},
    {"id": "yaris", "title": "Yaris Cross", "imageKey": "corolla-side"},
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
