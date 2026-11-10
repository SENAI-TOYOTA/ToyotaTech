import importlib
import os
import sys
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, Iterator, Sequence

import boto3
import pytest
from moto import mock_aws

SERVER_DIR = Path(__file__).resolve().parent
COMMON_DIR = SERVER_DIR / "layers" / "common" / "python"

for path in (COMMON_DIR, SERVER_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

REGION = "us-east-1"

ENVIRONMENT_DEFAULTS = {
    "COGNITO_USER_POOL_ID": "us-east-1_testPool",
    "COGNITO_CLIENT_ID": "testClientId",
    "COGNITO_REGION": REGION,
    "PROFILE_TABLE_NAME": "ProfileTable",
    "GARAGE_TABLE_NAME": "GarageTable",
    "PURCHASE_TABLE_NAME": "PurchasesTable",
    "TRACKING_TABLE_NAME": "TrackingTable",
    "RATE_LIMIT_TABLE_NAME": "",
    "INGEST_KEY_PARAMETER_NAME": "/toyotatech/garage/ingest/key",
    "AWS_ACCESS_KEY_ID": "testing",
    "AWS_SECRET_ACCESS_KEY": "testing",
    "AWS_DEFAULT_REGION": REGION,
    "AWS_REGION": REGION,
}

for name, value in ENVIRONMENT_DEFAULTS.items():
    os.environ.setdefault(name, value)

INGEST_KEY = "chave-de-ingest-de-teste"


class FakeSsm:
    def __init__(self, value: str = INGEST_KEY, error=None):
        self.value = value
        self.error = error
        self.calls = []

    def get_parameter(self, Name, WithDecryption):
        self.calls.append({"Name": Name, "WithDecryption": WithDecryption})
        if self.error is not None:
            raise self.error
        return {"Parameter": {"Value": self.value}}


class FakeBoto3:
    def __init__(self, ssm: FakeSsm):
        self._ssm = ssm

    def client(self, service_name):
        assert service_name == "ssm"
        return self._ssm


@contextmanager
def load_service(
    service_name: str, module_names: Sequence[str]
) -> Iterator[Dict[str, Any]]:
    package = f"services.{service_name}"
    keys = [
        package,
        *module_names,
        *(f"{package}.{name}" for name in module_names),
    ]
    saved = {key: sys.modules.pop(key) for key in keys if key in sys.modules}
    service_dir = SERVER_DIR / "services" / service_name
    sys.path.insert(0, str(service_dir))
    try:
        yield {name: importlib.import_module(name) for name in module_names}
    finally:
        sys.path.remove(str(service_dir))
        for key in keys:
            sys.modules.pop(key, None)
        sys.modules.update(saved)


SERVICE_NAMES = frozenset({"auth", "garage", "profile", "tracking"})


def pytest_collectstart(collector):
    path = getattr(collector, "path", None)
    if path is None:
        return
    service_dir = path.parent
    if service_dir.parent != SERVER_DIR / "services":
        return
    if service_dir.name not in SERVICE_NAMES:
        return
    if str(service_dir) not in sys.path:
        sys.path.insert(0, str(service_dir))


@pytest.fixture()
def service_loader():
    return load_service


@pytest.fixture(autouse=True)
def reset_ingest_key():
    import common.ingest_key as ingest_key

    ingest_key._cached_key = None
    yield
    ingest_key._cached_key = None


def _create_profiles_table(resource):
    return resource.create_table(
        TableName="ProfileTable",
        KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "userId", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )


def _create_garage_table(resource):
    return resource.create_table(
        TableName="GarageTable",
        KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
        AttributeDefinitions=[
            {"AttributeName": "userId", "AttributeType": "S"},
            {"AttributeName": "chassi", "AttributeType": "S"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "chassi-index",
                "KeySchema": [{"AttributeName": "chassi", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            }
        ],
        BillingMode="PAY_PER_REQUEST",
    )


def _create_purchases_table(resource):
    return resource.create_table(
        TableName="PurchasesTable",
        KeySchema=[{"AttributeName": "purchaseId", "KeyType": "HASH"}],
        AttributeDefinitions=[
            {"AttributeName": "purchaseId", "AttributeType": "S"},
            {"AttributeName": "email", "AttributeType": "S"},
            {"AttributeName": "cpf", "AttributeType": "S"},
            {"AttributeName": "orderId", "AttributeType": "S"},
            {"AttributeName": "userId", "AttributeType": "S"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "email-index",
                "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            },
            {
                "IndexName": "cpf-index",
                "KeySchema": [{"AttributeName": "cpf", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            },
            {
                "IndexName": "orderId-index",
                "KeySchema": [{"AttributeName": "orderId", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            },
            {
                "IndexName": "userId-index",
                "KeySchema": [{"AttributeName": "userId", "KeyType": "HASH"}],
                "Projection": {"ProjectionType": "ALL"},
            },
        ],
        BillingMode="PAY_PER_REQUEST",
    )


def _create_tracking_table(resource):
    return resource.create_table(
        TableName="TrackingTable",
        KeySchema=[
            {"AttributeName": "vehicleId", "KeyType": "HASH"},
            {"AttributeName": "timestamp", "KeyType": "RANGE"},
        ],
        AttributeDefinitions=[
            {"AttributeName": "vehicleId", "AttributeType": "S"},
            {"AttributeName": "timestamp", "AttributeType": "N"},
        ],
        BillingMode="PAY_PER_REQUEST",
    )


@pytest.fixture()
def dynamodb(monkeypatch):
    with mock_aws():
        resource = boto3.resource("dynamodb", region_name=REGION)
        _create_profiles_table(resource)
        _create_garage_table(resource)
        _create_purchases_table(resource)
        _create_tracking_table(resource)
        monkeypatch.setattr("common.ddb.dynamodb_resource", resource)
        yield resource
