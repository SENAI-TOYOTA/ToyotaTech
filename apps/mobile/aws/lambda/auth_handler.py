import base64
import hashlib
import json
import os
import re
import time
import unicodedata
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr, Key


COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "").strip()
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "").strip()
PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()
GARAGE_TABLE_NAME = os.environ.get("GARAGE_TABLE_NAME", "").strip()
PURCHASE_TABLE_NAME = os.environ.get("PURCHASE_TABLE_NAME", "").strip()
COGNITO_REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))
cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
dynamodb_resource = boto3.resource("dynamodb", region_name=COGNITO_REGION)


def _response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
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
        "body": json.dumps(body, default=json_default),
    }


def _validate_config() -> Optional[Dict[str, Any]]:
    if not COGNITO_USER_POOL_ID:
        return _response(500, {"message": "COGNITO_USER_POOL_ID nao configurado."})
    if not COGNITO_CLIENT_ID:
        return _response(500, {"message": "COGNITO_CLIENT_ID nao configurado."})
    if not PROFILE_TABLE_NAME:
        return _response(500, {"message": "PROFILE_TABLE_NAME nao configurado."})
    if not GARAGE_TABLE_NAME:
        return _response(500, {"message": "GARAGE_TABLE_NAME nao configurado."})
    return None


def _log_error(message: str, *, event: Optional[Dict[str, Any]] = None, error: Optional[Exception] = None) -> None:
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


def _parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    body = event.get("body")
    if body is None:
        return {}
    if event.get("isBase64Encoded"):
        decoded = base64.b64decode(body).decode("utf-8")
        return json.loads(decoded) if decoded else {}
    return json.loads(body) if isinstance(body, str) and body else {}


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _extract_token(event: Dict[str, Any]) -> Optional[str]:
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization")
    if not auth_header:
        return None
    prefix = "bearer "
    if auth_header.lower().startswith(prefix):
        return auth_header[len(prefix) :].strip()
    return None


def _map_client_error(error: ClientError) -> Dict[str, str]:
    payload = error.response.get("Error", {})
    return {
        "code": payload.get("Code", "Unknown"),
        "message": payload.get("Message", "Erro desconhecido."),
    }


def _parse_user_attributes(user_attributes: Any) -> Dict[str, str]:
    parsed: Dict[str, str] = {}
    if not isinstance(user_attributes, list):
        return parsed
    for item in user_attributes:
        if not isinstance(item, dict):
            continue
        name = item.get("Name")
        value = item.get("Value")
        if isinstance(name, str) and isinstance(value, str):
            parsed[name] = value
    return parsed


def _build_auth_user(user_data: Dict[str, Any], fallback_email: str = "") -> Dict[str, Any]:
    attrs = _parse_user_attributes(user_data.get("UserAttributes", []))
    email = attrs.get("email") or fallback_email
    if not email and isinstance(user_data.get("Username"), str):
        email = user_data["Username"]
    name = attrs.get("name") or ""
    is_verified = attrs.get("email_verified", "false").strip().lower() == "true"

    user: Dict[str, Any] = {
        "email": email,
        "name": name,
        "isVerified": is_verified,
    }
    if "sub" in attrs:
        user["sub"] = attrs["sub"]
    return user


def _get_user_attributes(user_data: Dict[str, Any]) -> list[Dict[str, Any]]:
    attrs = user_data.get("UserAttributes")
    if isinstance(attrs, list):
        return attrs
    attrs = user_data.get("Attributes")
    if isinstance(attrs, list):
        return attrs
    return []


def _user_matches_email(user: Dict[str, Any], target_email: str) -> bool:
    attrs = _parse_user_attributes(_get_user_attributes(user))
    email = _normalize_email(attrs.get("email", ""))
    if email and email == target_email:
        return True
    username = user.get("Username")
    return isinstance(username, str) and _normalize_email(username) == target_email


def _scan_users_by_email(target_email: str, *, max_pages: int = 10) -> list[Dict[str, Any]]:
    matches: list[Dict[str, Any]] = []
    token: Optional[str] = None
    pages = 0
    while pages < max_pages:
        pages += 1
        params: Dict[str, Any] = {
            "UserPoolId": COGNITO_USER_POOL_ID,
            "Limit": 60,
        }
        if token:
            params["PaginationToken"] = token
        result = cognito_client.list_users(**params)
        users = result.get("Users", [])
        for user in users:
            if _user_matches_email(user, target_email):
                matches.append(user)
        if matches:
            return matches
        token = result.get("PaginationToken")
        if not token:
            break
    return matches


def _list_users_by_email(email: str) -> list[Dict[str, Any]]:
    normalized_email = _normalize_email(email)
    users_by_username: Dict[str, Dict[str, Any]] = {}

    def add_user(user: Dict[str, Any]) -> None:
        username = user.get("Username")
        if not isinstance(username, str) or not username:
            return
        if _user_matches_email(user, normalized_email):
            users_by_username[username] = user

    try:
        admin_user = cognito_client.admin_get_user(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=normalized_email,
        )
        if admin_user:
            add_user(admin_user)
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] != "UserNotFoundException":
            raise

    result = cognito_client.list_users(
        UserPoolId=COGNITO_USER_POOL_ID,
        Filter=f'email = "{normalized_email}"',
        Limit=10,
    )
    for user in result.get("Users", []):
        add_user(user)

    for user in _scan_users_by_email(normalized_email):
        add_user(user)

    return list(users_by_username.values())


def _is_federated_user(user_data: Dict[str, Any]) -> bool:
    status = str(user_data.get("UserStatus", "") or "")
    if status == "EXTERNAL_PROVIDER":
        return True
    username = user_data.get("Username")
    return isinstance(username, str) and username.lower().startswith("google_")


def _extract_provider_identity(attrs: Dict[str, str]) -> Optional[Dict[str, str]]:
    identities_raw = attrs.get("identities")
    if not identities_raw:
        return None
    try:
        identities = json.loads(identities_raw)
    except (TypeError, ValueError):
        return None
    if not isinstance(identities, list) or not identities:
        return None
    identity = identities[0]
    if not isinstance(identity, dict):
        return None
    provider_name = identity.get("providerName")
    provider_user_id = identity.get("userId")
    if not isinstance(provider_name, str) or not isinstance(provider_user_id, str):
        return None
    return {"providerName": provider_name, "providerUserId": provider_user_id}


def _find_local_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    for user in _list_users_by_email(email):
        if not _is_federated_user(user):
            return user
    return None


def _link_federated_user_if_needed(user_data: Dict[str, Any]) -> None:
    attrs = _parse_user_attributes(user_data.get("UserAttributes", []))
    email = _normalize_email(attrs.get("email", ""))
    if not email:
        return
    identity = _extract_provider_identity(attrs)
    if not identity or identity["providerName"] != "Google":
        return
    local_user = _find_local_user_by_email(email)
    if not local_user:
        return
    local_username = local_user.get("Username")
    if not isinstance(local_username, str):
        return
    federated_username = user_data.get("Username")
    if isinstance(federated_username, str) and federated_username == local_username:
        return
    try:
        cognito_client.admin_link_provider_for_user(
            UserPoolId=COGNITO_USER_POOL_ID,
            DestinationUser={
                "ProviderName": "Cognito",
                "ProviderAttributeName": "Cognito_Subject",
                "ProviderAttributeValue": local_username,
            },
            SourceUser={
                "ProviderName": identity["providerName"],
                "ProviderAttributeName": "Cognito_Subject",
                "ProviderAttributeValue": identity["providerUserId"],
            },
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] in (
            "ResourceNotFoundException",
            "ResourceConflictException",
            "AliasExistsException",
            "InvalidParameterException",
        ):
            print("Aviso: falha ao vincular IdP:", detail)
            return
        raise


def _parse_provider_username(username: str) -> Optional[Dict[str, str]]:
    if "_" not in username:
        return None
    provider_name, provider_user_id = username.split("_", 1)
    if not provider_name or not provider_user_id:
        return None
    return {"providerName": provider_name, "providerUserId": provider_user_id}


def _link_provider_to_local_user(
    local_user: Dict[str, Any],
    provider_name: str,
    provider_user_id: str,
) -> None:
    local_username = local_user.get("Username")
    if not isinstance(local_username, str) or not local_username:
        raise ValueError("Usuario local sem Username valido.")

    cognito_client.admin_link_provider_for_user(
        UserPoolId=COGNITO_USER_POOL_ID,
        DestinationUser={
            "ProviderName": "Cognito",
            "ProviderAttributeName": "Cognito_Subject",
            "ProviderAttributeValue": local_username,
        },
        SourceUser={
            "ProviderName": provider_name,
            "ProviderAttributeName": "Cognito_Subject",
            "ProviderAttributeValue": provider_user_id,
        },
    )


def _handle_pre_sign_up(event: Dict[str, Any]) -> Dict[str, Any]:
    trigger_source = event.get("triggerSource")
    request = event.get("request") or {}
    response = event.setdefault("response", {})
    user_attributes = request.get("userAttributes") or {}
    email = _normalize_email(str(user_attributes.get("email", "")))

    if not email or "@" not in email:
        return event

    users = _list_users_by_email(email)

    if trigger_source == "PreSignUp_SignUp":
        if users:
            raise ValueError("Usuario ja cadastrado com este e-mail.")
        return event

    if trigger_source != "PreSignUp_ExternalProvider":
        return event

    local_user = next((user for user in users if not _is_federated_user(user)), None)
    if not local_user:
        return event

    provider_identity = _parse_provider_username(str(event.get("userName", "")))
    if not provider_identity:
        return event

    try:
        _link_provider_to_local_user(
            local_user,
            provider_identity["providerName"],
            provider_identity["providerUserId"],
        )
        response["autoConfirmUser"] = True
        response["autoVerifyEmail"] = True
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "ResourceConflictException":
            return event
        _log_error("Falha ao vincular provedor no PreSignUp.", event=event, error=error)
        raise

    return event


def _get_profile_table():
    if not PROFILE_TABLE_NAME:
        raise ValueError("PROFILE_TABLE_NAME nao configurado.")
    return dynamodb_resource.Table(PROFILE_TABLE_NAME)


def _normalize_profile(item: Dict[str, Any]) -> Dict[str, str]:
    return {
        "fullName": str(item.get("fullName", "") or ""),
        "birthDate": str(item.get("birthDate", "") or ""),
    }


def _get_profile(user_id: str) -> Dict[str, str]:
    table = _get_profile_table()
    result = table.get_item(Key={"userId": user_id})
    item = result.get("Item") or {}
    return _normalize_profile(item)


def _merge_profile_defaults(profile: Dict[str, str], user: Dict[str, Any]) -> Dict[str, str]:
    return dict(profile)


def _update_profile_item(user_id: str, profile: Dict[str, str]) -> None:
    table = _get_profile_table()
    table.put_item(
        Item={
            "userId": user_id,
            "fullName": profile.get("fullName", ""),
            "birthDate": profile.get("birthDate", ""),
            "updatedAt": int(time.time()),
        }
    )


def _get_garage_table():
    if not GARAGE_TABLE_NAME:
        raise ValueError("GARAGE_TABLE_NAME nao configurado.")
    return dynamodb_resource.Table(GARAGE_TABLE_NAME)


def _get_purchase_table():
    if not PURCHASE_TABLE_NAME:
        raise ValueError("PURCHASE_TABLE_NAME nao configurado.")
    return dynamodb_resource.Table(PURCHASE_TABLE_NAME)


def _coerce_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _query_single_item(table: Any, index_name: str, key_name: str, key_value: str) -> Optional[Dict[str, Any]]:
    if not key_value:
        return None
    try:
        result = table.query(
            IndexName=index_name,
            KeyConditionExpression=Key(key_name).eq(key_value),
            Limit=1,
        )
        items = result.get("Items", [])
        return items[0] if items else None
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] not in {"ValidationException", "ResourceNotFoundException"}:
            raise
    try:
        result = table.scan(FilterExpression=Attr(key_name).eq(key_value), Limit=1)
        items = result.get("Items", [])
        return items[0] if items else None
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] not in {"ValidationException", "ResourceNotFoundException"}:
            raise
    return None


def _find_purchase_by_purchase_id(purchase_id: str) -> Optional[Dict[str, Any]]:
    table = _get_purchase_table()
    try:
        result = table.get_item(Key={"purchaseId": purchase_id})
        return result.get("Item")
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] not in {"ValidationException", "ResourceNotFoundException"}:
            raise
    return None


def _find_purchase_by_order_id(order_id: str) -> Optional[Dict[str, Any]]:
    table = _get_purchase_table()
    return _query_single_item(table, "orderId-index", "orderId", order_id)


def _find_purchase_by_email(email: str) -> Optional[Dict[str, Any]]:
    normalized_email = _normalize_email(email)
    if not normalized_email:
        return None

    table = _get_purchase_table()
    try:
        return _query_single_item(table, "email-index", "email", normalized_email)
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] not in {"ValidationException", "ResourceNotFoundException"}:
            raise
    return None


def _find_linked_purchase_for_user(user_id: str) -> Optional[Dict[str, Any]]:
    table = _get_purchase_table()
    return _query_single_item(table, "userId-index", "userId", user_id)


def _attach_purchase_to_user(purchase: Dict[str, Any], user_id: str) -> Optional[Dict[str, Any]]:
    purchase_id = _coerce_text(purchase.get("purchaseId"))
    if not purchase_id:
        return None

    existing_user_id = _coerce_text(purchase.get("userId"))
    if existing_user_id and existing_user_id != user_id:
        return None

    table = _get_purchase_table()
    now = int(time.time())
    table.update_item(
        Key={"purchaseId": purchase_id},
        UpdateExpression="SET userId = :userId, linkedAt = :linkedAt, updatedAt = :updatedAt",
        ConditionExpression="attribute_not_exists(userId) OR userId = :userId",
        ExpressionAttributeValues={
            ":userId": user_id,
            ":linkedAt": now,
            ":updatedAt": now,
        },
    )

    linked_purchase = dict(purchase)
    linked_purchase["userId"] = user_id
    linked_purchase["linkedAt"] = now
    linked_purchase["updatedAt"] = now
    return linked_purchase


def _merge_purchase_source(purchase: Dict[str, Any]) -> Dict[str, Any]:
    source = dict(purchase)
    garage = source.get("garage")
    if isinstance(garage, dict):
        for key, value in garage.items():
            if source.get(key) in (None, "", [], {}):
                source[key] = value
    return source


def _project_garage_from_purchase(user: Dict[str, Any], purchase: Dict[str, Any]) -> Dict[str, Any]:
    source = _merge_purchase_source(purchase)
    garage = _build_demo_garage(user)
    now = int(time.time())

    order = source.get("order")
    if isinstance(order, dict):
        garage["order"].update(order)
    vehicle = source.get("vehicle")
    if isinstance(vehicle, dict):
        garage["vehicle"].update(vehicle)
    financing = source.get("financing")
    if isinstance(financing, dict):
        garage["financing"].update(financing)
    documents = source.get("documents")
    if isinstance(documents, list):
        garage["documents"] = documents
    recalls = source.get("recalls")
    if isinstance(recalls, list):
        garage["recalls"] = recalls
    tracking = source.get("tracking")
    if isinstance(tracking, dict):
        garage["tracking"] = tracking

    purchase_id = _coerce_text(source.get("purchaseId"))
    order_id = _coerce_text(
        source.get("orderId")
        or purchase_id
        or (order.get("orderId") if isinstance(order, dict) else "")
        or garage["order"].get("orderId")
    )
    if order_id:
        garage["order"]["orderId"] = order_id

    status = _coerce_text(source.get("status"))
    if status:
        garage["order"]["status"] = status
    purchase_date = _coerce_text(source.get("purchaseDate"))
    if purchase_date:
        garage["order"]["purchaseDate"] = purchase_date
    dealership = _coerce_text(source.get("dealership") or source.get("dealer"))
    if dealership:
        garage["order"]["dealership"] = dealership

    vehicle_id = _coerce_text(
        source.get("vehicleId")
        or source.get("chassi")
        or (vehicle.get("vehicleId") if isinstance(vehicle, dict) else "")
        or order_id
        or purchase_id
    )
    if vehicle_id:
        garage["vehicle"]["vehicleId"] = vehicle_id
    chassi = _coerce_text(source.get("chassi") or garage["vehicle"].get("chassi") or vehicle_id)
    if chassi:
        garage["vehicle"]["chassi"] = chassi
    if isinstance(tracking, dict):
        garage["tracking"].update(
            {
                "vehicleId": garage["vehicle"].get("vehicleId", ""),
                "chassi": garage["vehicle"].get("chassi", ""),
            }
        )

    created_at = source.get("createdAt")
    if isinstance(created_at, (int, float)):
        garage["createdAt"] = int(created_at)
    elif isinstance(created_at, str) and created_at.isdigit():
        garage["createdAt"] = int(created_at)
    else:
        garage["createdAt"] = now

    garage["userId"] = _coerce_text(user.get("sub"))
    garage["updatedAt"] = now
    return garage


def _build_demo_garage(user: Dict[str, Any]) -> Dict[str, Any]:
    user_id = str(user.get("sub", ""))
    chassi = _build_demo_chassi(user_id)
    now = int(time.time())
    order_id = f"TT-{chassi[-5:]}"

    vehicle = {
        "vehicleId": chassi,
        "model": "Toyota Corolla Altis",
        "version": "Hybrid 2025",
        "color": "Branco Perola",
        "year": "2025",
        "engine": "1.8 Hybrid",
        "chassi": chassi,
    }
    tracking_steps = [
        {"id": "1", "label": "Inicio da producao", "status": "completed", "date": "10/05/2026"},
        {"id": "2", "label": "Pintura", "status": "completed", "date": "12/05/2026"},
        {"id": "3", "label": "Processo de montagem", "status": "completed", "date": "15/05/2026"},
        {"id": "4", "label": "Aguardando o embarque", "status": "current"},
        {"id": "5", "label": "Em transito", "status": "pending"},
        {"id": "6", "label": "Saiu para entrega", "status": "pending"},
    ]

    return {
        "userId": user_id,
        "order": {
            "orderId": order_id,
            "status": "linked",
            "purchaseDate": "03/10/2025",
            "dealership": "Concessionaria Toyota",
        },
        "vehicle": vehicle,
        "financing": {
            "bank": "Banco Toyota do Brasil S.A",
            "paidInstallments": 30,
            "totalInstallments": 60,
            "installmentAmount": "R$ 2.480,00",
            "nextDueDate": "10/06/2026",
            "boletoAvailable": True,
        },
        "documents": [
            {"id": "invoice", "title": "Nota fiscal", "date": "03/10/2025", "status": "available"},
            {"id": "crlv", "title": "CRLV-e", "date": "03/10/2025", "status": "available"},
            {"id": "documents", "title": "Documentos", "date": "03/10/2025", "status": "available"},
            {"id": "manual", "title": "Manual do veiculo", "date": "03/10/2025", "status": "available"},
        ],
        "recalls": [],
        "tracking": {
            **vehicle,
            "currentStepIndex": 3,
            "steps": tracking_steps,
        },
        "createdAt": now,
        "updatedAt": now,
    }


def _build_demo_chassi(user_id: str) -> str:
    seed = _coerce_text(user_id) or "toyotatech"
    digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()
    slot = int(digest[:8], 16) % 10 + 1
    return f"CHASSI_{slot:05d}"


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


def _slugify_tracking_token(value: Any) -> str:
    text = _coerce_text(value).lower()
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", normalized).strip("_")


def _parse_tracking_int(value: Any) -> Optional[int]:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    text = _coerce_text(value)
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


def _format_tracking_date(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        dt = datetime.fromtimestamp(float(value), tz=timezone.utc)
        return dt.strftime("%d/%m/%Y")
    raw = _coerce_text(value)
    if not raw:
        return ""

    normalized = raw.replace("Z", "+00:00")
    for candidate in (
        normalized,
        raw,
    ):
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


def _resolve_tracking_step_index(payload: Dict[str, Any], fallback: int = 0) -> int:
    direct_keys = ("currentStepIndex", "stepIndex", "currentStageIndex", "progressStep")
    for key in direct_keys:
        parsed = _parse_tracking_int(payload.get(key))
        if parsed is not None:
            return max(0, min(parsed, len(TRACKING_FLOW_STEPS) - 1))

    raw_progress = _parse_tracking_int(payload.get("progress"))
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
        token = _slugify_tracking_token(candidate)
        if not token:
            continue
        for index, aliases in TRACKING_STAGE_ALIASES.items():
            if token in aliases:
                return index

    if fallback < 0:
        return -1
    return max(0, min(fallback, len(TRACKING_FLOW_STEPS) - 1))


def _extract_tracking_step_dates(payload: Dict[str, Any]) -> Dict[int, str]:
    step_dates: Dict[int, str] = {}
    history = payload.get("history")
    if isinstance(history, list):
        for item in history:
            if not isinstance(item, dict):
                continue
            index = _resolve_tracking_step_index(item, fallback=-1)
            if index < 0:
                continue
            date_value = (
                item.get("date")
                or item.get("timestamp")
                or item.get("eventTime")
                or item.get("updatedAt")
            )
            formatted = _format_tracking_date(date_value)
            if formatted:
                step_dates[index] = formatted

    timestamps = payload.get("timestamps")
    if isinstance(timestamps, dict):
        for key, value in timestamps.items():
            index = None
            parsed_key = _parse_tracking_int(key)
            if parsed_key is not None:
                index = max(0, min(parsed_key, len(TRACKING_FLOW_STEPS) - 1))
            else:
                token = _slugify_tracking_token(key)
                for candidate_index, aliases in TRACKING_STAGE_ALIASES.items():
                    if token in aliases:
                        index = candidate_index
                        break
            if index is None:
                continue
            formatted = _format_tracking_date(value)
            if formatted:
                step_dates[index] = formatted

    return step_dates


def _normalize_factory_tracking(payload: Dict[str, Any], garage: Dict[str, Any]) -> Dict[str, Any]:
    base_tracking = garage.get("tracking") if isinstance(garage.get("tracking"), dict) else {}
    base_vehicle = garage.get("vehicle") if isinstance(garage.get("vehicle"), dict) else {}

    vehicle_id = _coerce_text(
        payload.get("vehicleId")
        or payload.get("chassi")
        or payload.get("vin")
        or base_tracking.get("vehicleId")
        or base_vehicle.get("vehicleId")
        or base_vehicle.get("chassi")
    )
    model = _coerce_text(
        payload.get("model")
        or base_tracking.get("model")
        or base_vehicle.get("model")
    )
    version = _coerce_text(
        payload.get("version")
        or base_tracking.get("version")
        or base_vehicle.get("version")
    )
    color = _coerce_text(payload.get("color") or base_tracking.get("color") or base_vehicle.get("color"))
    year = _coerce_text(payload.get("year") or base_tracking.get("year") or base_vehicle.get("year"))
    engine = _coerce_text(
        payload.get("engine")
        or payload.get("powertrain")
        or base_tracking.get("engine")
        or base_vehicle.get("engine")
    )

    current_step_index = _resolve_tracking_step_index(payload, fallback=_parse_tracking_int(base_tracking.get("currentStepIndex")) or 0)
    step_dates = _extract_tracking_step_dates(payload)
    event_date = _format_tracking_date(
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


def _find_purchase_by_chassi(chassi: str) -> Optional[Dict[str, Any]]:
    table = _get_purchase_table()
    normalized = _coerce_text(chassi)
    if not normalized:
        return None
    try:
        purchase = _query_single_item(table, "chassi-index", "chassi", normalized)
        if purchase:
            return purchase
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] not in {"ValidationException", "ResourceNotFoundException"}:
            raise
    return None


def _find_garage_by_chassi(chassi: str) -> Optional[Dict[str, Any]]:
    table = _get_garage_table()
    normalized = _coerce_text(chassi)
    if not normalized:
        return None
    try:
        result = table.scan(FilterExpression=Attr("vehicle.chassi").eq(normalized), Limit=1)
        items = result.get("Items", [])
        if items:
            return items[0]
        result = table.scan(FilterExpression=Attr("chassi").eq(normalized), Limit=1)
        items = result.get("Items", [])
        return items[0] if items else None
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] not in {"ValidationException", "ResourceNotFoundException"}:
            raise
    return None


def _extract_iot_tracking_payload(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
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

    tracking_fields = (
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
    if any(key in payload for key in tracking_fields):
        return _coerce_iot_tracking_payload(payload)
    return None


def _coerce_iot_tracking_payload(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not isinstance(payload, dict):
        return None

    flattened = dict(payload)
    tags = payload.get("tags")
    if isinstance(tags, dict):
        flattened["chassi"] = _coerce_text(flattened.get("chassi") or tags.get("chassi"))
        flattened["stage"] = _coerce_text(flattened.get("stage") or tags.get("etapa"))
        flattened["status"] = _coerce_text(flattened.get("status") or tags.get("status"))

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


def _ingest_factory_tracking(payload: Dict[str, Any]) -> Dict[str, Any]:
    vehicle_ref = _coerce_text(
        payload.get("chassi")
        or payload.get("vehicleId")
        or payload.get("vin")
    )
    if not vehicle_ref:
        return _response(400, {"message": "Tracking sem identificador do veiculo."})

    purchase = _find_purchase_by_chassi(vehicle_ref)
    garage_table = _get_garage_table()
    garage = None
    user = None

    if purchase:
        user_id = _coerce_text(purchase.get("userId"))
        if user_id:
            user = {
                "sub": user_id,
                "email": _coerce_text(purchase.get("email")),
            }
            result = garage_table.get_item(Key={"userId": user_id})
            garage = result.get("Item")
            if not isinstance(garage, dict):
                garage = _project_garage_from_purchase(user, purchase)

    if not isinstance(garage, dict):
        garage = _find_garage_by_chassi(vehicle_ref)
        if not isinstance(garage, dict):
            return _response(404, {"message": "Veiculo nao vinculado."})

    if not isinstance(user, dict):
        user_id = _coerce_text(garage.get("userId"))
        user = {
            "sub": user_id,
            "email": _coerce_text(garage.get("customer", {}).get("email")) if isinstance(garage.get("customer"), dict) else "",
        }

    tracking = _normalize_factory_tracking(payload, garage)
    garage["tracking"] = tracking
    garage["trackingUpdatedAt"] = int(time.time())
    garage["updatedAt"] = int(time.time())
    garage_table.put_item(Item=garage)
    return _response(200, {"tracking": tracking})


def _garage_ingest(event: Dict[str, Any]) -> Dict[str, Any]:
    payload = _coerce_iot_tracking_payload(_parse_body(event))
    if not payload:
        return _response(400, {"message": "Payload de tracking invalido."})
    return _ingest_factory_tracking(payload)


def _build_demo_purchase(user: Dict[str, Any]) -> Dict[str, Any]:
    garage = _build_demo_garage(user)
    user_id = _coerce_text(user.get("sub"))
    chassi = garage["vehicle"]["chassi"]
    now = int(time.time())
    return {
        "purchaseId": f"demo-{chassi[-5:]}",
        "orderId": garage["order"]["orderId"],
        "email": _normalize_email(_coerce_text(user.get("email"))),
        "userId": user_id,
        "status": garage["order"]["status"],
        "purchaseDate": garage["order"]["purchaseDate"],
        "dealership": garage["order"]["dealership"],
        "vehicleId": chassi,
        "chassi": chassi,
        "order": garage["order"],
        "vehicle": garage["vehicle"],
        "financing": garage["financing"],
        "documents": garage["documents"],
        "recalls": garage["recalls"],
        "tracking": garage["tracking"],
        "garage": garage,
        "createdAt": now,
        "updatedAt": now,
        "linkedAt": now,
    }


def _seed_purchase_for_user(user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    table = _get_purchase_table()
    purchase = _build_demo_purchase(user)
    try:
        table.put_item(
            Item=purchase,
            ConditionExpression="attribute_not_exists(purchaseId)",
        )
        return purchase
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "ConditionalCheckFailedException":
            existing = _find_purchase_by_purchase_id(_coerce_text(purchase.get("purchaseId")))
            return existing
        if detail["code"] in {"ResourceNotFoundException", "AccessDeniedException", "ValidationException"}:
            return None
        raise


def _get_or_create_garage(user: Dict[str, Any]) -> Dict[str, Any]:
    user_id = user.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise ValueError("Usuario sem identificador valido.")

    table = _get_garage_table()
    result = table.get_item(Key={"userId": user_id})
    item = result.get("Item")
    if item:
        return item

    if PURCHASE_TABLE_NAME:
        try:
            purchase = _find_linked_purchase_for_user(user_id)
            if not purchase:
                purchase = _find_purchase_by_email(_coerce_text(user.get("email")))
        except (ClientError, ValueError):
            purchase = None
        if purchase:
            linked_purchase = _attach_purchase_to_user(purchase, user_id)
            if linked_purchase:
                garage = _project_garage_from_purchase(user, linked_purchase)
                table.put_item(Item=garage)
                return garage

        seeded_purchase = _seed_purchase_for_user(user)
        if seeded_purchase:
            linked_purchase = _attach_purchase_to_user(seeded_purchase, user_id) or seeded_purchase
            garage = _project_garage_from_purchase(user, linked_purchase)
            table.put_item(Item=garage)
            return garage

    garage = _build_demo_garage(user)
    try:
        table.put_item(
            Item=garage,
            ConditionExpression="attribute_not_exists(userId)",
        )
        return garage
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] != "ConditionalCheckFailedException":
            raise
        result = table.get_item(Key={"userId": user_id})
        item = result.get("Item")
        if item:
            return item
        raise


def _get_user_from_access_token(access_token: str, *, link_if_needed: bool = False) -> Dict[str, Any]:
    cognito_user = cognito_client.get_user(AccessToken=access_token)
    if link_if_needed:
        _link_federated_user_if_needed(cognito_user)
    return _build_auth_user(cognito_user)


def _build_password_auth_candidates(email: str, users: list[Dict[str, Any]]) -> list[str]:
    candidates: list[str] = [email]
    for user in users:
        username = user.get("Username")
        if isinstance(username, str) and username and username not in candidates:
            candidates.append(username)
    return candidates


def _initiate_password_auth(username: str, password: str) -> Dict[str, Any]:
    return cognito_client.initiate_auth(
        ClientId=COGNITO_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={"USERNAME": username, "PASSWORD": password},
    )


def _check_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})

    users = _list_users_by_email(email)
    if not users:
        return _response(200, {"exists": False, "nextRoute": "/register"})

    has_local = any(not _is_federated_user(user) for user in users)
    has_federated = any(_is_federated_user(user) for user in users)
    return _response(
        200,
        {
            "exists": True,
            "nextRoute": "/login",
            "isFederated": has_federated and not has_local,
        },
    )


def _register(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")
    name = (body.get("name", "") or "").strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if len(password) < 8:
        return _response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    if _list_users_by_email(email):
        return _response(409, {"message": "Usuario ja cadastrado."})

    attributes = [{"Name": "email", "Value": email}]
    if name:
        attributes.append({"Name": "name", "Value": name})

    try:
        sign_up = cognito_client.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=attributes,
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UsernameExistsException":
            return _response(409, {"message": "Usuario ja cadastrado."})
        if detail["code"] in ("InvalidPasswordException", "InvalidParameterException"):
            return _response(400, {"message": detail["message"]})
        raise

    return _response(
        201,
        {
            "message": "Usuario cadastrado. Verifique seu e-mail para concluir o acesso.",
            "requiresEmailVerification": not bool(sign_up.get("UserConfirmed")),
        },
    )


def _verify_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    verification_code = str(body.get("code", "")).strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if not verification_code:
        return _response(400, {"message": "Codigo de verificacao obrigatorio."})

    try:
        cognito_client.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            ConfirmationCode=verification_code,
        )
        return _response(200, {"message": "E-mail verificado com sucesso."})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "CodeMismatchException":
            return _response(400, {"message": "Codigo invalido."})
        if detail["code"] == "ExpiredCodeException":
            return _response(400, {"message": "Codigo expirado. Solicite novo codigo."})
        if detail["code"] == "UserNotFoundException":
            return _response(404, {"message": "Usuario nao encontrado."})
        if detail["code"] == "NotAuthorizedException":
            return _response(200, {"message": "E-mail ja verificado."})
        raise


def _resend_verification(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})

    try:
        cognito_client.resend_confirmation_code(ClientId=COGNITO_CLIENT_ID, Username=email)
        return _response(200, {"message": "Codigo reenviado."})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UserNotFoundException":
            return _response(404, {"message": "Usuario nao encontrado."})
        if detail["code"] == "InvalidParameterException":
            return _response(409, {"message": "E-mail ja verificado."})
        if detail["code"] == "NotAuthorizedException":
            return _response(409, {"message": "Nao foi possivel reenviar o codigo no momento."})
        raise


def _login(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")

    if not email or not password:
        return _response(400, {"message": "Informe e-mail e senha."})

    users = _list_users_by_email(email)
    auth_result: Optional[Dict[str, Any]] = None
    last_auth_error: Optional[ClientError] = None
    last_auth_detail: Optional[Dict[str, str]] = None

    for username in _build_password_auth_candidates(email, users):
        try:
            auth_result = _initiate_password_auth(username, password)
            break
        except ClientError as error:
            detail = _map_client_error(error)
            if detail["code"] == "UserNotConfirmedException":
                return _response(
                    403,
                    {"message": "E-mail ainda nao verificado.", "code": "EMAIL_NOT_VERIFIED"},
                )
            if detail["code"] in ("NotAuthorizedException", "UserNotFoundException", "InvalidParameterException"):
                last_auth_error = error
                last_auth_detail = detail
                continue
            raise

    if auth_result is None:
        has_local = any(not _is_federated_user(user) for user in users)
        has_federated = any(_is_federated_user(user) for user in users)
        if has_federated and not has_local:
            return _response(
                409,
                {
                    "message": "Esta conta foi criada com Google. Entre com Google ou use a senha definida no seu perfil.",
                    "code": "FEDERATED_USER_NO_PASSWORD",
                },
            )
        if last_auth_detail and last_auth_detail["code"] in ("NotAuthorizedException", "UserNotFoundException"):
            return _response(401, {"message": "Credenciais invalidas."})
        if last_auth_error:
            raise last_auth_error
        return _response(401, {"message": "Credenciais invalidas."})

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    refresh_token = authentication.get("RefreshToken")
    expires_in = int(authentication.get("ExpiresIn", 3600))

    if not access_token or not id_token or not refresh_token:
        return _response(500, {"message": "Resposta invalida do provedor de autenticacao."})

    user = _get_user_from_access_token(access_token)
    if "sub" in user:
        profile = _get_profile(user["sub"])
        user["profile"] = _merge_profile_defaults(profile, user)
    return _response(
        200,
        {
            "accessToken": access_token,
            "idToken": id_token,
            "refreshToken": refresh_token,
            "expiresAt": int(time.time()) + expires_in,
            "user": user,
        },
    )


def _set_password(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    body = _parse_body(event)
    password = str(body.get("password", "")).strip()

    if len(password) < 8:
        return _response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    try:
        cognito_user = cognito_client.get_user(AccessToken=access_token)
        attrs = _parse_user_attributes(cognito_user.get("UserAttributes", []))
        email = _normalize_email(attrs.get("email", ""))
        username = cognito_user.get("Username")
        if not email:
            return _response(500, {"message": "Nao foi possivel identificar o usuario."})
        if not isinstance(username, str) or not username:
            return _response(500, {"message": "Nao foi possivel identificar o usuario."})

        if _is_federated_user(cognito_user):
            try:
                cognito_client.admin_update_user_attributes(
                    UserPoolId=COGNITO_USER_POOL_ID,
                    Username=username,
                    UserAttributes=[
                        {"Name": "email", "Value": email},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                )
            except ClientError as error:
                detail = _map_client_error(error)
                if detail["code"] != "AliasExistsException":
                    raise
                _log_error("Nao foi possivel verificar e-mail federado por alias existente.", event=event, error=error)

        cognito_client.admin_set_user_password(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=username,
            Password=password,
            Permanent=True,
        )
        return _response(200, {"message": "Senha definida com sucesso."})
    except ClientError as error:
        detail = _map_client_error(error)
        _log_error("Falha ao definir senha.", event=event, error=error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        if detail["code"] == "UserNotFoundException":
            return _response(409, {"message": "Conta nao encontrada para definir senha."})
        if detail["code"] in ("InvalidPasswordException", "InvalidParameterException"):
            return _response(400, {"message": detail["message"]})
        raise


def _refresh(body: Dict[str, Any]) -> Dict[str, Any]:
    refresh_token = str(body.get("refreshToken", "")).strip()
    if not refresh_token:
        return _response(400, {"message": "Refresh token obrigatorio."})

    try:
        auth_result = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters={"REFRESH_TOKEN": refresh_token},
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    expires_in = int(authentication.get("ExpiresIn", 3600))

    if not access_token or not id_token:
        return _response(500, {"message": "Resposta invalida do provedor de autenticacao."})

    return _response(
        200,
        {
            "accessToken": access_token,
            "idToken": id_token,
            "expiresAt": int(time.time()) + expires_in,
        },
    )


def _read_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        user_id = user.get("sub")
        if not user_id:
            return _response(500, {"message": "Usuario sem identificador valido."})
        profile = _get_profile(user_id)
        profile = _merge_profile_defaults(profile, user)
        return _response(200, {"profile": profile})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _save_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    body = _parse_body(event)
    updates: Dict[str, str] = {}
    if "fullName" in body:
        if not isinstance(body.get("fullName"), str):
            return _response(400, {"message": "Nome completo invalido."})
        updates["fullName"] = body.get("fullName", "").strip()
    if "birthDate" in body:
        if not isinstance(body.get("birthDate"), str):
            return _response(400, {"message": "Data de nascimento invalida."})
        updates["birthDate"] = body.get("birthDate", "").strip()

    if not updates:
        return _response(400, {"message": "Nenhum campo de perfil informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        user_id = user.get("sub")
        if not user_id:
            return _response(500, {"message": "Usuario sem identificador valido."})
        existing = _get_profile(user_id)
        profile = {
            "fullName": updates.get("fullName", existing.get("fullName", "")),
            "birthDate": updates.get("birthDate", existing.get("birthDate", "")),
        }
        profile = _merge_profile_defaults(profile, user)
        _update_profile_item(user_id, profile)
        return _response(200, {"profile": profile})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _me(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        if "sub" in user:
            profile = _get_profile(user["sub"])
            user["profile"] = _merge_profile_defaults(profile, user)
        return _response(200, {"user": user})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _garage_current(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        garage = _get_or_create_garage(user)
        return _response(200, {"garage": garage})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _garage_status(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        garage = _get_or_create_garage(user)
        return _response(200, {"tracking": garage.get("tracking", {})})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _garage_upsert(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    body = _parse_body(event)

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        user_id = user.get("sub")
        if not isinstance(user_id, str) or not user_id:
            return _response(500, {"message": "Usuario sem identificador valido."})

        table = _get_garage_table()
        result = table.get_item(Key={"userId": user_id})
        garage = result.get("Item") or _build_demo_garage(user)

        for key in ("order", "vehicle", "financing", "documents", "recalls", "tracking"):
            if key in body and body[key] is not None:
                garage[key] = body[key]

        garage["userId"] = user_id
        if "createdAt" not in garage:
            garage["createdAt"] = int(time.time())
        garage["updatedAt"] = int(time.time())

        table.put_item(Item=garage)
        return _response(200, {"garage": garage})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _garage_link(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    body = _parse_body(event)
    purchase_id = _coerce_text(body.get("purchaseId"))
    order_id = _coerce_text(body.get("orderId"))
    email = _coerce_text(body.get("email"))
    if not purchase_id and not order_id and not email:
        return _response(400, {"message": "Informe purchaseId, orderId ou email."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        user_id = _coerce_text(user.get("sub"))
        if not user_id:
            return _response(500, {"message": "Usuario sem identificador valido."})

        purchase: Optional[Dict[str, Any]] = None
        if purchase_id:
            purchase = _find_purchase_by_purchase_id(purchase_id)
        if not purchase and order_id:
            purchase = _find_purchase_by_order_id(order_id)
        if not purchase and email:
            purchase = _find_purchase_by_email(email)
        if not purchase:
            return _response(404, {"message": "Compra nao encontrada."})

        linked_purchase = _attach_purchase_to_user(purchase, user_id)
        if not linked_purchase:
            existing_user_id = _coerce_text(purchase.get("userId"))
            if existing_user_id and existing_user_id != user_id:
                return _response(409, {"message": "Compra ja vinculada a outro usuario."})
            return _response(500, {"message": "Nao foi possivel vincular a compra."})

        garage = _project_garage_from_purchase(user, linked_purchase)
        garage_table = _get_garage_table()
        garage_table.put_item(Item=garage)
        return _response(200, {"garage": garage, "purchase": linked_purchase})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        if detail["code"] == "ConditionalCheckFailedException":
            return _response(409, {"message": "Compra ja vinculada a outro usuario."})
        raise


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context
    trigger_source = event.get("triggerSource", "")
    if isinstance(trigger_source, str) and trigger_source.startswith("PreSignUp_"):
        if not COGNITO_USER_POOL_ID:
            raise ValueError("COGNITO_USER_POOL_ID nao configurado.")
        return _handle_pre_sign_up(event)

    config_error = _validate_config()
    if config_error:
        return config_error

    iot_payload = _extract_iot_tracking_payload(event)
    if iot_payload:
        return _ingest_factory_tracking(iot_payload)

    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return _response(204, {})

    try:
        if method == "POST" and path == "/garage/ingest":
            return _garage_ingest(event)
        if method == "POST" and path == "/auth/check-email":
            return _check_email(_parse_body(event))
        if method == "POST" and path == "/auth/register":
            return _register(_parse_body(event))
        if method == "POST" and path == "/auth/login":
            return _login(_parse_body(event))
        if method == "POST" and path == "/auth/verify-email":
            return _verify_email(_parse_body(event))
        if method == "POST" and path == "/auth/resend-verification":
            return _resend_verification(_parse_body(event))
        if method == "POST" and path == "/auth/refresh":
            return _refresh(_parse_body(event))
        if method == "POST" and path == "/auth/set-password":
            return _set_password(event)
        if method == "GET" and path == "/profile":
            return _read_profile(event)
        if method == "PUT" and path == "/profile":
            return _save_profile(event)
        if method == "GET" and path == "/me":
            return _me(event)
        if method == "GET" and path == "/garage/current":
            return _garage_current(event)
        if method == "PUT" and path == "/garage/current":
            return _garage_upsert(event)
        if method == "POST" and path == "/garage/link":
            return _garage_link(event)
        if method == "GET" and path == "/garage/status":
            return _garage_status(event)
        return _response(404, {"message": "Rota nao encontrada."})
    except (ClientError, ValueError, TypeError, json.JSONDecodeError) as error:
        _log_error("Erro interno.", event=event, error=error)
        return _response(500, {"message": "Erro interno.", "detail": str(error)})
