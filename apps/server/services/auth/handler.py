import json
from typing import Any, Dict

import flows
from botocore.exceptions import ClientError
from federation import pre_sign_up

from common.cognito import COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID
from common.ratelimit import enforce_rate_limit
from common.responses import (
    ApiError,
    error_body,
    log_error,
    parse_body,
    response,
)

ROUTES = {
    "POST /auth/check-email": lambda event: flows.check_email(parse_body(event)),
    "POST /auth/register": lambda event: flows.register(parse_body(event)),
    "POST /auth/login": lambda event: flows.login(parse_body(event)),
    "POST /auth/verify-email": lambda event: flows.verify_email(parse_body(event)),
    "POST /auth/resend-verification": lambda event: flows.resend_verification(
        parse_body(event)
    ),
    "POST /auth/refresh": lambda event: flows.refresh(parse_body(event)),
    "POST /auth/set-password": flows.set_password,
}

ROUTE_STATUS = {
    "POST /auth/register": 201,
}

THROTTLING_CODES = ("LimitExceededException", "TooManyRequestsException")


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context

    trigger_source = event.get("triggerSource", "")
    if isinstance(trigger_source, str) and trigger_source.startswith("PreSignUp_"):
        return pre_sign_up(event)

    config_error = _validate_config()
    if config_error:
        return response(500, {"message": config_error})

    method = (event.get("requestContext", {}).get("http") or {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return response(204, {})

    route = ROUTES.get(f"{method} {path}")
    if route is None:
        return response(404, {"message": "Rota não encontrada."})

    source_ip = (event.get("requestContext", {}).get("http") or {}).get("sourceIp", "")
    try:
        enforce_rate_limit(source_ip, f"{method} {path}")
    except ApiError as error:
        return _api_error_response(error)
    except ClientError as error:
        log_error("Rate limit store error.", event=event, error=error)

    try:
        body = route(event)
        return response(ROUTE_STATUS.get(f"{method} {path}", 200), body)
    except ApiError as error:
        return _api_error_response(error)
    except ClientError as error:
        code, _ = error_body(error)
        if code in THROTTLING_CODES:
            return response(
                429,
                {"message": "Muitas requisições.", "retryAfter": 60},
                headers={"Retry-After": "60"},
            )
        log_error("Cognito error.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        log_error("Internal error.", event=event, error=error)
        return response(500, {"message": "Erro interno."})


def _api_error_response(error: ApiError) -> Dict[str, Any]:
    headers = None
    retry_after = error.extra.get("retryAfter")
    if error.status_code == 429 and retry_after is not None:
        headers = {"Retry-After": str(retry_after)}
    return response(
        error.status_code, {"message": error.message, **error.extra}, headers
    )


def _validate_config() -> str | None:
    try:
        _require_pool()
        _require_client()
        return None
    except ValueError as error:
        return str(error)


def _require_pool() -> None:
    if not COGNITO_USER_POOL_ID:
        raise ValueError("COGNITO_USER_POOL_ID não configurado.")


def _require_client() -> None:
    if not COGNITO_CLIENT_ID:
        raise ValueError("COGNITO_CLIENT_ID não configurado.")
