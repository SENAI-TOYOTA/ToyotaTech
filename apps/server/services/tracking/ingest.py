import re
import unicodedata
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from common.responses import require

from . import store

TRACKING_FLOW_STEPS = [
    {"id": "1", "label": "Inicio da producao"},
    {"id": "2", "label": "Montagem finalizada"},
    {"id": "3", "label": "Teste de qualidade"},
    {"id": "4", "label": "Em transporte"},
    {"id": "5", "label": "Concessionaria"},
    {"id": "6", "label": "Pronto para retirada"},
]

TRACKING_STAGE_ALIASES = {
    0: {"inicio_da_producao", "producao_iniciada", "inicio", "start", "production_start", "prep", "estamparia"},
    1: {"pintura", "montagem_finalizada", "paint", "painting", "coating", "assembly", "assembly_line"},
    2: {"processo_de_montagem", "teste_de_qualidade", "montagem", "quality_test", "inspection"},
    3: {"aguardando_o_embarque", "em_transporte", "embarque", "transporte", "in_transit", "shipping", "dispatch"},
    4: {"concessionaria", "em_concessionaria", "yard", "logistics", "dealer", "handover"},
    5: {"saiu_para_entrega", "pronto_para_retirada", "entrega", "delivery", "delivered", "pickup_ready"},
}

TRACKING_FIELDS = (
    "chassi",
    "vehicleId",
    "vin",
    "currentStepIndex",
    "stepIndex",
    "progress",
    "stage",
    "phase",
    "status",
    "eventTime",
    "timestamp",
    "history",
    "timestamps",
    "state",
    "tags",
    "fields",
    "measurement",
)


def coerce_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def slugify_tracking_token(value: Any) -> str:
    text = coerce_text(value).lower()
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", normalized).strip("_")


def parse_tracking_int(value: Any) -> Optional[int]:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    text = coerce_text(value)
    if not text:
        return None
    if text.isdigit() or (text.startswith("-") and text[1:].isdigit()):
        return int(text)
    match = re.search(r"-?\d+", text)
    if match:
        try:
            return int(match.group(0))
        except ValueError:
            return None
    try:
        return int(float(text))
    except (TypeError, ValueError):
        return None


def format_tracking_date(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        dt = datetime.fromtimestamp(float(value), tz=timezone.utc)
        return dt.strftime("%d/%m/%Y")
    raw = coerce_text(value)
    if not raw:
        return ""

    normalized = raw.replace("Z", "+00:00")
    for candidate in (normalized, raw):
        try:
            dt = datetime.fromisoformat(candidate)
            return dt.strftime("%d/%m/%Y")
        except ValueError:
            continue

    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            dt = datetime.strptime(raw, fmt)
            return dt.strftime("%d/%m/%Y")
        except ValueError:
            continue
    return ""


def resolve_step_index(payload: Dict[str, Any], fallback: int = 0) -> int:
    direct_keys = ("currentStepIndex", "stepIndex", "currentStageIndex", "progressStep")
    for key in direct_keys:
        parsed = parse_tracking_int(payload.get(key))
        if parsed is not None:
            return max(0, min(parsed, len(TRACKING_FLOW_STEPS) - 1))

    raw_progress = parse_tracking_int(payload.get("progress"))
    if raw_progress is not None:
        if raw_progress <= 0:
            return 0
        if raw_progress >= 100:
            return len(TRACKING_FLOW_STEPS) - 1
        bucket = int((raw_progress / 100) * len(TRACKING_FLOW_STEPS))
        return max(0, min(bucket, len(TRACKING_FLOW_STEPS) - 1))

    stage_candidates = (
        payload.get("stage"),
        payload.get("status"),
        payload.get("phase"),
        payload.get("lineState"),
        payload.get("station"),
        payload.get("eventType"),
    )
    for candidate in stage_candidates:
        token = slugify_tracking_token(candidate)
        if not token:
            continue
        for index, aliases in TRACKING_STAGE_ALIASES.items():
            if token in aliases:
                return index

    if fallback < 0:
        return -1
    return max(0, min(fallback, len(TRACKING_FLOW_STEPS) - 1))


def extract_step_dates(payload: Dict[str, Any]) -> Dict[int, str]:
    step_dates: Dict[int, str] = {}
    history = payload.get("history")
    if isinstance(history, list):
        for item in history:
            if not isinstance(item, dict):
                continue
            index = resolve_step_index(item, fallback=-1)
            if index < 0:
                continue
            date_value = (
                item.get("date")
                or item.get("timestamp")
                or item.get("eventTime")
                or item.get("updatedAt")
            )
            formatted = format_tracking_date(date_value)
            if formatted:
                step_dates[index] = formatted

    timestamps = payload.get("timestamps")
    if isinstance(timestamps, dict):
        for key, value in timestamps.items():
            index = None
            parsed_key = parse_tracking_int(key)
            if parsed_key is not None:
                index = max(0, min(parsed_key, len(TRACKING_FLOW_STEPS) - 1))
            else:
                token = slugify_tracking_token(key)
                for candidate_index, aliases in TRACKING_STAGE_ALIASES.items():
                    if token in aliases:
                        index = candidate_index
                        break
            if index is None:
                continue
            formatted = format_tracking_date(value)
            if formatted:
                step_dates[index] = formatted

    return step_dates


def extract_iot_tracking_payload(event: Any) -> Optional[Dict[str, Any]]:
    """Detecta invocação direta de IoT/fábrica.

    Eventos HTTP do API Gateway sempre têm ``requestContext`` e triggers do
    Cognito têm ``triggerSource``; nesses casos retorna None para o evento ser
    tratado pelo roteamento normal. Invocações diretas (regras IoT, Step
    Functions) sem esses campos são reconhecidas como payloads de tracking.
    """
    if not isinstance(event, dict):
        return None
    if event.get("requestContext") or event.get("triggerSource"):
        return None

    payload = event
    if isinstance(event.get("payload"), dict):
        payload = event["payload"]
    elif isinstance(event.get("detail"), dict):
        payload = event["detail"]
    elif isinstance(event.get("state"), dict):
        state = event["state"]
        if isinstance(state.get("reported"), dict):
            payload = state["reported"]
        elif isinstance(state.get("desired"), dict):
            payload = state["desired"]
        else:
            payload = state

    if any(key in payload for key in TRACKING_FIELDS):
        return coerce_iot_tracking_payload(payload)
    return None


def coerce_iot_tracking_payload(payload: Any) -> Optional[Dict[str, Any]]:
    """Achata variações de payload IoT (tags/fields/time) num dicionário plano."""
    if not isinstance(payload, dict):
        return None

    flattened = dict(payload)
    tags = payload.get("tags")
    if isinstance(tags, dict):
        flattened["chassi"] = coerce_text(flattened.get("chassi") or tags.get("chassi"))
        flattened["stage"] = coerce_text(flattened.get("stage") or tags.get("etapa"))
        flattened["status"] = coerce_text(flattened.get("status") or tags.get("status"))

    fields = payload.get("fields")
    if isinstance(fields, dict):
        if "posicao_linha" in fields and flattened.get("currentStepIndex") in (None, ""):
            flattened["currentStepIndex"] = fields.get("posicao_linha")
        if "tempo_total" in fields and flattened.get("duration") in (None, ""):
            flattened["duration"] = fields.get("tempo_total")
        if "falha" in fields and flattened.get("fault") in (None, ""):
            flattened["fault"] = fields.get("falha")
        if "retrabalho" in fields and flattened.get("rework") in (None, ""):
            flattened["rework"] = fields.get("retrabalho")

    if payload.get("time") and not flattened.get("eventTime"):
        flattened["eventTime"] = payload.get("time")

    return flattened


def normalize_factory_tracking(payload: Dict[str, Any], garage: Dict[str, Any]) -> Dict[str, Any]:
    base_tracking = garage.get("tracking") if isinstance(garage.get("tracking"), dict) else {}
    base_vehicle = garage.get("vehicle") if isinstance(garage.get("vehicle"), dict) else {}

    vehicle_id = coerce_text(
        payload.get("vehicleId")
        or payload.get("chassi")
        or payload.get("vin")
        or base_tracking.get("vehicleId")
        or base_vehicle.get("vehicleId")
        or base_vehicle.get("chassi")
    )
    model = coerce_text(
        payload.get("model")
        or base_tracking.get("model")
        or base_vehicle.get("model")
    )
    version = coerce_text(
        payload.get("version")
        or base_tracking.get("version")
        or base_vehicle.get("version")
    )
    color = coerce_text(payload.get("color") or base_tracking.get("color") or base_vehicle.get("color"))
    year = coerce_text(payload.get("year") or base_tracking.get("year") or base_vehicle.get("year"))
    engine = coerce_text(
        payload.get("engine")
        or payload.get("powertrain")
        or base_tracking.get("engine")
        or base_vehicle.get("engine")
    )

    current_step_index = resolve_step_index(
        payload, fallback=parse_tracking_int(base_tracking.get("currentStepIndex")) or 0
    )
    step_dates = extract_step_dates(payload)
    event_date = format_tracking_date(
        payload.get("eventTime")
        or payload.get("timestamp")
        or payload.get("lastUpdate")
        or payload.get("measuredAt")
    )

    steps = []
    for index, template in enumerate(TRACKING_FLOW_STEPS):
        step = dict(template)
        if index < current_step_index:
            step["status"] = "completed"
        elif index == current_step_index:
            step["status"] = "current"
        else:
            step["status"] = "pending"

        date_value = step_dates.get(index)
        if not date_value and index == current_step_index:
            date_value = event_date
        if date_value:
            step["date"] = date_value
        steps.append(step)

    return {
        "vehicleId": vehicle_id,
        "model": model,
        "version": version,
        "color": color,
        "year": year,
        "engine": engine,
        "currentStepIndex": current_step_index,
        "steps": steps,
    }


def process_ingest(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Processa um evento de tracking da fábrica e grava na TrackingTable."""
    vehicle_ref = coerce_text(
        payload.get("chassi")
        or payload.get("vehicleId")
        or payload.get("vin")
    )
    require(bool(vehicle_ref), 400, "Tracking sem identificador do veículo.")

    garage = store.find_garage_by_chassi(vehicle_ref)
    require(isinstance(garage, dict), 404, "Veículo não vinculado.")

    tracking = normalize_factory_tracking(payload, garage)
    vehicle_id = tracking.get("vehicleId") or vehicle_ref
    stage = coerce_text(payload.get("stage"))
    status = coerce_text(payload.get("status"))
    store.save_event(vehicle_id, payload, stage, status)
    return {"tracking": tracking}
