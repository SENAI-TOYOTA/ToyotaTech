import os
from typing import Any, Dict, Optional, Tuple

import demo
import projection
import purchases
import validation
from botocore.exceptions import ClientError

from common.ddb import get_table
from common.responses import ApiError, error_body, require

GARAGE_TABLE_NAME = os.environ.get("GARAGE_TABLE_NAME", "").strip()
PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()


class ProfileIncompleteError(ApiError):
    def __init__(self, message: str = "Perfil incompleto para vincular veículo."):
        super().__init__(409, message, {"code": "PROFILE_INCOMPLETE"})


def get_profile(user_id: str) -> Dict[str, str]:
    item = (
        get_table(PROFILE_TABLE_NAME).get_item(Key={"userId": user_id}).get("Item")
        or {}
    )
    return {
        "fullName": validation.coerce_text(item.get("fullName")),
        "birthDate": validation.normalize_birth_date(item.get("birthDate")),
        "cpf": validation.normalize_cpf(item.get("cpf")),
    }


def should_re_resolve(garage: Dict[str, Any]) -> bool:
    match_source = validation.coerce_text(garage.get("matchSource"))
    purchase_id = validation.coerce_text(garage.get("purchaseId"))
    return (
        validation.coerce_text(garage.get("matchAlgorithmVersion"))
        != demo.GARAGE_MATCH_ALGORITHM_VERSION
        or match_source == "email_profile"
        or match_source in {"generated_demo", "legacy_demo_candidate"}
        or not purchase_id
        or purchase_id.startswith("demo-")
    )


def resolve_purchase(
    user: Dict[str, Any], profile: Dict[str, str]
) -> Tuple[Dict[str, Any], str]:
    user_id = validation.coerce_text(user.get("sub"))
    linked_purchase = purchases.find_linked_for_user(user_id)
    if (
        linked_purchase
        and not purchases.is_generated(linked_purchase)
        and purchases.matches_profile(linked_purchase, profile)
    ):
        return linked_purchase, "linked_user"

    for cpf_purchase in purchases.find_all_by_cpf(profile.get("cpf", "")):
        if purchases.is_generated(cpf_purchase):
            continue
        if not purchases.can_belong_to_user(cpf_purchase, user_id):
            continue
        if not purchases.matches_profile(cpf_purchase, profile):
            continue
        linked = purchases.attach_to_user(cpf_purchase, user_id)
        if linked:
            return linked, "cpf"

    seeded_purchase = purchases.seed_for_profile(user, profile)
    if seeded_purchase:
        return (
            purchases.attach_to_user(seeded_purchase, user_id) or seeded_purchase,
            "generated_demo",
        )

    return demo.build_purchase(user, profile), "generated_demo"


def resolve_garage(
    user: Dict[str, Any],
    *,
    force: bool = False,
) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]], str]:
    user_id = user.get("sub")
    require(
        isinstance(user_id, str) and bool(user_id),
        500,
        "Usuário sem identificador válido.",
    )

    table = get_table(GARAGE_TABLE_NAME)
    item = table.get_item(Key={"userId": user_id}).get("Item")
    profile = get_profile(user_id)
    if item and not force and not should_re_resolve(item):
        return item, None, validation.coerce_text(item.get("matchSource")) or "existing"

    if not validation.is_complete(profile):
        if item:
            return item, None, "existing_profile_incomplete"
        raise ProfileIncompleteError()

    if purchases.PURCHASE_TABLE_NAME:
        try:
            purchase, match_source = resolve_purchase(user, profile)
        except (ClientError, ValueError):
            purchase, match_source = None, "generated_demo"
        if purchase:
            purchase["matchSource"] = match_source
            if match_source == "generated_demo":
                purchase["matchConfidence"] = "generated"
            else:
                purchase["matchConfidence"] = (
                    "high" if match_source in {"cpf", "linked_user"} else "medium"
                )
            garage = projection.project_garage(user, purchase)
            garage["matchSource"] = match_source
            garage["matchConfidence"] = purchase["matchConfidence"]
            garage["matchAlgorithmVersion"] = demo.GARAGE_MATCH_ALGORITHM_VERSION
            table.put_item(Item=garage)
            return garage, purchase, match_source

    garage = demo.build_garage(user, profile)
    garage["matchSource"] = "generated_demo"
    garage["matchConfidence"] = "generated"
    garage["matchAlgorithmVersion"] = demo.GARAGE_MATCH_ALGORITHM_VERSION
    try:
        table.put_item(Item=garage, ConditionExpression="attribute_not_exists(userId)")
        return garage, None, "generated_demo"
    except ClientError as error:
        code, _ = error_body(error)
        if code != "ConditionalCheckFailedException":
            raise
        item = table.get_item(Key={"userId": user_id}).get("Item")
        if item:
            return (
                item,
                None,
                validation.coerce_text(item.get("matchSource")) or "existing",
            )
        raise


def get_or_create_garage(user: Dict[str, Any]) -> Dict[str, Any]:
    garage, _, _ = resolve_garage(user)
    return garage
