import json
from decimal import Decimal
from typing import Any, Dict, Protocol


class ClientErrorLike(Protocol):
    response: Dict[str, Any]


class ApiError(Exception):
    def __init__(
        self, status_code: int, message: str, extra: Dict[str, Any] | None = None
    ):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.extra = extra or {}


def response(
    status_code: int,
    body: Dict[str, Any],
    headers: Dict[str, str] | None = None,
) -> Dict[str, Any]:
    import os

    def json_default(value: Any) -> Any:
        if isinstance(value, Decimal):
            return int(value) if value % 1 == 0 else str(value)
        raise TypeError(
            f"Object of type {type(value).__name__} is not JSON serializable"
        )

    allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*")

    out_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
        "Access-Control-Expose-Headers": "Retry-After",
    }
    if headers:
        out_headers.update(headers)

    return {
        "statusCode": status_code,
        "headers": out_headers,
        "body": json.dumps(body, default=json_default, ensure_ascii=False),
    }


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    import base64

    body = event.get("body")
    if body is None:
        return {}
    if isinstance(body, dict):
        return body
    try:
        if event.get("isBase64Encoded"):
            decoded = base64.b64decode(body).decode("utf-8")
            return json.loads(decoded) if decoded else {}
        return json.loads(body) if isinstance(body, str) and body else {}
    except (
        ValueError,
        TypeError,
        json.JSONDecodeError,
        base64.binascii.Error,
    ) as error:
        raise ApiError(400, "Invalid request body.") from error


def _event_context(event: Dict[str, Any] | None) -> Dict[str, Any]:
    if not event:
        return {}
    http_ctx = (event.get("requestContext") or {}).get("http") or {}
    return {
        "requestId": (event.get("requestContext") or {}).get("requestId"),
        "method": http_ctx.get("method"),
        "path": event.get("rawPath"),
        "sourceIp": http_ctx.get("sourceIp"),
    }


def log_event(
    message: str,
    *,
    event: Dict[str, Any] | None = None,
    error: Exception | None = None,
    **extra: Any,
) -> None:
    context = _event_context(event)
    context.update(extra)
    print(
        json.dumps(
            {
                "message": message,
                "context": context,
                "error": str(error) if error else None,
            },
            ensure_ascii=False,
        )
    )


def log_error(
    message: str, *, event: Dict[str, Any] | None = None, error: Exception | None = None
) -> None:
    log_event(message, event=event, error=error)


def require(
    condition: bool, status_code: int, message: str, extra: Dict[str, Any] | None = None
) -> None:
    if not condition:
        raise ApiError(status_code, message, extra)


def error_body(error: ClientErrorLike) -> tuple[str, str]:
    payload = error.response.get("Error", {})
    return payload.get("Code", "Unknown"), payload.get("Message", "Unknown error.")
