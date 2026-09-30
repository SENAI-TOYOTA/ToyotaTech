import importlib
import json
import shutil
import subprocess
import sys
from contextlib import contextmanager
from pathlib import Path

import boto3
import pytest
from moto import mock_aws

SERVER_DIR = Path(__file__).resolve().parents[2]
MOBILE_DIR = SERVER_DIR.parent / "mobile"
CONTRACT_DIR = MOBILE_DIR / "__contract__"
CONTRACT_FILE = CONTRACT_DIR / "services.contract.ts"

PASSWORD = "Password1!"
ALLOWED_ORIGIN = "https://app.example.com"

SERVICE_MODULES = {
    "profile": ["flows", "validation"],
    "garage": [
        "flows",
        "validation",
        "demo",
        "projection",
        "purchases",
        "resolver",
    ],
    "tracking": ["ingest", "store"],
}


@contextmanager
def service_handler(service_name):
    keys = [f"services.{service_name}.handler", *SERVICE_MODULES[service_name]]
    saved = {key: sys.modules.pop(key) for key in keys if key in sys.modules}
    service_dir = SERVER_DIR / "services" / service_name
    sys.path.insert(0, str(service_dir))
    try:
        yield importlib.import_module(f"services.{service_name}.handler")
    finally:
        sys.path.remove(str(service_dir))
        for key in keys:
            sys.modules.pop(key, None)
        sys.modules.update(saved)


class ContractContext:
    def __init__(self, cognito, dynamodb, pool_id, client_id):
        self.cognito = cognito
        self.dynamodb = dynamodb
        self.pool_id = pool_id
        self.client_id = client_id

    def sign_up(self, email, with_password=False):
        self.cognito.sign_up(
            ClientId=self.client_id,
            Username=email,
            Password=PASSWORD,
            UserAttributes=[{"Name": "email", "Value": email}],
        )
        if with_password:
            self.cognito.confirm_sign_up(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode="123456",
            )
            self.cognito.admin_update_user_attributes(
                UserPoolId=self.pool_id,
                Username=email,
                UserAttributes=[{"Name": "email_verified", "Value": "true"}],
            )
            self.cognito.admin_set_user_password(
                UserPoolId=self.pool_id,
                Username=email,
                Password=PASSWORD,
                Permanent=True,
            )

    def access_token(self, email):
        auth = self.cognito.initiate_auth(
            ClientId=self.client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": email, "PASSWORD": PASSWORD},
        )
        return auth["AuthenticationResult"]["AccessToken"]


@pytest.fixture()
def contract(monkeypatch):
    with mock_aws():
        cognito = boto3.client("cognito-idp", region_name="us-east-1")
        pool_id = cognito.create_user_pool(PoolName="contract")["UserPool"]["Id"]
        client_id = cognito.create_user_pool_client(
            UserPoolId=pool_id,
            ClientName="contract",
            ExplicitAuthFlows=[
                "ALLOW_USER_PASSWORD_AUTH",
                "ALLOW_REFRESH_TOKEN_AUTH",
            ],
        )["UserPoolClient"]["ClientId"]

        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        tables = (
            ("ProfileTable", "userId"),
            ("RateLimitTable", "pk"),
            ("GarageTable", "userId"),
            ("TrackingTable", "vehicleId"),
        )
        for name, key in tables:
            dynamodb.create_table(
                TableName=name,
                KeySchema=[{"AttributeName": key, "KeyType": "HASH"}],
                AttributeDefinitions=[{"AttributeName": key, "AttributeType": "S"}],
                BillingMode="PAY_PER_REQUEST",
            )

        cognito_module = importlib.import_module("common.cognito")
        cognito_users = importlib.import_module("common.cognito_users")
        ddb = importlib.import_module("common.ddb")
        ratelimit = importlib.import_module("common.ratelimit")

        monkeypatch.setattr(cognito_module, "cognito_client", cognito)
        monkeypatch.setattr(cognito_module, "COGNITO_USER_POOL_ID", pool_id)
        monkeypatch.setattr(cognito_module, "COGNITO_CLIENT_ID", client_id)
        monkeypatch.setattr(cognito_users, "cognito_client", cognito)
        monkeypatch.setattr(cognito_users, "COGNITO_USER_POOL_ID", pool_id)
        monkeypatch.setattr(ddb, "dynamodb_resource", dynamodb)
        monkeypatch.setattr(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateLimitTable")
        monkeypatch.setenv("ALLOWED_ORIGIN", ALLOWED_ORIGIN)
        monkeypatch.setenv("PROFILE_TABLE_NAME", "ProfileTable")
        monkeypatch.setenv("GARAGE_TABLE_NAME", "GarageTable")
        monkeypatch.setenv("TRACKING_TABLE_NAME", "TrackingTable")
        monkeypatch.setenv("PURCHASE_TABLE_NAME", "")

        yield ContractContext(cognito, dynamodb, pool_id, client_id)


def call(handler, method, path, body=None, token=None):
    event = {
        "rawPath": path,
        "requestContext": {
            "http": {
                "method": method,
                "sourceIp": "203.0.113.10",
                "requestId": "contract-1",
            }
        },
    }
    if body is not None:
        event["body"] = json.dumps(body, ensure_ascii=False)
    if token:
        event["headers"] = {"Authorization": f"Bearer {token}"}
    result = handler.lambda_handler(event, None)
    parsed = json.loads(result["body"]) if result.get("body") else {}
    return result["statusCode"], result.get("headers", {}), parsed


def seed_email(contract, name):
    email = f"{name}@x.com"
    contract.sign_up(email, with_password=True)
    return email


def test_profile_read_returns_profile_shape(contract):
    email = seed_email(contract, "perfil")
    token = contract.access_token(email)
    with service_handler("profile") as handler:
        status, headers, body = call(handler, "GET", "/profile", token=token)
    assert status == 200
    assert set(body) == {"profile"}
    assert set(body["profile"]) == {"fullName", "birthDate", "cpf"}
    assert headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN


def test_profile_update_returns_profile_shape(contract):
    email = seed_email(contract, "atualizar")
    token = contract.access_token(email)
    with service_handler("profile") as handler:
        status, _, body = call(
            handler,
            "PUT",
            "/profile",
            {
                "fullName": "Maria Silva",
                "birthDate": "01/02/1990",
                "cpf": "12345678901",
            },
            token=token,
        )
    assert status == 200
    assert body["profile"]["fullName"] == "Maria Silva"
    assert body["profile"]["cpf"] == "12345678901"
    assert set(body["profile"]) == {"fullName", "birthDate", "cpf"}


def test_profile_without_token_returns_401(contract):
    with service_handler("profile") as handler:
        status, _, body = call(handler, "GET", "/profile")
    assert status == 401
    assert body == {"message": "Token não informado."}


def test_me_returns_user_with_profile(contract):
    email = seed_email(contract, "meu")
    token = contract.access_token(email)
    with service_handler("profile") as handler:
        status, headers, body = call(handler, "GET", "/me", token=token)
    assert status == 200
    assert set(body) == {"user"}
    assert set(body["user"]) == {"email", "name", "isVerified", "sub", "profile"}
    assert body["user"]["email"] == email
    assert headers["Access-Control-Expose-Headers"] == "Retry-After"


def complete_profile(token):
    with service_handler("profile") as handler:
        status, _, body = call(
            handler,
            "PUT",
            "/profile",
            {
                "fullName": "Maria Silva",
                "birthDate": "01/02/1990",
                "cpf": "12345678901",
            },
            token=token,
        )
    assert status == 200, body


def test_garage_current_returns_garage_shape(contract):
    email = seed_email(contract, "garagem")
    token = contract.access_token(email)
    complete_profile(token)
    with service_handler("garage") as handler:
        status, headers, body = call(handler, "GET", "/garage/current", token=token)
    assert status == 200, body
    assert set(body) == {"garage"}
    assert set(body["garage"]) >= {
        "userId",
        "order",
        "vehicle",
        "financing",
        "documents",
        "recalls",
        "tracking",
        "createdAt",
        "updatedAt",
    }
    assert headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN


def test_garage_resolve_returns_garage_with_match_source(contract):
    email = seed_email(contract, "resolver")
    token = contract.access_token(email)
    complete_profile(token)
    with service_handler("garage") as handler:
        status, _, body = call(handler, "POST", "/garage/resolve", token=token)
    assert status == 200, body
    assert set(body["garage"]) >= {
        "userId",
        "order",
        "vehicle",
        "financing",
        "documents",
        "recalls",
        "tracking",
    }
    assert body["matchSource"]


def sample_tracking():
    return {
        "vehicleId": "9BWZZZ377VT004251",
        "model": "Corolla",
        "version": "XEI",
        "color": "Branco",
        "year": "2024",
        "engine": "2.0",
        "currentStepIndex": 1,
        "steps": [
            {"id": "fabricacao", "label": "Fabricação", "status": "completed"},
            {"id": "transporte", "label": "Transporte", "status": "current"},
        ],
    }


def test_garage_status_returns_tracking_shape(contract):
    email = seed_email(contract, "rastreio")
    token = contract.access_token(email)
    tracking = sample_tracking()
    with service_handler("garage") as handler:
        status, headers, _ = call(
            handler,
            "PUT",
            "/garage/current",
            {"tracking": tracking},
            token=token,
        )
        assert status == 200, status
    with service_handler("tracking") as handler:
        status, headers, body = call(handler, "GET", "/garage/status", token=token)
    assert status == 200
    assert set(body) == {"tracking"}
    assert set(body["tracking"]) == set(tracking)
    assert body["tracking"]["steps"] == tracking["steps"]
    assert headers["Access-Control-Expose-Headers"] == "Retry-After"


def build_contract_cases(contract):
    email = seed_email(contract, "contratos")
    token = contract.access_token(email)
    complete_profile(token)

    with service_handler("profile") as profile_handler:
        profile_body = call(profile_handler, "GET", "/profile", token=token)[2]
        me_body = call(profile_handler, "GET", "/me", token=token)[2]

    with service_handler("garage") as garage_handler:
        status, _, _ = call(
            garage_handler,
            "PUT",
            "/garage/current",
            {"tracking": sample_tracking()},
            token=token,
        )
        assert status == 200, status
        garage_body = call(garage_handler, "GET", "/garage/current", token=token)[2]
        resolve_body = call(garage_handler, "POST", "/garage/resolve", token=token)[2]

    with service_handler("tracking") as tracking_handler:
        status_body = call(tracking_handler, "GET", "/garage/status", token=token)[2]

    return [
        ("profileRead", "ProfileResponse", profile_body),
        ("me", "meResponse", me_body),
        ("garageCurrent", "garageBody", garage_body),
        ("garageResolve", "resolveResponse", resolve_body),
        ("garageStatus", "statusResponse", status_body),
    ]


def write_contract_file(cases):
    lines = [
        'import type { ProfileResponse } from "@/types/profile";',
        'import type { AuthUser } from "@/types/auth";',
        'import type { GarageData } from "@/types/garage";',
        'import type { TrackingInfo } from "@/types/tracking";',
        "type trackingWithExtras = TrackingInfo & { chassi?: string };",
        (
            'type garageBody = { garage: Omit<GarageData, "tracking">'
            " & { tracking: trackingWithExtras } };"
        ),
        "type meResponse = { user: AuthUser };",
        "type resolveResponse = garageBody & { matchSource: string };",
        "type statusResponse = { tracking: trackingWithExtras };",
    ]
    for name, type_name, body in cases:
        payload = json.dumps(body, ensure_ascii=False)
        lines.append(f"export const {name} = {payload} satisfies {type_name};")
    CONTRACT_DIR.mkdir(parents=True, exist_ok=True)
    CONTRACT_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def test_contract_shapes_match_mobile_types(contract):
    write_contract_file(build_contract_cases(contract))
    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=str(MOBILE_DIR),
            capture_output=True,
            text=True,
            timeout=300,
        )
    finally:
        shutil.rmtree(CONTRACT_DIR, ignore_errors=True)

    if result.returncode == 0:
        return

    output = "\n".join(
        line
        for line in (result.stdout + result.stderr).splitlines()
        if "__contract__" in line
    )
    pytest.fail(
        output
        or f"tsc falhou sem apontar o contrato:\n{result.stdout}\n{result.stderr}"
    )
