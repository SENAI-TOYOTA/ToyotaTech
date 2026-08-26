import os
import time
from typing import Any, Dict, Optional

from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from common.ddb import get_table
from common.responses import error_body

TRACKING_TABLE_NAME = os.environ.get("TRACKING_TABLE_NAME", "").strip()
GARAGE_TABLE_NAME = os.environ.get("GARAGE_TABLE_NAME", "").strip()


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
        result = table.scan(FilterExpression=Attr("vehicle.chassi").eq(normalized), Limit=1)
        items = result.get("Items", [])
        if items:
            return items[0]
        result = table.scan(FilterExpression=Attr("chassi").eq(normalized), Limit=1)
        items = result.get("Items", [])
        return items[0] if items else None
    except ClientError as error:
        code, _ = error_body(error)
        if code in {"ValidationException", "ResourceNotFoundException"}:
            return None
        raise


def save_event(vehicle_id: str, payload: Dict[str, Any], stage: str, status: str) -> Dict[str, Any]:
    now = int(time.time())
    event = {
        "vehicleId": vehicle_id,
        "timestamp": now,
        "stage": stage,
        "status": status,
        "payload": payload,
        "receivedAt": now,
    }
    get_table(TRACKING_TABLE_NAME).put_item(Item=event)
    return event


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
