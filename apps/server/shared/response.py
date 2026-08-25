import json
from decimal import Decimal
from typing import Any, Dict, Optional


def response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    def json_default(value: Any) -> Any:
        if isinstance(value, Decimal):
            return int(value) if value % 1 == 0 else str(value)
        raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

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


def log_error(message: str, *, event: Optional[Dict[str, Any]] = None, error: Optional[Exception] = None) -> None:
    context = {}
    if event:
        request_context = event.get("requestContext", {})
        http_ctx = request_context.get("http", {})
        context = {
            "requestId": request_context.get("requestId"),
            "method": http_ctx.get("method"),
            "path": event.get("rawPath"),
            "sourceIp": http_ctx.get("sourceIp"),
        }
    payload = {
        "message": message,
        "context": context,
        "error": str(error) if error else None,
    }
    print(json.dumps(payload, ensure_ascii=False))


def parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    import base64

    body = event.get("body")
    if body is None:
        return {}
    if event.get("isBase64Encoded"):
        decoded = base64.b64decode(body).decode("utf-8")
        return json.loads(decoded) if decoded else {}
    return json.loads(body) if isinstance(body, str) and body else {}
