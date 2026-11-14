import json
from typing import Any, Dict

import flows
from botocore.exceptions import ClientError

from common.cognito import COGNITO_CLIENT_ID
from common.ratelimit import enforce_rate_limit
from common.responses import ApiError, log_error, response

ROUTES = {
    "GET /profile": flows.read_profile,
    "PUT /profile": flows.save_profile,
    "GET /me": flows.me,
}


def _api_error_response(error: ApiError) -> Dict[str, Any]:
    headers = None
    retry_after = error.extra.get("retryAfter")
    if error.status_code == 429 and retry_after is not None:
        headers = {"Retry-After": str(retry_after)}
    return response(
        error.status_code, {"message": error.message, **error.extra}, headers
    )


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context

    if not COGNITO_CLIENT_ID:
        return response(500, {"message": "COGNITO_CLIENT_ID não configurado."})

    method = (event.get("requestContext", {}).get("http") or {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return response(204, {})

    route = ROUTES.get(f"{method} {path}")
    if route is None:
        return response(404, {"message": "Rota não encontrada."})

    source_ip = (event.get("requestContext", {}).get("http") or {}).get("sourceIp", "")
    if method == "PUT" and path == "/profile":
        try:
            enforce_rate_limit(source_ip, f"{method} {path}")
        except ApiError as error:
            return _api_error_response(error)
        except ClientError as error:
            log_error("Rate limit store error.", event=event, error=error)

    try:
        return response(200, route(event))
    except ApiError as error:
        return _api_error_response(error)
    except ClientError as error:
        log_error("Cognito error.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        log_error("Internal error.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
