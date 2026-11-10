import importlib
import json
import shutil
import subprocess
from pathlib import Path

import boto3
import pytest
from moto import mock_aws

handler = importlib.import_module("services.auth.handler")
flows = importlib.import_module("flows")
cognito_module = importlib.import_module("common.cognito")
cognito_users = importlib.import_module("common.cognito_users")
ddb = importlib.import_module("common.ddb")
ratelimit = importlib.import_module("common.ratelimit")

MOBILE_DIR = Path(__file__).resolve().parents[3] / "mobile"
CONTRACT_DIR = MOBILE_DIR / "__contract__"
CONTRACT_FILE = CONTRACT_DIR / "auth.contract.ts"

PASSWORD = "Password1!"
SOURCE_IP = "203.0.113.10"
ALLOWED_ORIGIN = "https://app.example.com"


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

    def federated(self, email):
        self.cognito.admin_create_user(
            UserPoolId=self.pool_id,
            Username="google_" + email.split("@", 1)[0],
            UserAttributes=[{"Name": "email", "Value": email}],
            MessageAction="SUPPRESS",
        )

    def login(self, email, password=PASSWORD):
        return call("POST", "/auth/login", {"email": email, "password": password})

    def access_token(self, email):
        return self.login(email)[2]["accessToken"]


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
        for name, key in (("ProfileTable", "userId"), ("RateLimitTable", "pk")):
            dynamodb.create_table(
                TableName=name,
                KeySchema=[{"AttributeName": key, "KeyType": "HASH"}],
                AttributeDefinitions=[{"AttributeName": key, "AttributeType": "S"}],
                BillingMode="PAY_PER_REQUEST",
            )

        monkeypatch.setattr(cognito_module, "cognito_client", cognito)
        monkeypatch.setattr(cognito_module, "COGNITO_USER_POOL_ID", pool_id)
        monkeypatch.setattr(cognito_module, "COGNITO_CLIENT_ID", client_id)
        monkeypatch.setattr(cognito_users, "cognito_client", cognito)
        monkeypatch.setattr(cognito_users, "COGNITO_USER_POOL_ID", pool_id)
        monkeypatch.setattr(handler, "COGNITO_USER_POOL_ID", pool_id)
        monkeypatch.setattr(handler, "COGNITO_CLIENT_ID", client_id)
        monkeypatch.setattr(flows, "COGNITO_USER_POOL_ID", pool_id)
        monkeypatch.setattr(flows, "COGNITO_CLIENT_ID", client_id)
        monkeypatch.setattr(flows, "PROFILE_TABLE_NAME", "ProfileTable")
        monkeypatch.setattr(ddb, "dynamodb_resource", dynamodb)
        monkeypatch.setattr(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateLimitTable")
        monkeypatch.setenv("ALLOWED_ORIGIN", ALLOWED_ORIGIN)

        yield ContractContext(cognito, dynamodb, pool_id, client_id)


def call(method, path, body=None, headers=None, ip=SOURCE_IP):
    event = {
        "rawPath": path,
        "requestContext": {
            "http": {"method": method, "sourceIp": ip, "requestId": "contract-1"}
        },
    }
    if body is not None:
        event["body"] = json.dumps(body, ensure_ascii=False)
    if headers:
        event["headers"] = headers
    result = handler.lambda_handler(event, None)
    parsed = json.loads(result["body"]) if result.get("body") else {}
    return result["statusCode"], result.get("headers", {}), parsed


def resend_verification(contract, email):
    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(contract.cognito, "resend_confirmation_code", lambda **_: {})
        return call("POST", "/auth/resend-verification", {"email": email})


def test_check_email_unknown_returns_register_route(contract):
    status, headers, body = call("POST", "/auth/check-email", {"email": "novo@x.com"})
    assert status == 200
    assert body == {"exists": False, "nextRoute": "/register"}
    assert headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN
    assert headers["Access-Control-Expose-Headers"] == "Retry-After"


def test_check_email_existing_returns_login_route(contract):
    contract.sign_up("existe@x.com", with_password=True)
    status, _, body = call("POST", "/auth/check-email", {"email": "existe@x.com"})
    assert status == 200
    assert body == {"exists": True, "nextRoute": "/login", "isFederated": False}


def test_check_email_federated_only_returns_is_federated(contract):
    contract.federated("sofederado@x.com")
    status, _, body = call("POST", "/auth/check-email", {"email": "sofederado@x.com"})
    assert status == 200
    assert body == {"exists": True, "nextRoute": "/login", "isFederated": True}


def test_register_returns_201_with_requires_email_verification(contract):
    status, headers, body = call(
        "POST",
        "/auth/register",
        {"email": "novo2@x.com", "password": PASSWORD, "name": "Novo"},
    )
    assert status == 201
    assert body["requiresEmailVerification"] is True
    assert set(body) == {"message", "requiresEmailVerification"}
    assert headers["Content-Type"] == "application/json"


def test_register_duplicate_returns_409(contract):
    contract.sign_up("duplicado@x.com", with_password=True)
    status, _, body = call(
        "POST", "/auth/register", {"email": "duplicado@x.com", "password": PASSWORD}
    )
    assert status == 409
    assert body == {"message": "Usuário já cadastrado."}


def test_login_returns_five_fields_with_profile(contract):
    contract.sign_up("login@x.com", with_password=True)
    status, headers, body = contract.login("login@x.com")
    assert status == 200
    assert set(body) == {"accessToken", "idToken", "refreshToken", "expiresAt", "user"}
    assert set(body["user"]) == {"email", "name", "isVerified", "sub", "profile"}
    assert body["user"]["email"] == "login@x.com"
    assert body["user"]["isVerified"] is True
    assert body["user"]["profile"] == {"fullName": "", "birthDate": "", "cpf": ""}
    assert isinstance(body["expiresAt"], int)
    assert headers["Access-Control-Expose-Headers"] == "Retry-After"


def test_login_unconfirmed_returns_403_email_not_verified(contract):
    contract.sign_up("naoconfirmado@x.com")
    status, _, body = contract.login("naoconfirmado@x.com")
    assert status == 403
    assert body == {
        "message": "E-mail ainda não verificado.",
        "code": "EMAIL_NOT_VERIFIED",
    }


def test_login_federated_returns_409_federated_user_no_password(contract):
    contract.federated("federado@x.com")
    status, _, body = contract.login("federado@x.com")
    assert status == 409
    assert body["code"] == "FEDERATED_USER_NO_PASSWORD"
    assert set(body) == {"message", "code"}


def test_login_wrong_password_returns_401(contract):
    contract.sign_up("senha@x.com", with_password=True)
    status, _, body = contract.login("senha@x.com", "OutraSenha1!")
    assert status == 401
    assert body == {"message": "Credenciais inválidas."}


def test_refresh_returns_three_fields(contract):
    contract.sign_up("refresh@x.com", with_password=True)
    login_body = contract.login("refresh@x.com")[2]
    status, _, body = call(
        "POST", "/auth/refresh", {"refreshToken": login_body["refreshToken"]}
    )
    assert status == 200
    assert set(body) == {"accessToken", "idToken", "expiresAt"}
    assert isinstance(body["expiresAt"], int)


def test_verify_email_returns_message(contract):
    contract.sign_up("verificar@x.com")
    status, _, body = call(
        "POST",
        "/auth/verify-email",
        {"email": "verificar@x.com", "code": "123456"},
    )
    assert status == 200
    assert body == {"message": "E-mail verificado com sucesso."}


def test_resend_verification_returns_message(contract):
    contract.sign_up("reenviar@x.com")
    status, _, body = resend_verification(contract, "reenviar@x.com")
    assert status == 200
    assert body == {"message": "Código reenviado."}


def test_set_password_returns_message(contract):
    contract.sign_up("trocar@x.com", with_password=True)
    token = contract.access_token("trocar@x.com")
    status, headers, body = call(
        "POST",
        "/auth/set-password",
        {"password": "NovaSenha1!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert status == 200
    assert body == {"message": "Senha definida com sucesso."}
    assert headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN


def test_set_password_without_token_returns_401(contract):
    status, _, body = call("POST", "/auth/set-password", {"password": PASSWORD})
    assert status == 401
    assert body == {"message": "Token não informado."}


def test_rate_limit_returns_429_with_retry_after(contract):
    responses = [
        call("POST", "/auth/check-email", {"email": "burst@x.com"}) for _ in range(25)
    ]
    limited = [item for item in responses if item[0] == 429]
    assert limited, "esperava ao menos um 429 no burst"
    status, headers, body = limited[-1]
    assert body["message"] == "Muitas requisições."
    assert body["retryAfter"] >= 1
    assert headers["Retry-After"] == str(body["retryAfter"])


def test_preflight_returns_204_with_cors_headers(contract):
    status, headers, _ = call("OPTIONS", "/auth/login")
    assert status == 204
    assert headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN
    assert headers["Access-Control-Expose-Headers"] == "Retry-After"
    assert headers["Access-Control-Allow-Methods"] == "OPTIONS,GET,POST,PUT"


def test_unknown_route_returns_404(contract):
    status, _, body = call("POST", "/auth/inexistente", {"email": "x@y.com"})
    assert status == 404
    assert body == {"message": "Rota não encontrada."}


def build_contract_cases(contract):
    contract.sign_up("contrato@x.com", with_password=True)
    contract.sign_up("contrato_novo@x.com")

    login_body = contract.login("contrato@x.com")[2]
    refresh_body = call(
        "POST", "/auth/refresh", {"refreshToken": login_body["refreshToken"]}
    )[2]
    token = login_body["accessToken"]

    return [
        (
            "checkEmailUnknown",
            "CheckEmailResponse",
            call("POST", "/auth/check-email", {"email": "contrato_inexistente@x.com"})[
                2
            ],
        ),
        (
            "checkEmailExisting",
            "CheckEmailResponse",
            call("POST", "/auth/check-email", {"email": "contrato@x.com"})[2],
        ),
        (
            "register",
            "RegisterResponse",
            call(
                "POST",
                "/auth/register",
                {"email": "contrato_reg@x.com", "password": PASSWORD},
            )[2],
        ),
        ("login", "LoginResponse", login_body),
        ("refresh", "RefreshSessionResponse", refresh_body),
        (
            "verifyEmail",
            "messageOnly",
            call(
                "POST",
                "/auth/verify-email",
                {"email": "contrato_novo@x.com", "code": "123456"},
            )[2],
        ),
        (
            "resendVerification",
            "messageOnly",
            resend_verification(contract, "contrato_novo@x.com")[2],
        ),
        (
            "setPassword",
            "messageOnly",
            call(
                "POST",
                "/auth/set-password",
                {"password": "NovaSenha1!"},
                headers={"Authorization": f"Bearer {token}"},
            )[2],
        ),
    ]


def write_contract_file(cases):
    type_imports = sorted(
        {type_name for _, type_name, _ in cases if type_name != "messageOnly"}
    )
    lines = [f'import type {{ {", ".join(type_imports)} }} from "@/types/auth";']
    lines.append("type messageOnly = { message: string };")
    for name, type_name, body in cases:
        payload = json.dumps(body, ensure_ascii=False)
        lines.append(f"export const {name}: {type_name} = {payload};")
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
