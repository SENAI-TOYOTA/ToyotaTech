import os
import time
from typing import Any, Dict, List, Optional

import demo
import validation
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from common.ddb import get_table
from common.responses import error_body

PURCHASE_TABLE_NAME = os.environ.get("PURCHASE_TABLE_NAME", "").strip()

_RECOVERABLE_ERRORS = {"ValidationException", "ResourceNotFoundException"}


def _query_index(
    table: Any, index_name: str, key_name: str, key_value: str, *, limit: int = 25
) -> List[Dict[str, Any]]:
    try:
        result = table.query(
            IndexName=index_name,
            KeyConditionExpression=Key(key_name).eq(key_value),
            Limit=limit,
        )
        return result.get("Items", [])
    except ClientError as error:
        code, _ = error_body(error)
        if code not in _RECOVERABLE_ERRORS:
            raise

    try:
        result = table.scan(FilterExpression=Attr(key_name).eq(key_value), Limit=limit)
        return result.get("Items", [])
    except ClientError as error:
        code, _ = error_body(error)
        if code not in _RECOVERABLE_ERRORS:
            raise
    return []


def _query_single_item(
    table: Any, index_name: str, key_name: str, key_value: str
) -> Optional[Dict[str, Any]]:
    if not key_value:
        return None
    items = _query_index(table, index_name, key_name, key_value, limit=1)
    return items[0] if items else None


def find_by_purchase_id(purchase_id: str) -> Optional[Dict[str, Any]]:
    try:
        result = get_table(PURCHASE_TABLE_NAME).get_item(
            Key={"purchaseId": purchase_id}
        )
        return result.get("Item")
    except ClientError as error:
        code, _ = error_body(error)
        if code not in _RECOVERABLE_ERRORS:
            raise
    return None


def find_by_order_id(order_id: str) -> Optional[Dict[str, Any]]:
    return _query_single_item(
        get_table(PURCHASE_TABLE_NAME), "orderId-index", "orderId", order_id
    )


def find_all_by_cpf(cpf: str) -> List[Dict[str, Any]]:
    normalized_cpf = validation.normalize_cpf(cpf)
    if not normalized_cpf:
        return []
    return _query_index(
        get_table(PURCHASE_TABLE_NAME), "cpf-index", "cpf", normalized_cpf
    )


def find_linked_for_user(user_id: str) -> Optional[Dict[str, Any]]:
    return _query_single_item(
        get_table(PURCHASE_TABLE_NAME), "userId-index", "userId", user_id
    )


def can_belong_to_user(purchase: Dict[str, Any], user_id: str) -> bool:
    existing_user_id = validation.coerce_text(purchase.get("userId"))
    return not existing_user_id or existing_user_id == user_id


def customer_value(purchase: Dict[str, Any], key: str) -> str:
    customer = purchase.get("customer")
    if isinstance(customer, dict):
        return validation.coerce_text(customer.get(key))
    return ""


def matches_profile(purchase: Dict[str, Any], profile: Dict[str, str]) -> bool:
    profile_cpf = validation.normalize_cpf(profile.get("cpf"))
    purchase_cpf = validation.normalize_cpf(
        purchase.get("cpf") or customer_value(purchase, "cpf")
    )
    return bool(profile_cpf and purchase_cpf and purchase_cpf == profile_cpf)


def is_generated(purchase: Optional[Dict[str, Any]]) -> bool:
    if not isinstance(purchase, dict):
        return False
    purchase_id = validation.coerce_text(purchase.get("purchaseId"))
    return purchase.get("matchSource") == "generated_demo" or purchase_id.startswith(
        "demo-"
    )


def attach_to_user(purchase: Dict[str, Any], user_id: str) -> Optional[Dict[str, Any]]:
    purchase_id = validation.coerce_text(purchase.get("purchaseId"))
    if not purchase_id:
        return None

    existing_user_id = validation.coerce_text(purchase.get("userId"))
    if existing_user_id and existing_user_id != user_id:
        return None

    now = int(time.time())
    get_table(PURCHASE_TABLE_NAME).update_item(
        Key={"purchaseId": purchase_id},
        UpdateExpression=(
            "SET userId = :userId, linkedAt = :linkedAt, updatedAt = :updatedAt"
        ),
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


def seed_for_profile(
    user: Dict[str, Any], profile: Dict[str, str]
) -> Optional[Dict[str, Any]]:
    table = get_table(PURCHASE_TABLE_NAME)
    purchase = demo.build_purchase(user, profile)
    try:
        table.put_item(
            Item=purchase, ConditionExpression="attribute_not_exists(purchaseId)"
        )
        return purchase
    except ClientError as error:
        code, _ = error_body(error)
        if code == "ConditionalCheckFailedException":
            existing = find_by_purchase_id(
                validation.coerce_text(purchase.get("purchaseId"))
            )
            if is_generated(existing):
                table.put_item(Item=purchase)
                return purchase
            return existing
        if code in {
            "ResourceNotFoundException",
            "AccessDeniedException",
            "ValidationException",
        }:
            return None
        raise
