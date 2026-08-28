import json
from typing import Any, Dict

from botocore.exceptions import ClientError

from common.auth import authenticated_user
from common.responses import (
    ApiError,
    log_error,
    parse_body,
    require,
    response,
)
from common.validation import coerce_text

from . import ingest, store


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
    vehicle_id = coerce_text(
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
        log_error("DynamoDB error.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        log_error("Internal error.", event=event, error=error)
        return response(500, {"message": "Erro interno."})


def _validate_config() -> str | None:
    if not store.TRACKING_TABLE_NAME:
        return "TRACKING_TABLE_NAME não configurado."
    if not store.GARAGE_TABLE_NAME:
        return "GARAGE_TABLE_NAME não configurado."
    return None
