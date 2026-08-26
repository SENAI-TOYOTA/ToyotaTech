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


def response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    def json_default(value: Any) -> Any:
        if isinstance(value, Decimal):
            return int(value) if value % 1 == 0 else str(value)
        raise TypeError(
            f"Object of type {type(value).__name__} is not JSON serializable"
        )

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
        },
        "body": json.dumps(body, default=json_default, ensure_ascii=False),
    }


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    import base64

    body = event.get("body")
    if body is None:
        return {}
    if isinstance(body, dict):
        return body
    if event.get("isBase64Encoded"):
        decoded = base64.b64decode(body).decode("utf-8")
        return json.loads(decoded) if decoded else {}
    return json.loads(body) if isinstance(body, str) and body else {}


def log_error(
    message: str, *, event: Dict[str, Any] | None = None, error: Exception | None = None
) -> None:
    context = {}
    if event:
        http_ctx = (event.get("requestContext") or {}).get("http") or {}
        context = {
            "requestId": (event.get("requestContext") or {}).get("requestId"),
            "method": http_ctx.get("method"),
            "path": event.get("rawPath"),
            "sourceIp": http_ctx.get("sourceIp"),
        }
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


def require(
    condition: bool, status_code: int, message: str, extra: Dict[str, Any] | None = None
) -> None:
    if not condition:
        raise ApiError(status_code, message, extra)


def error_body(error: ClientErrorLike) -> tuple[str, str]:
    payload = error.response.get("Error", {})
    return payload.get("Code", "Unknown"), payload.get("Message", "Erro desconhecido.")
