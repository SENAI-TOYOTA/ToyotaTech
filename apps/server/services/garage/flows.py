import time
from typing import Any, Dict

from botocore.exceptions import ClientError

from common.auth import authenticated_user
from common.ddb import get_table
from common.responses import ApiError, error_body, parse_body, require

from . import demo, projection, purchases, resolver, validation


def current(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    return {"garage": resolver.get_or_create_garage(user)}


def resolve(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    garage, purchase, match_source = resolver.resolve_garage(user, force=True)
    body: Dict[str, Any] = {"garage": garage, "matchSource": match_source}
    if purchase:
        body["purchase"] = purchase
    return body


def upsert(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    user_id = user.get("sub")
    require(
        isinstance(user_id, str) and bool(user_id),
        500,
        "Usuário sem identificador válido.",
    )

    body = parse_body(event)
    table = get_table(resolver.GARAGE_TABLE_NAME)
    garage = table.get_item(Key={"userId": user_id}).get("Item") or demo.build_garage(
        user
    )

    for key in ("order", "vehicle", "financing", "documents", "recalls", "tracking"):
        if key in body and body[key] is not None:
            garage[key] = body[key]

    now = int(time.time())
    garage["userId"] = user_id
    if "createdAt" not in garage:
        garage["createdAt"] = now
    garage["updatedAt"] = now

    table.put_item(Item=garage)
    return {"garage": garage}


def link(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    user_id = validation.coerce_text(user.get("sub"))
    require(bool(user_id), 500, "Usuário sem identificador válido.")

    body = parse_body(event)
    purchase_id = validation.coerce_text(body.get("purchaseId"))
    order_id = validation.coerce_text(body.get("orderId"))

    profile = resolver.get_profile(user_id)
    profile_cpf = validation.normalize_cpf(profile.get("cpf"))
    require(bool(profile_cpf), 409, "Perfil sem CPF para vincular compra.")

    purchase = purchases.find_by_purchase_id(purchase_id) if purchase_id else None
    if not purchase and order_id:
        purchase = purchases.find_by_order_id(order_id)
    if not purchase:
        for cpf_purchase in purchases.find_all_by_cpf(profile_cpf):
            if not purchases.is_generated(cpf_purchase):
                purchase = cpf_purchase
                break
    if not purchase:
        raise ApiError(404, "Compra não encontrada.")
    require(
        not purchases.is_generated(purchase)
        and purchases.matches_profile(purchase, profile),
        403,
        "Compra não pertence ao CPF do perfil.",
    )

    try:
        linked_purchase = purchases.attach_to_user(purchase, user_id)
    except ClientError as error:
        code, _ = error_body(error)
        if code == "ConditionalCheckFailedException":
            raise ApiError(409, "Compra já vinculada a outro usuário.")
        raise
    if not linked_purchase:
        existing_user_id = validation.coerce_text(purchase.get("userId"))
        require(
            not (existing_user_id and existing_user_id != user_id),
            409,
            "Compra já vinculada a outro usuário.",
        )
        raise ApiError(500, "Não foi possível vincular a compra.")

    garage = projection.project_garage(user, linked_purchase)
    garage["matchSource"] = "manual_link"
    garage["matchConfidence"] = "high"
    garage["matchAlgorithmVersion"] = demo.GARAGE_MATCH_ALGORITHM_VERSION
    get_table(resolver.GARAGE_TABLE_NAME).put_item(Item=garage)
    return {"garage": garage, "purchase": linked_purchase}
