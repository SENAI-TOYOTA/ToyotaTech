import base64
import json
import os
import time
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError


COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "").strip()
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "").strip()
PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()
COGNITO_REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))
cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
dynamodb_resource = boto3.resource("dynamodb", region_name=COGNITO_REGION)


def _response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
        },
        "body": json.dumps(body),
    }


def _validate_config() -> Optional[Dict[str, Any]]:
    if not COGNITO_USER_POOL_ID:
        return _response(500, {"message": "COGNITO_USER_POOL_ID nao configurado."})
    if not COGNITO_CLIENT_ID:
        return _response(500, {"message": "COGNITO_CLIENT_ID nao configurado."})
    if not PROFILE_TABLE_NAME:
        return _response(500, {"message": "PROFILE_TABLE_NAME nao configurado."})
    return None


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


def _extract_token(event: Dict[str, Any]) -> Optional[str]:
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization")
    if not auth_header:
        return None
    prefix = "bearer "
    if auth_header.lower().startswith(prefix):
        return auth_header[len(prefix) :].strip()
    return None


def _map_client_error(error: ClientError) -> Dict[str, str]:
    payload = error.response.get("Error", {})
    return {
        "code": payload.get("Code", "Unknown"),
        "message": payload.get("Message", "Erro desconhecido."),
    }


def _parse_user_attributes(user_attributes: Any) -> Dict[str, str]:
    parsed: Dict[str, str] = {}
    if not isinstance(user_attributes, list):
        return parsed
    for item in user_attributes:
        if not isinstance(item, dict):
            continue
        name = item.get("Name")
        value = item.get("Value")
        if isinstance(name, str) and isinstance(value, str):
            parsed[name] = value
    return parsed


def _build_auth_user(user_data: Dict[str, Any], fallback_email: str = "") -> Dict[str, Any]:
    attrs = _parse_user_attributes(user_data.get("UserAttributes", []))
    email = attrs.get("email") or fallback_email
    if not email and isinstance(user_data.get("Username"), str):
        email = user_data["Username"]
    name = attrs.get("name") or (email.split("@", 1)[0] if "@" in email else "Usuario")
    is_verified = attrs.get("email_verified", "false").strip().lower() == "true"

    user: Dict[str, Any] = {
        "email": email,
        "name": name,
        "isVerified": is_verified,
    }
    if "sub" in attrs:
        user["sub"] = attrs["sub"]
    return user


def _get_profile_table():
    if not PROFILE_TABLE_NAME:
        raise ValueError("PROFILE_TABLE_NAME nao configurado.")
    return dynamodb_resource.Table(PROFILE_TABLE_NAME)


def _normalize_profile(item: Dict[str, Any]) -> Dict[str, str]:
    return {
        "fullName": str(item.get("fullName", "") or ""),
        "birthDate": str(item.get("birthDate", "") or ""),
    }


def _get_profile(user_id: str) -> Dict[str, str]:
    table = _get_profile_table()
    result = table.get_item(Key={"userId": user_id})
    item = result.get("Item") or {}
    return _normalize_profile(item)


def _merge_profile_defaults(profile: Dict[str, str], user: Dict[str, Any]) -> Dict[str, str]:
    merged = dict(profile)
    if not merged.get("fullName") and user.get("name"):
        merged["fullName"] = str(user["name"])
    return merged


def _update_profile_item(user_id: str, profile: Dict[str, str]) -> None:
    table = _get_profile_table()
    table.put_item(
        Item={
            "userId": user_id,
            "fullName": profile.get("fullName", ""),
            "birthDate": profile.get("birthDate", ""),
            "updatedAt": int(time.time()),
        }
    )


def _get_user_from_access_token(access_token: str) -> Dict[str, Any]:
    cognito_user = cognito_client.get_user(AccessToken=access_token)
    return _build_auth_user(cognito_user)


def _check_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})

    try:
        cognito_client.admin_get_user(UserPoolId=COGNITO_USER_POOL_ID, Username=email)
        return _response(200, {"exists": True, "nextRoute": "/login"})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UserNotFoundException":
            return _response(200, {"exists": False, "nextRoute": "/register"})
        raise


def _register(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")
    name = (body.get("name", "") or "").strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if len(password) < 8:
        return _response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    attributes = [{"Name": "email", "Value": email}]
    if name:
        attributes.append({"Name": "name", "Value": name})

    try:
        sign_up = cognito_client.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=attributes,
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UsernameExistsException":
            return _response(409, {"message": "Usuario ja cadastrado."})
        if detail["code"] in ("InvalidPasswordException", "InvalidParameterException"):
            return _response(400, {"message": detail["message"]})
        raise

    return _response(
        201,
        {
            "message": "Usuario cadastrado. Verifique seu e-mail para concluir o acesso.",
            "requiresEmailVerification": not bool(sign_up.get("UserConfirmed")),
        },
    )


def _verify_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    verification_code = str(body.get("code", "")).strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if not verification_code:
        return _response(400, {"message": "Codigo de verificacao obrigatorio."})

    try:
        cognito_client.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            ConfirmationCode=verification_code,
        )
        return _response(200, {"message": "E-mail verificado com sucesso."})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "CodeMismatchException":
            return _response(400, {"message": "Codigo invalido."})
        if detail["code"] == "ExpiredCodeException":
            return _response(400, {"message": "Codigo expirado. Solicite novo codigo."})
        if detail["code"] == "UserNotFoundException":
            return _response(404, {"message": "Usuario nao encontrado."})
        if detail["code"] == "NotAuthorizedException":
            return _response(200, {"message": "E-mail ja verificado."})
        raise


def _resend_verification(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})

    try:
        cognito_client.resend_confirmation_code(ClientId=COGNITO_CLIENT_ID, Username=email)
        return _response(200, {"message": "Codigo reenviado."})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UserNotFoundException":
            return _response(404, {"message": "Usuario nao encontrado."})
        if detail["code"] == "InvalidParameterException":
            return _response(409, {"message": "E-mail ja verificado."})
        raise


def _login(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")

    if not email or not password:
        return _response(400, {"message": "Informe e-mail e senha."})

    try:
        auth_result = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": email, "PASSWORD": password},
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UserNotConfirmedException":
            return _response(
                403,
                {"message": "E-mail ainda nao verificado.", "code": "EMAIL_NOT_VERIFIED"},
            )
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Credenciais invalidas."})
        if detail["code"] == "UserNotFoundException":
            return _response(401, {"message": "Credenciais invalidas."})
        raise

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    refresh_token = authentication.get("RefreshToken")
    expires_in = int(authentication.get("ExpiresIn", 3600))

    if not access_token or not id_token or not refresh_token:
        return _response(500, {"message": "Resposta invalida do provedor de autenticacao."})

    user = _get_user_from_access_token(access_token)
    if "sub" in user:
        profile = _get_profile(user["sub"])
        user["profile"] = _merge_profile_defaults(profile, user)
    return _response(
        200,
        {
            "accessToken": access_token,
            "idToken": id_token,
            "refreshToken": refresh_token,
            "expiresAt": int(time.time()) + expires_in,
            "user": user,
        },
    )


def _refresh(body: Dict[str, Any]) -> Dict[str, Any]:
    refresh_token = str(body.get("refreshToken", "")).strip()
    if not refresh_token:
        return _response(400, {"message": "Refresh token obrigatorio."})

    try:
        auth_result = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters={"REFRESH_TOKEN": refresh_token},
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    expires_in = int(authentication.get("ExpiresIn", 3600))

    if not access_token or not id_token:
        return _response(500, {"message": "Resposta invalida do provedor de autenticacao."})

    return _response(
        200,
        {
            "accessToken": access_token,
            "idToken": id_token,
            "expiresAt": int(time.time()) + expires_in,
        },
    )


def _read_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token)
        user_id = user.get("sub")
        if not user_id:
            return _response(500, {"message": "Usuario sem identificador valido."})
        profile = _get_profile(user_id)
        profile = _merge_profile_defaults(profile, user)
        return _response(200, {"profile": profile})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _save_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    body = _parse_body(event)
    updates: Dict[str, str] = {}
    if "fullName" in body:
        if not isinstance(body.get("fullName"), str):
            return _response(400, {"message": "Nome completo invalido."})
        updates["fullName"] = body.get("fullName", "").strip()
    if "birthDate" in body:
        if not isinstance(body.get("birthDate"), str):
            return _response(400, {"message": "Data de nascimento invalida."})
        updates["birthDate"] = body.get("birthDate", "").strip()

    if not updates:
        return _response(400, {"message": "Nenhum campo de perfil informado."})

    try:
        user = _get_user_from_access_token(access_token)
        user_id = user.get("sub")
        if not user_id:
            return _response(500, {"message": "Usuario sem identificador valido."})
        existing = _get_profile(user_id)
        profile = {
            "fullName": updates.get("fullName", existing.get("fullName", "")),
            "birthDate": updates.get("birthDate", existing.get("birthDate", "")),
        }
        profile = _merge_profile_defaults(profile, user)
        _update_profile_item(user_id, profile)
        return _response(200, {"profile": profile})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _me(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token)
        if "sub" in user:
            profile = _get_profile(user["sub"])
            user["profile"] = _merge_profile_defaults(profile, user)
        return _response(200, {"user": user})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context
    config_error = _validate_config()
    if config_error:
        return config_error

    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return _response(204, {})

    try:
        if method == "POST" and path == "/auth/check-email":
            return _check_email(_parse_body(event))
        if method == "POST" and path == "/auth/register":
            return _register(_parse_body(event))
        if method == "POST" and path == "/auth/login":
            return _login(_parse_body(event))
        if method == "POST" and path == "/auth/verify-email":
            return _verify_email(_parse_body(event))
        if method == "POST" and path == "/auth/resend-verification":
            return _resend_verification(_parse_body(event))
        if method == "POST" and path == "/auth/refresh":
            return _refresh(_parse_body(event))
        if method == "GET" and path == "/profile":
            return _read_profile(event)
        if method == "PUT" and path == "/profile":
            return _save_profile(event)
        if method == "GET" and path == "/me":
            return _me(event)
        return _response(404, {"message": "Rota nao encontrada."})
    except (ClientError, ValueError, TypeError, json.JSONDecodeError) as error:
        return _response(500, {"message": "Erro interno.", "detail": str(error)})
