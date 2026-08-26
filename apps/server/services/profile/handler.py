import json
from typing import Any, Dict

from botocore.exceptions import ClientError

from common.cognito import COGNITO_CLIENT_ID
from common.responses import ApiError, log_error, response

from . import flows

ROUTES = {
    "GET /profile": flows.read_profile,
    "PUT /profile": flows.save_profile,
    "GET /me": flows.me,
}


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

    try:
        return response(200, route(event))
    except ApiError as error:
        return response(error.status_code, {"message": error.message, **error.extra})
    except ClientError as error:
        log_error("Erro Cognito.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        log_error("Erro interno.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
