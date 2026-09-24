import math
import os
import time
from decimal import Decimal
from typing import Any, Dict, Optional

from botocore.exceptions import ClientError

from .ddb import get_table
from .responses import ApiError

RATE_LIMIT_TABLE_NAME = os.environ.get("RATE_LIMIT_TABLE_NAME", "").strip()
CAPACITY = 20
REFILL_PER_SEC = 1.0
MAX_RETRIES = 3
TTL_SECONDS = 3600


def enforce_rate_limit(ip: str, route: str) -> None:
    if not RATE_LIMIT_TABLE_NAME or not ip:
        return

    try:
        _consume(ip, route)
    except ApiError:
        raise
    except ClientError as error:
        code = error.response.get("Error", {}).get("Code", "")
        if code in (
            "ProvisionedThroughputExceededException",
            "ThrottlingException",
            "RequestLimitExceeded",
            "ServiceUnavailable",
        ):
            return
        raise


def _consume(ip: str, route: str) -> None:
    table = get_table(RATE_LIMIT_TABLE_NAME)
    pk = f"{route}#{ip}"
    now = time.time()

    for _ in range(MAX_RETRIES):
        item = _get(table, pk)
        if item is None:
            if _create(table, pk, now):
                return
            continue

        elapsed = now - float(item["last_refill"])
        tokens = min(float(CAPACITY), float(item["tokens"]) + elapsed * REFILL_PER_SEC)
        if tokens < 1.0:
            retry_after = max(1, math.ceil((1.0 - tokens) / REFILL_PER_SEC))
            raise ApiError(429, "Muitas requisições.", {"retryAfter": retry_after})

        if _update(table, pk, item, tokens - 1.0, now):
            return

    raise ApiError(429, "Muitas requisições.", {"retryAfter": 1})


def _get(table: Any, pk: str) -> Optional[Dict[str, Any]]:
    result = table.get_item(Key={"pk": pk}, ConsistentRead=True)
    return result.get("Item")


def _create(table: Any, pk: str, now: float) -> bool:
    try:
        table.put_item(
            Item={
                "pk": pk,
                "tokens": Decimal(str(CAPACITY - 1)),
                "last_refill": Decimal(str(now)),
                "ttl": int(now) + TTL_SECONDS,
            },
            ConditionExpression="attribute_not_exists(pk)",
        )
        return True
    except ClientError as error:
        if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False
        raise


def _update(
    table: Any, pk: str, item: Dict[str, Any], tokens: float, now: float
) -> bool:
    try:
        table.update_item(
            Key={"pk": pk},
            UpdateExpression="SET tokens = :t, last_refill = :lr, #ttl = :ttl",
            ConditionExpression="tokens = :old_t AND last_refill = :old_lr",
            ExpressionAttributeNames={"#ttl": "ttl"},
            ExpressionAttributeValues={
                ":t": Decimal(str(tokens)),
                ":lr": Decimal(str(now)),
                ":ttl": int(now) + TTL_SECONDS,
                ":old_t": item["tokens"],
                ":old_lr": item["last_refill"],
            },
        )
        return True
    except ClientError as error:
        if error.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False
        raise
