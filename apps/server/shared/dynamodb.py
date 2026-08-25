from typing import Any

import boto3
import os

AWS_REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))

dynamodb_resource = boto3.resource("dynamodb", region_name=AWS_REGION)


def get_table(name: str) -> Any:
    if not name:
        raise ValueError("Nome da tabela DynamoDB não configurado.")
    return dynamodb_resource.Table(name)
