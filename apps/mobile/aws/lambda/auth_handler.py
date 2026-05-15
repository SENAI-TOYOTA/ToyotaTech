import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any, Dict, Optional, Tuple

import boto3
from botocore.exceptions import ClientError


dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME", "toyotatech-auth-dev")
SESSION_DURATION_SECONDS = int(os.environ.get("SESSION_DURATION_SECONDS", "86400"))
VERIFICATION_CODE_TTL_SECONDS = int(os.environ.get("VERIFICATION_CODE_TTL_SECONDS", "900"))
EMAIL_VERIFICATION_MODE = os.environ.get("EMAIL_VERIFICATION_MODE", "mock").strip().lower()
SES_SOURCE_EMAIL = os.environ.get("SES_SOURCE_EMAIL", "").strip()
SES_REGION = os.environ.get("SES_REGION", os.environ.get("AWS_REGION"))
table = dynamodb.Table(TABLE_NAME)
ses_client = boto3.client("ses", region_name=SES_REGION)


def _response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        },
        "body": json.dumps(body),
    }


def _parse_body(event: Dict[str, Any]) -> Dict[str, Any]:
    body = event.get("body")
    if body is None:
        return {}
    if event.get("isBase64Encoded"):
        decoded = base64.b64decode(body).decode("utf-8")
        return json.loads(decoded) if decoded else {}
    return json.loads(body) if isinstance(body, str) and body else {}


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _hash_password(password: str, salt_hex: Optional[str] = None) -> Tuple[str, str]:
    if salt_hex is None:
        salt = os.urandom(16)
    else:
        salt = bytes.fromhex(salt_hex)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return digest.hex(), salt.hex()


def _extract_token(event: Dict[str, Any]) -> Optional[str]:
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization")
    if not auth_header:
        return None
    prefix = "bearer "
    if auth_header.lower().startswith(prefix):
        return auth_header[len(prefix) :].strip()
    return None


def _safe_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))


def _generate_verification_code() -> str:
    return f"{secrets.randbelow(900000) + 100000}"


def _deliver_verification_code(email: str, verification_code: str) -> Tuple[bool, Optional[str]]:
    if EMAIL_VERIFICATION_MODE != "ses":
        return True, None

    if not SES_SOURCE_EMAIL:
        return False, "SES_SOURCE_EMAIL nao configurado."

    try:
        ses_client.send_email(
            Source=SES_SOURCE_EMAIL,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": "ToyotaTech - Codigo de verificacao"},
                "Body": {
                    "Text": {
                        "Data": (
                            "Seu codigo de verificacao e: "
                            f"{verification_code}\n\n"
                            f"Validade: {VERIFICATION_CODE_TTL_SECONDS // 60} minutos."
                        )
                    }
                },
            },
        )
        return True, None
    except ClientError as error:
        detail = error.response.get("Error", {}).get("Message", str(error))
        return False, detail


def _build_register_response(
    message: str, verification_code: str, delivery_error: Optional[str] = None
) -> Dict[str, Any]:
    response_body: Dict[str, Any] = {
        "message": message,
        "requiresEmailVerification": True,
    }
    if EMAIL_VERIFICATION_MODE != "ses":
        response_body["verificationCode"] = verification_code
    if delivery_error:
        response_body["deliveryError"] = delivery_error
    return response_body


def _register(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")
    name = (body.get("name", "") or "").strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if len(password) < 8:
        return _response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    password_hash, salt = _hash_password(password)
    verification_code = _generate_verification_code()
    verification_hash, verification_salt = _hash_password(verification_code)
    now = int(time.time())
    profile_name = name if name else email.split("@", 1)[0]
    verification_expires_at = now + VERIFICATION_CODE_TTL_SECONDS

    try:
        table.put_item(
            Item={
                "PK": f"USER#{email}",
                "SK": "PROFILE",
                "email": email,
                "name": profile_name,
                "passwordHash": password_hash,
                "salt": salt,
                "isVerified": False,
                "verificationCodeHash": verification_hash,
                "verificationCodeSalt": verification_salt,
                "verificationCodeExpiresAt": verification_expires_at,
                "createdAt": now,
                "updatedAt": now,
            },
            ConditionExpression="attribute_not_exists(PK)",
        )
    except ClientError as error:
        if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
            return _response(409, {"message": "Usuario ja cadastrado."})
        raise

    sent, delivery_error = _deliver_verification_code(email, verification_code)
    if not sent:
        table.delete_item(Key={"PK": f"USER#{email}", "SK": "PROFILE"})
        return _response(500, {"message": "Falha ao enviar e-mail de verificacao.", "detail": delivery_error})

    return _response(
        201,
        _build_register_response(
            "Usuario cadastrado. Verifique seu e-mail para concluir o acesso.",
            verification_code,
        ),
    )


def _resend_verification(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})

    user_result = table.get_item(Key={"PK": f"USER#{email}", "SK": "PROFILE"})
    user_item = user_result.get("Item")
    if not user_item:
        return _response(404, {"message": "Usuario nao encontrado."})

    if user_item.get("isVerified") is True:
        return _response(409, {"message": "E-mail ja verificado."})

    now = int(time.time())
    verification_code = _generate_verification_code()
    verification_hash, verification_salt = _hash_password(verification_code)
    verification_expires_at = now + VERIFICATION_CODE_TTL_SECONDS

    table.update_item(
        Key={"PK": f"USER#{email}", "SK": "PROFILE"},
        UpdateExpression=(
            "SET verificationCodeHash = :verificationCodeHash, "
            "verificationCodeSalt = :verificationCodeSalt, "
            "verificationCodeExpiresAt = :verificationCodeExpiresAt, "
            "updatedAt = :updatedAt"
        ),
        ExpressionAttributeValues={
            ":verificationCodeHash": verification_hash,
            ":verificationCodeSalt": verification_salt,
            ":verificationCodeExpiresAt": verification_expires_at,
            ":updatedAt": now,
        },
    )

    sent, delivery_error = _deliver_verification_code(email, verification_code)
    if not sent:
        return _response(500, {"message": "Falha ao reenviar e-mail de verificacao.", "detail": delivery_error})

    return _response(
        200,
        _build_register_response("Codigo de verificacao reenviado.", verification_code),
    )


def _verify_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    verification_code = str(body.get("code", "")).strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if not verification_code:
        return _response(400, {"message": "Codigo de verificacao obrigatorio."})

    user_result = table.get_item(Key={"PK": f"USER#{email}", "SK": "PROFILE"})
    user_item = user_result.get("Item")
    if not user_item:
        return _response(404, {"message": "Usuario nao encontrado."})

    if user_item.get("isVerified") is True:
        return _response(200, {"message": "E-mail ja verificado."})

    code_hash = user_item.get("verificationCodeHash")
    code_salt = user_item.get("verificationCodeSalt")
    code_expires_at = int(user_item.get("verificationCodeExpiresAt", 0))
    if not code_hash or not code_salt or code_expires_at == 0:
        return _response(400, {"message": "Codigo nao encontrado. Solicite novo codigo."})

    now = int(time.time())
    if code_expires_at <= now:
        return _response(400, {"message": "Codigo expirado. Solicite novo codigo."})

    calculated_hash, _ = _hash_password(verification_code, code_salt)
    if not _safe_compare(calculated_hash, code_hash):
        return _response(400, {"message": "Codigo invalido."})

    table.update_item(
        Key={"PK": f"USER#{email}", "SK": "PROFILE"},
        UpdateExpression=(
            "SET isVerified = :isVerified, updatedAt = :updatedAt "
            "REMOVE verificationCodeHash, verificationCodeSalt, verificationCodeExpiresAt"
        ),
        ExpressionAttributeValues={
            ":isVerified": True,
            ":updatedAt": now,
        },
    )

    return _response(200, {"message": "E-mail verificado com sucesso."})


def _login(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")

    if not email or not password:
        return _response(400, {"message": "Informe e-mail e senha."})

    user_result = table.get_item(Key={"PK": f"USER#{email}", "SK": "PROFILE"})
    user_item = user_result.get("Item")

    if not user_item:
        return _response(401, {"message": "Credenciais invalidas."})

    calculated_hash, _ = _hash_password(password, user_item.get("salt", ""))
    if not _safe_compare(calculated_hash, user_item.get("passwordHash", "")):
        return _response(401, {"message": "Credenciais invalidas."})

    if user_item.get("isVerified") is False:
        return _response(
            403,
            {
                "message": "E-mail ainda nao verificado.",
                "code": "EMAIL_NOT_VERIFIED",
            },
        )

    now = int(time.time())
    expires_at = now + SESSION_DURATION_SECONDS
    token = secrets.token_urlsafe(48)

    table.put_item(
        Item={
            "PK": f"SESSION#{token}",
            "SK": "METADATA",
            "email": email,
            "createdAt": now,
            "expiresAt": expires_at,
            "ttl": expires_at,
        }
    )

    return _response(
        200,
        {
            "token": token,
            "expiresAt": expires_at,
            "user": {
                "email": user_item.get("email"),
                "name": user_item.get("name"),
                "isVerified": user_item.get("isVerified", True),
            },
        },
    )


def _me(event: Dict[str, Any]) -> Dict[str, Any]:
    token = _extract_token(event)
    if not token:
        return _response(401, {"message": "Token nao informado."})

    session_result = table.get_item(Key={"PK": f"SESSION#{token}", "SK": "METADATA"})
    session_item = session_result.get("Item")
    if not session_item:
        return _response(401, {"message": "Sessao invalida."})

    now = int(time.time())
    if int(session_item.get("expiresAt", 0)) <= now:
        table.delete_item(Key={"PK": f"SESSION#{token}", "SK": "METADATA"})
        return _response(401, {"message": "Sessao expirada."})

    email = session_item.get("email")
    user_result = table.get_item(Key={"PK": f"USER#{email}", "SK": "PROFILE"})
    user_item = user_result.get("Item")
    if not user_item:
        return _response(401, {"message": "Usuario nao encontrado."})

    return _response(
        200,
        {
            "user": {
                "email": user_item.get("email"),
                "name": user_item.get("name"),
                "isVerified": user_item.get("isVerified", True),
            }
        },
    )


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return _response(204, {})

    try:
        if method == "POST" and path == "/auth/register":
            return _register(_parse_body(event))
        if method == "POST" and path == "/auth/login":
            return _login(_parse_body(event))
        if method == "POST" and path == "/auth/verify-email":
            return _verify_email(_parse_body(event))
        if method == "POST" and path == "/auth/resend-verification":
            return _resend_verification(_parse_body(event))
        if method == "GET" and path == "/me":
            return _me(event)
        return _response(404, {"message": "Rota nao encontrada."})
    except (ClientError, ValueError, TypeError) as error:
        return _response(500, {"message": "Erro interno.", "detail": str(error)})
