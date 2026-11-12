import os
import time
from typing import Any, Dict, Optional

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from common.ddb import get_table
from common.responses import error_body

TRACKING_TABLE_NAME = os.environ.get("TRACKING_TABLE_NAME", "").strip()
GARAGE_TABLE_NAME = os.environ.get("GARAGE_TABLE_NAME", "").strip()
CHASSI_INDEX_NAME = "chassi-index"


def get_garage(user_id: str) -> Optional[Dict[str, Any]]:
    result = get_table(GARAGE_TABLE_NAME).get_item(Key={"userId": user_id})
    item = result.get("Item")
    return item if isinstance(item, dict) else None


def find_garage_by_chassi(chassi: str) -> Optional[Dict[str, Any]]:
    normalized = chassi.strip()
    if not normalized:
        return None
    table = get_table(GARAGE_TABLE_NAME)
    try:
        result = table.query(
            IndexName=CHASSI_INDEX_NAME,
            KeyConditionExpression=Key("chassi").eq(normalized),
            Limit=1,
        )
        items = result.get("Items", [])
        return items[0] if items else None
    except ClientError as error:
        code, _ = error_body(error)
        if code in {"ValidationException", "ResourceNotFoundException"}:
            return None
        raise


def save_event(
    vehicle_id: str,
    payload: Dict[str, Any],
    stage: str,
    status: str,
    event_timestamp: Optional[int] = None,
) -> Dict[str, Any]:
    now = int(time.time())
    timestamp = now if event_timestamp is None else int(event_timestamp)
    event = {
        "vehicleId": vehicle_id,
        "timestamp": timestamp,
        "stage": stage,
        "status": status,
        "payload": payload,
        "receivedAt": now,
    }
    try:
        get_table(TRACKING_TABLE_NAME).put_item(
            Item=event,
            ConditionExpression="attribute_not_exists(#timestamp)",
            ExpressionAttributeNames={"#timestamp": "timestamp"},
        )
    except ClientError as error:
        code, _ = error_body(error)
        if code != "ConditionalCheckFailedException":
            raise
    return event


def update_garage_tracking(
    user_id: str, tracking: Dict[str, Any], tracking_updated_at: int
) -> bool:
    normalized = user_id.strip()
    if not normalized:
        return False

    try:
        get_table(GARAGE_TABLE_NAME).update_item(
            Key={"userId": normalized},
            UpdateExpression=(
                "SET #tracking = :tracking, "
                "trackingUpdatedAt = :trackingUpdatedAt, "
                "updatedAt = :updatedAt"
            ),
            ConditionExpression=(
                "attribute_not_exists(trackingUpdatedAt) "
                "OR trackingUpdatedAt <= :trackingUpdatedAt"
            ),
            ExpressionAttributeNames={"#tracking": "tracking"},
            ExpressionAttributeValues={
                ":tracking": tracking,
                ":trackingUpdatedAt": int(tracking_updated_at),
                ":updatedAt": int(time.time()),
            },
        )
    except ClientError as error:
        code, _ = error_body(error)
        if code != "ConditionalCheckFailedException":
            raise
        return False
    return True


def latest_event(vehicle_id: str) -> Optional[Dict[str, Any]]:
    if not vehicle_id:
        return None
    result = get_table(TRACKING_TABLE_NAME).query(
        KeyConditionExpression=Key("vehicleId").eq(vehicle_id),
        ScanIndexForward=False,
        Limit=1,
    )
    items = result.get("Items", [])
    return items[0] if items else None
