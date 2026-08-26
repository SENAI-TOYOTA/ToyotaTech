import json
from typing import Any, Dict

from botocore.exceptions import ClientError

from common.cognito import build_user, extract_token, get_user_by_access_token
from common.cognito_users import link_federated_if_needed
from common.responses import (
    ApiError,
    error_body,
    log_error,
    parse_body,
    require,
    response,
)

from . import ingest, store


def authenticated_user(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = extract_token(event)
    require(bool(access_token), 401, "Token não informado.")

    try:
        cognito_user = get_user_by_access_token(access_token)
        link_federated_if_needed(cognito_user)
        return build_user(cognito_user)
    except ClientError as error:
        code, _ = error_body(error)
        if code == "NotAuthorizedException":
            raise ApiError(401, "Sessão inválida ou expirada.")
        raise


def read_status(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    user_id = user.get("sub")
    require(
        isinstance(user_id, str) and bool(user_id),
        500,
        "Usuário sem identificador válido.",
    )

    garage = store.get_garage(user_id)
    require(bool(garage), 404, "Veículo não vinculado.")

    tracking = (
        garage.get("tracking") if isinstance(garage.get("tracking"), dict) else {}
    )
    base_vehicle = (
        garage.get("vehicle") if isinstance(garage.get("vehicle"), dict) else {}
    )
    vehicle_id = ingest.coerce_text(
        tracking.get("vehicleId") or base_vehicle.get("chassi") or garage.get("chassi")
    )

    event_item = store.latest_event(vehicle_id)
    if event_item:
        received_at = int(event_item.get("receivedAt") or 0)
        tracking_updated_at = int(garage.get("trackingUpdatedAt") or 0)
        if received_at >= tracking_updated_at:
            tracking = ingest.normalize_factory_tracking(
                event_item.get("payload") or {}, garage
            )

    return {"tracking": tracking}


def receive_ingest(event: Dict[str, Any]) -> Dict[str, Any]:
    """Rota explícita POST /garage/ingest para payloads IoT/fábrica via HTTP.

    No monolito o ingest era detectado implicitamente pela ausência de
    ``requestContext``; aqui o remetente HTTP publica diretamente nesta rota,
    sem autenticação. Invocações diretas (sem requestContext) continuam
    reconhecidas pelo atalho IoT no lambda_handler.
    """
    payload = ingest.coerce_iot_tracking_payload(parse_body(event))
    require(bool(payload), 400, "Payload de tracking inválido.")
    return ingest.process_ingest(payload)


ROUTES = {
    "GET /garage/status": read_status,
    "POST /garage/ingest": receive_ingest,
}


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context

    config_error = _validate_config()
    if config_error:
        return response(500, {"message": config_error})

    try:
        iot_payload = ingest.extract_iot_tracking_payload(event)
        if iot_payload is not None:
            return response(200, ingest.process_ingest(iot_payload))

        method = (event.get("requestContext", {}).get("http") or {}).get("method", "")
        path = event.get("rawPath", "")

        if method == "OPTIONS":
            return response(204, {})

        route = ROUTES.get(f"{method} {path}")
        if route is None:
            return response(404, {"message": "Rota não encontrada."})

        return response(200, route(event))
    except ApiError as error:
        return response(error.status_code, {"message": error.message, **error.extra})
    except ClientError as error:
        log_error("Erro DynamoDB.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        log_error("Erro interno.", event=event, error=error)
        return response(500, {"message": "Erro interno."})


def _validate_config() -> str | None:
    if not store.TRACKING_TABLE_NAME:
        return "TRACKING_TABLE_NAME não configurado."
    if not store.GARAGE_TABLE_NAME:
        return "GARAGE_TABLE_NAME não configurado."
    return None
