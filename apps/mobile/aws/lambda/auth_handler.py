import base64
import json
import os
import time
from decimal import Decimal
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError


COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "").strip()
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "").strip()
PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()
GARAGE_TABLE_NAME = os.environ.get("GARAGE_TABLE_NAME", "").strip()
COGNITO_REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))
cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
dynamodb_resource = boto3.resource("dynamodb", region_name=COGNITO_REGION)


def _response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    def json_default(value: Any) -> Any:
        if isinstance(value, Decimal):
            return int(value) if value % 1 == 0 else str(value)
        raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT",
        },
        "body": json.dumps(body, default=json_default),
    }


def _validate_config() -> Optional[Dict[str, Any]]:
    if not COGNITO_USER_POOL_ID:
        return _response(500, {"message": "COGNITO_USER_POOL_ID nao configurado."})
    if not COGNITO_CLIENT_ID:
        return _response(500, {"message": "COGNITO_CLIENT_ID nao configurado."})
    if not PROFILE_TABLE_NAME:
        return _response(500, {"message": "PROFILE_TABLE_NAME nao configurado."})
    if not GARAGE_TABLE_NAME:
        return _response(500, {"message": "GARAGE_TABLE_NAME nao configurado."})
    return None


def _log_error(message: str, *, event: Optional[Dict[str, Any]] = None, error: Optional[Exception] = None) -> None:
    context = {}
    if event:
        request_context = event.get("requestContext", {})
        http_ctx = request_context.get("http", {})
        context = {
            "requestId": request_context.get("requestId"),
            "method": http_ctx.get("method"),
            "path": event.get("rawPath"),
            "sourceIp": http_ctx.get("sourceIp"),
        }
    payload = {
        "message": message,
        "context": context,
        "error": str(error) if error else None,
    }
    print(json.dumps(payload, ensure_ascii=False))


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
    name = attrs.get("name") or ""
    is_verified = attrs.get("email_verified", "false").strip().lower() == "true"

    user: Dict[str, Any] = {
        "email": email,
        "name": name,
        "isVerified": is_verified,
    }
    if "sub" in attrs:
        user["sub"] = attrs["sub"]
    return user


def _get_user_attributes(user_data: Dict[str, Any]) -> list[Dict[str, Any]]:
    attrs = user_data.get("UserAttributes")
    if isinstance(attrs, list):
        return attrs
    attrs = user_data.get("Attributes")
    if isinstance(attrs, list):
        return attrs
    return []


def _user_matches_email(user: Dict[str, Any], target_email: str) -> bool:
    attrs = _parse_user_attributes(_get_user_attributes(user))
    email = _normalize_email(attrs.get("email", ""))
    if email and email == target_email:
        return True
    username = user.get("Username")
    return isinstance(username, str) and _normalize_email(username) == target_email


def _scan_users_by_email(target_email: str, *, max_pages: int = 10) -> list[Dict[str, Any]]:
    matches: list[Dict[str, Any]] = []
    token: Optional[str] = None
    pages = 0
    while pages < max_pages:
        pages += 1
        params: Dict[str, Any] = {
            "UserPoolId": COGNITO_USER_POOL_ID,
            "Limit": 60,
        }
        if token:
            params["PaginationToken"] = token
        result = cognito_client.list_users(**params)
        users = result.get("Users", [])
        for user in users:
            if _user_matches_email(user, target_email):
                matches.append(user)
        if matches:
            return matches
        token = result.get("PaginationToken")
        if not token:
            break
    return matches


def _list_users_by_email(email: str) -> list[Dict[str, Any]]:
    normalized_email = _normalize_email(email)
    users_by_username: Dict[str, Dict[str, Any]] = {}

    def add_user(user: Dict[str, Any]) -> None:
        username = user.get("Username")
        if not isinstance(username, str) or not username:
            return
        if _user_matches_email(user, normalized_email):
            users_by_username[username] = user

    try:
        admin_user = cognito_client.admin_get_user(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=normalized_email,
        )
        if admin_user:
            add_user(admin_user)
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] != "UserNotFoundException":
            raise

    result = cognito_client.list_users(
        UserPoolId=COGNITO_USER_POOL_ID,
        Filter=f'email = "{normalized_email}"',
        Limit=10,
    )
    for user in result.get("Users", []):
        add_user(user)

    for user in _scan_users_by_email(normalized_email):
        add_user(user)

    return list(users_by_username.values())


def _is_federated_user(user_data: Dict[str, Any]) -> bool:
    status = str(user_data.get("UserStatus", "") or "")
    if status == "EXTERNAL_PROVIDER":
        return True
    username = user_data.get("Username")
    return isinstance(username, str) and username.lower().startswith("google_")


def _extract_provider_identity(attrs: Dict[str, str]) -> Optional[Dict[str, str]]:
    identities_raw = attrs.get("identities")
    if not identities_raw:
        return None
    try:
        identities = json.loads(identities_raw)
    except (TypeError, ValueError):
        return None
    if not isinstance(identities, list) or not identities:
        return None
    identity = identities[0]
    if not isinstance(identity, dict):
        return None
    provider_name = identity.get("providerName")
    provider_user_id = identity.get("userId")
    if not isinstance(provider_name, str) or not isinstance(provider_user_id, str):
        return None
    return {"providerName": provider_name, "providerUserId": provider_user_id}


def _find_local_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    for user in _list_users_by_email(email):
        if not _is_federated_user(user):
            return user
    return None


def _link_federated_user_if_needed(user_data: Dict[str, Any]) -> None:
    attrs = _parse_user_attributes(user_data.get("UserAttributes", []))
    email = _normalize_email(attrs.get("email", ""))
    if not email:
        return
    identity = _extract_provider_identity(attrs)
    if not identity or identity["providerName"] != "Google":
        return
    local_user = _find_local_user_by_email(email)
    if not local_user:
        return
    local_username = local_user.get("Username")
    if not isinstance(local_username, str):
        return
    federated_username = user_data.get("Username")
    if isinstance(federated_username, str) and federated_username == local_username:
        return
    try:
        cognito_client.admin_link_provider_for_user(
            UserPoolId=COGNITO_USER_POOL_ID,
            DestinationUser={
                "ProviderName": "Cognito",
                "ProviderAttributeName": "Cognito_Subject",
                "ProviderAttributeValue": local_username,
            },
            SourceUser={
                "ProviderName": identity["providerName"],
                "ProviderAttributeName": "Cognito_Subject",
                "ProviderAttributeValue": identity["providerUserId"],
            },
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] in (
            "ResourceNotFoundException",
            "ResourceConflictException",
            "AliasExistsException",
            "InvalidParameterException",
        ):
            print("Aviso: falha ao vincular IdP:", detail)
            return
        raise


def _parse_provider_username(username: str) -> Optional[Dict[str, str]]:
    if "_" not in username:
        return None
    provider_name, provider_user_id = username.split("_", 1)
    if not provider_name or not provider_user_id:
        return None
    return {"providerName": provider_name, "providerUserId": provider_user_id}


def _link_provider_to_local_user(
    local_user: Dict[str, Any],
    provider_name: str,
    provider_user_id: str,
) -> None:
    local_username = local_user.get("Username")
    if not isinstance(local_username, str) or not local_username:
        raise ValueError("Usuario local sem Username valido.")

    cognito_client.admin_link_provider_for_user(
        UserPoolId=COGNITO_USER_POOL_ID,
        DestinationUser={
            "ProviderName": "Cognito",
            "ProviderAttributeName": "Cognito_Subject",
            "ProviderAttributeValue": local_username,
        },
        SourceUser={
            "ProviderName": provider_name,
            "ProviderAttributeName": "Cognito_Subject",
            "ProviderAttributeValue": provider_user_id,
        },
    )


def _handle_pre_sign_up(event: Dict[str, Any]) -> Dict[str, Any]:
    trigger_source = event.get("triggerSource")
    request = event.get("request") or {}
    response = event.setdefault("response", {})
    user_attributes = request.get("userAttributes") or {}
    email = _normalize_email(str(user_attributes.get("email", "")))

    if not email or "@" not in email:
        return event

    users = _list_users_by_email(email)

    if trigger_source == "PreSignUp_SignUp":
        if users:
            raise ValueError("Usuario ja cadastrado com este e-mail.")
        return event

    if trigger_source != "PreSignUp_ExternalProvider":
        return event

    local_user = next((user for user in users if not _is_federated_user(user)), None)
    if not local_user:
        return event

    provider_identity = _parse_provider_username(str(event.get("userName", "")))
    if not provider_identity:
        return event

    try:
        _link_provider_to_local_user(
            local_user,
            provider_identity["providerName"],
            provider_identity["providerUserId"],
        )
        response["autoConfirmUser"] = True
        response["autoVerifyEmail"] = True
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "ResourceConflictException":
            return event
        _log_error("Falha ao vincular provedor no PreSignUp.", event=event, error=error)
        raise

    return event


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
    return dict(profile)


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


def _get_garage_table():
    if not GARAGE_TABLE_NAME:
        raise ValueError("GARAGE_TABLE_NAME nao configurado.")
    return dynamodb_resource.Table(GARAGE_TABLE_NAME)


def _build_demo_garage(user: Dict[str, Any]) -> Dict[str, Any]:
    user_id = str(user.get("sub", ""))
    safe_suffix = "".join(ch for ch in user_id.upper() if ch.isalnum())[-8:] or "00000000"
    chassi = f"9BR{safe_suffix.rjust(14, '0')}"[:17]
    now = int(time.time())
    order_id = f"TT-{str(now)[-6:]}"

    vehicle = {
        "vehicleId": chassi,
        "model": "Toyota Corolla Altis",
        "version": "Hybrid 2025",
        "color": "Branco Perola",
        "year": "2025",
        "engine": "1.8 Hybrid",
        "chassi": chassi,
    }
    tracking_steps = [
        {"id": "1", "label": "Inicio da producao", "status": "completed", "date": "10/05/2026"},
        {"id": "2", "label": "Pintura", "status": "completed", "date": "12/05/2026"},
        {"id": "3", "label": "Processo de montagem", "status": "completed", "date": "15/05/2026"},
        {"id": "4", "label": "Aguardando o embarque", "status": "current"},
        {"id": "5", "label": "Em transito", "status": "pending"},
        {"id": "6", "label": "Saiu para entrega", "status": "pending"},
    ]

    return {
        "userId": user_id,
        "order": {
            "orderId": order_id,
            "status": "linked",
            "purchaseDate": "03/10/2025",
            "dealership": "Concessionaria Toyota",
        },
        "vehicle": vehicle,
        "financing": {
            "bank": "Banco Toyota do Brasil S.A",
            "paidInstallments": 30,
            "totalInstallments": 60,
            "installmentAmount": "R$ 2.480,00",
            "nextDueDate": "10/06/2026",
            "boletoAvailable": True,
        },
        "documents": [
            {"id": "invoice", "title": "Nota fiscal", "date": "03/10/2025", "status": "available"},
            {"id": "crlv", "title": "CRLV-e", "date": "03/10/2025", "status": "available"},
            {"id": "documents", "title": "Documentos", "date": "03/10/2025", "status": "available"},
            {"id": "manual", "title": "Manual do veiculo", "date": "03/10/2025", "status": "available"},
        ],
        "recalls": [],
        "tracking": {
            **vehicle,
            "currentStepIndex": 3,
            "steps": tracking_steps,
        },
        "createdAt": now,
        "updatedAt": now,
    }


def _get_or_create_garage(user: Dict[str, Any]) -> Dict[str, Any]:
    user_id = user.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise ValueError("Usuario sem identificador valido.")

    table = _get_garage_table()
    result = table.get_item(Key={"userId": user_id})
    item = result.get("Item")
    if item:
        return item

    garage = _build_demo_garage(user)
    try:
        table.put_item(
            Item=garage,
            ConditionExpression="attribute_not_exists(userId)",
        )
        return garage
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] != "ConditionalCheckFailedException":
            raise
        result = table.get_item(Key={"userId": user_id})
        item = result.get("Item")
        if item:
            return item
        raise


def _get_user_from_access_token(access_token: str, *, link_if_needed: bool = False) -> Dict[str, Any]:
    cognito_user = cognito_client.get_user(AccessToken=access_token)
    if link_if_needed:
        _link_federated_user_if_needed(cognito_user)
    return _build_auth_user(cognito_user)


def _build_password_auth_candidates(email: str, users: list[Dict[str, Any]]) -> list[str]:
    candidates: list[str] = [email]
    for user in users:
        username = user.get("Username")
        if isinstance(username, str) and username and username not in candidates:
            candidates.append(username)
    return candidates


def _initiate_password_auth(username: str, password: str) -> Dict[str, Any]:
    return cognito_client.initiate_auth(
        ClientId=COGNITO_CLIENT_ID,
        AuthFlow="USER_PASSWORD_AUTH",
        AuthParameters={"USERNAME": username, "PASSWORD": password},
    )


def _check_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})

    users = _list_users_by_email(email)
    if not users:
        return _response(200, {"exists": False, "nextRoute": "/register"})

    has_local = any(not _is_federated_user(user) for user in users)
    has_federated = any(_is_federated_user(user) for user in users)
    return _response(
        200,
        {
            "exists": True,
            "nextRoute": "/login",
            "isFederated": has_federated and not has_local,
        },
    )


def _register(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _normalize_email(body.get("email", ""))
    password = body.get("password", "")
    name = (body.get("name", "") or "").strip()

    if not email or "@" not in email:
        return _response(400, {"message": "E-mail invalido."})
    if len(password) < 8:
        return _response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    if _list_users_by_email(email):
        return _response(409, {"message": "Usuario ja cadastrado."})

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

    users = _list_users_by_email(email)
    auth_result: Optional[Dict[str, Any]] = None
    last_auth_error: Optional[ClientError] = None
    last_auth_detail: Optional[Dict[str, str]] = None

    for username in _build_password_auth_candidates(email, users):
        try:
            auth_result = _initiate_password_auth(username, password)
            break
        except ClientError as error:
            detail = _map_client_error(error)
            if detail["code"] == "UserNotConfirmedException":
                return _response(
                    403,
                    {"message": "E-mail ainda nao verificado.", "code": "EMAIL_NOT_VERIFIED"},
                )
            if detail["code"] in ("NotAuthorizedException", "UserNotFoundException", "InvalidParameterException"):
                last_auth_error = error
                last_auth_detail = detail
                continue
            raise

    if auth_result is None:
        has_local = any(not _is_federated_user(user) for user in users)
        has_federated = any(_is_federated_user(user) for user in users)
        if has_federated and not has_local:
            return _response(
                409,
                {
                    "message": "Esta conta foi criada com Google. Entre com Google ou use a senha definida no seu perfil.",
                    "code": "FEDERATED_USER_NO_PASSWORD",
                },
            )
        if last_auth_detail and last_auth_detail["code"] in ("NotAuthorizedException", "UserNotFoundException"):
            return _response(401, {"message": "Credenciais invalidas."})
        if last_auth_error:
            raise last_auth_error
        return _response(401, {"message": "Credenciais invalidas."})

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


def _set_password(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    body = _parse_body(event)
    password = str(body.get("password", "")).strip()

    if len(password) < 8:
        return _response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    try:
        cognito_user = cognito_client.get_user(AccessToken=access_token)
        attrs = _parse_user_attributes(cognito_user.get("UserAttributes", []))
        email = _normalize_email(attrs.get("email", ""))
        username = cognito_user.get("Username")
        if not email:
            return _response(500, {"message": "Nao foi possivel identificar o usuario."})
        if not isinstance(username, str) or not username:
            return _response(500, {"message": "Nao foi possivel identificar o usuario."})

        if _is_federated_user(cognito_user):
            try:
                cognito_client.admin_update_user_attributes(
                    UserPoolId=COGNITO_USER_POOL_ID,
                    Username=username,
                    UserAttributes=[
                        {"Name": "email", "Value": email},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                )
            except ClientError as error:
                detail = _map_client_error(error)
                if detail["code"] != "AliasExistsException":
                    raise
                _log_error("Nao foi possivel verificar e-mail federado por alias existente.", event=event, error=error)

        cognito_client.admin_set_user_password(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=username,
            Password=password,
            Permanent=True,
        )
        return _response(200, {"message": "Senha definida com sucesso."})
    except ClientError as error:
        detail = _map_client_error(error)
        _log_error("Falha ao definir senha.", event=event, error=error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        if detail["code"] == "UserNotFoundException":
            return _response(409, {"message": "Conta nao encontrada para definir senha."})
        if detail["code"] in ("InvalidPasswordException", "InvalidParameterException"):
            return _response(400, {"message": detail["message"]})
        raise


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
        user = _get_user_from_access_token(access_token, link_if_needed=True)
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
        user = _get_user_from_access_token(access_token, link_if_needed=True)
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
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        if "sub" in user:
            profile = _get_profile(user["sub"])
            user["profile"] = _merge_profile_defaults(profile, user)
        return _response(200, {"user": user})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _garage_current(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        garage = _get_or_create_garage(user)
        return _response(200, {"garage": garage})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def _garage_status(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = _extract_token(event)
    if not access_token:
        return _response(401, {"message": "Token nao informado."})

    try:
        user = _get_user_from_access_token(access_token, link_if_needed=True)
        garage = _get_or_create_garage(user)
        return _response(200, {"tracking": garage.get("tracking", {})})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return _response(401, {"message": "Sessao invalida ou expirada."})
        raise


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context
    trigger_source = event.get("triggerSource", "")
    if isinstance(trigger_source, str) and trigger_source.startswith("PreSignUp_"):
        if not COGNITO_USER_POOL_ID:
            raise ValueError("COGNITO_USER_POOL_ID nao configurado.")
        return _handle_pre_sign_up(event)

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
        if method == "POST" and path == "/auth/set-password":
            return _set_password(event)
        if method == "GET" and path == "/profile":
            return _read_profile(event)
        if method == "PUT" and path == "/profile":
            return _save_profile(event)
        if method == "GET" and path == "/me":
            return _me(event)
        if method == "GET" and path == "/garage/current":
            return _garage_current(event)
        if method == "GET" and path == "/garage/status":
            return _garage_status(event)
        return _response(404, {"message": "Rota nao encontrada."})
    except (ClientError, ValueError, TypeError, json.JSONDecodeError) as error:
        _log_error("Erro interno.", event=event, error=error)
        return _response(500, {"message": "Erro interno.", "detail": str(error)})
