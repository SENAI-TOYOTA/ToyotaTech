import hmac
import os
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from .responses import ApiError

INGEST_KEY_PARAMETER_NAME = os.environ.get("INGEST_KEY_PARAMETER_NAME", "").strip()
INGEST_KEY_HEADER = "x-ingest-key"

_cached_key: Optional[str] = None


def presented_ingest_key(event: Dict[str, Any]) -> str:
    headers = event.get("headers")
    if not isinstance(headers, dict):
        return ""
    for name, value in headers.items():
        if isinstance(name, str) and name.lower() == INGEST_KEY_HEADER:
            return value.strip() if isinstance(value, str) else ""
    return ""


def load_ingest_key() -> str:
    global _cached_key
    if _cached_key is not None:
        return _cached_key

    if not INGEST_KEY_PARAMETER_NAME:
        raise ApiError(500, "Parâmetro da chave de ingest não configurado.")

    try:
        response = boto3.client("ssm").get_parameter(
            Name=INGEST_KEY_PARAMETER_NAME, WithDecryption=True
        )
    except (BotoCoreError, ClientError) as error:
        raise ApiError(500, "Chave de ingest indisponível no SSM.") from error

    value = (response.get("Parameter", {}).get("Value") or "").strip()
    if not value:
        raise ApiError(500, "Chave de ingest vazia no SSM.")

    _cached_key = value
    return value


def require_ingest_key(event: Dict[str, Any]) -> None:
    expected = load_ingest_key()
    presented = presented_ingest_key(event)
    if not presented or not hmac.compare_digest(presented, expected):
        raise ApiError(401, "Chave de ingest inválida.")
