import os
from typing import Any

import boto3

REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))

dynamodb_resource = boto3.resource("dynamodb", region_name=REGION)


def get_table(name: str) -> Any:
    if not name:
        raise ValueError("DynamoDB table name not configured.")
    return dynamodb_resource.Table(name)
