import json
import os
import time
from typing import Any, Dict, Optional

from botocore.exceptions import ClientError

from shared.response import response, log_error, parse_body
from shared.cognito import (
    COGNITO_CLIENT_ID,
    COGNITO_USER_POOL_ID,
    cognito_client,
    extract_token,
    build_auth_user,
)
from shared.dynamodb import get_table

PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()


def _map_client_error(error: ClientError) -> Dict[str, str]:
    payload = error.response.get("Error", {})
    return {
        "code": payload.get("Code", "Unknown"),
        "message": payload.get("Message", "Erro desconhecido."),
    }


def _user_matches_email(user: Dict[str, Any], target_email: str) -> bool:
    attrs = parse_user_attributes(user.get("UserAttributes") or user.get("Attributes") or [])
    email = attrs.get("email", "").strip().lower()
    if email and email == target_email:
        return True
    username = user.get("Username")
    return isinstance(username, str) and username.strip().lower() == target_email


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
        for user in result.get("Users", []):
            if _user_matches_email(user, target_email):
                matches.append(user)
        if matches:
            return matches
        token = result.get("PaginationToken")
        if not token:
            break
    return matches


def _list_users_by_email(email: str) -> list[Dict[str, Any]]:
    normalized_email = email.strip().lower()
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
    attrs = parse_user_attributes(user_data.get("UserAttributes", []))
    email = attrs.get("email", "").strip().lower()
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


def handle_pre_sign_up(event: Dict[str, Any]) -> Dict[str, Any]:
    trigger_source = event.get("triggerSource")
    request = event.get("request") or {}
    event_response = event.setdefault("response", {})
    user_attributes = request.get("userAttributes") or {}
    email = str(user_attributes.get("email", "")).strip().lower()

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
        event_response["autoConfirmUser"] = True
        event_response["autoVerifyEmail"] = True
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "ResourceConflictException":
            return event
        log_error("Falha ao vincular provedor no PreSignUp.", event=event, error=error)
        raise

    return event


def _get_profile(user_id: str) -> Dict[str, str]:
    table = get_table(PROFILE_TABLE_NAME)
    result = table.get_item(Key={"userId": user_id})
    item = result.get("Item") or {}
    birth_date = str(item.get("birthDate", "") or "")
    cpf = item.get("cpf", "")
    return {
        "fullName": str(item.get("fullName", "") or ""),
        "birthDate": birth_date,
        "cpf": str(cpf or ""),
    }


def get_user_from_access_token(access_token: str, *, link_if_needed: bool = False) -> Dict[str, Any]:
    cognito_user = cognito_client.get_user(AccessToken=access_token)
    if link_if_needed:
        _link_federated_user_if_needed(cognito_user)
    return build_auth_user(cognito_user)


def _build_password_auth_candidates(email: str, users: list[Dict[str, Any]]) -> list[str]:
    candidates: list[str] = [email]
    for user in users:
        username = user.get("Username")
        if isinstance(username, str) and username and username not in candidates:
            candidates.append(username)
    return candidates


def check_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    if not email or "@" not in email:
        return response(400, {"message": "E-mail invalido."})

    users = _list_users_by_email(email)
    if not users:
        return response(200, {"exists": False, "nextRoute": "/register"})

    has_local = any(not _is_federated_user(user) for user in users)
    has_federated = any(_is_federated_user(user) for user in users)
    return response(
        200,
        {
            "exists": True,
            "nextRoute": "/login",
            "isFederated": has_federated and not has_local,
        },
    )


def register(body: Dict[str, Any]) -> Dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")
    name = (body.get("name", "") or "").strip()

    if not email or "@" not in email:
        return response(400, {"message": "E-mail invalido."})
    if len(password) < 8:
        return response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    if _list_users_by_email(email):
        return response(409, {"message": "Usuario ja cadastrado."})

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
            return response(409, {"message": "Usuario ja cadastrado."})
        if detail["code"] in ("InvalidPasswordException", "InvalidParameterException"):
            return response(400, {"message": detail["message"]})
        raise

    return response(
        201,
        {
            "message": "Usuario cadastrado. Verifique seu e-mail para concluir o acesso.",
            "requiresEmailVerification": not bool(sign_up.get("UserConfirmed")),
        },
    )


def verify_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    verification_code = str(body.get("code", "")).strip()

    if not email or "@" not in email:
        return response(400, {"message": "E-mail invalido."})
    if not verification_code:
        return response(400, {"message": "Codigo de verificacao obrigatorio."})

    try:
        cognito_client.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            ConfirmationCode=verification_code,
        )
        return response(200, {"message": "E-mail verificado com sucesso."})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "CodeMismatchException":
            return response(400, {"message": "Codigo invalido."})
        if detail["code"] == "ExpiredCodeException":
            return response(400, {"message": "Codigo expirado. Solicite novo codigo."})
        if detail["code"] == "UserNotFoundException":
            return response(404, {"message": "Usuario nao encontrado."})
        if detail["code"] == "NotAuthorizedException":
            return response(200, {"message": "E-mail ja verificado."})
        raise


def resend_verification(body: Dict[str, Any]) -> Dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    if not email or "@" not in email:
        return response(400, {"message": "E-mail invalido."})

    try:
        cognito_client.resend_confirmation_code(ClientId=COGNITO_CLIENT_ID, Username=email)
        return response(200, {"message": "Codigo reenviado."})
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "UserNotFoundException":
            return response(404, {"message": "Usuario nao encontrado."})
        if detail["code"] == "InvalidParameterException":
            return response(409, {"message": "E-mail ja verificado."})
        if detail["code"] == "NotAuthorizedException":
            return response(409, {"message": "Nao foi possivel reenviar o codigo no momento."})
        raise


def login(body: Dict[str, Any]) -> Dict[str, Any]:
    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return response(400, {"message": "Informe e-mail e senha."})

    users = _list_users_by_email(email)
    auth_result: Optional[Dict[str, Any]] = None
    last_auth_error: Optional[ClientError] = None
    last_auth_detail: Optional[Dict[str, str]] = None

    for username in _build_password_auth_candidates(email, users):
        try:
            auth_result = cognito_client.initiate_auth(
                ClientId=COGNITO_CLIENT_ID,
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={"USERNAME": username, "PASSWORD": password},
            )
            break
        except ClientError as error:
            detail = _map_client_error(error)
            if detail["code"] == "UserNotConfirmedException":
                return response(
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
            return response(
                409,
                {
                    "message": "Esta conta foi criada com Google. Entre com Google ou use a senha definida no seu perfil.",
                    "code": "FEDERATED_USER_NO_PASSWORD",
                },
            )
        if last_auth_detail and last_auth_detail["code"] in ("NotAuthorizedException", "UserNotFoundException"):
            return response(401, {"message": "Credenciais invalidas."})
        if last_auth_error:
            raise last_auth_error
        return response(401, {"message": "Credenciais invalidas."})

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    refresh_token = authentication.get("RefreshToken")
    expires_in = int(authentication.get("ExpiresIn", 3600))

    if not access_token or not id_token or not refresh_token:
        return response(500, {"message": "Resposta invalida do provedor de autenticacao."})

    user = get_user_from_access_token(access_token)
    if "sub" in user:
        profile = _get_profile(user["sub"])
        user["profile"] = profile
    return response(
        200,
        {
            "accessToken": access_token,
            "idToken": id_token,
            "refreshToken": refresh_token,
            "expiresAt": int(time.time()) + expires_in,
            "user": user,
        },
    )


def set_password(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = extract_token(event)
    if not access_token:
        return response(401, {"message": "Token nao informado."})

    body = parse_body(event)
    password = str(body.get("password", "")).strip()

    if len(password) < 8:
        return response(400, {"message": "A senha deve ter ao menos 8 caracteres."})

    try:
        cognito_user = cognito_client.get_user(AccessToken=access_token)
        attrs = parse_user_attributes(cognito_user.get("UserAttributes", []))
        email = attrs.get("email", "").strip().lower()
        username = cognito_user.get("Username")
        if not email:
            return response(500, {"message": "Nao foi possivel identificar o usuario."})
        if not isinstance(username, str) or not username:
            return response(500, {"message": "Nao foi possivel identificar o usuario."})

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
                log_error("Nao foi possivel verificar e-mail federado por alias existente.", event=event, error=error)

        cognito_client.admin_set_user_password(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=username,
            Password=password,
            Permanent=True,
        )
        return response(200, {"message": "Senha definida com sucesso."})
    except ClientError as error:
        detail = _map_client_error(error)
        log_error("Falha ao definir senha.", event=event, error=error)
        if detail["code"] == "NotAuthorizedException":
            return response(401, {"message": "Sessao invalida ou expirada."})
        if detail["code"] == "UserNotFoundException":
            return response(409, {"message": "Conta nao encontrada para definir senha."})
        if detail["code"] in ("InvalidPasswordException", "InvalidParameterException"):
            return response(400, {"message": detail["message"]})
        raise


def refresh(body: Dict[str, Any]) -> Dict[str, Any]:
    refresh_token = str(body.get("refreshToken", "")).strip()
    if not refresh_token:
        return response(400, {"message": "Refresh token obrigatorio."})

    try:
        auth_result = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="REFRESH_TOKEN_AUTH",
            AuthParameters={"REFRESH_TOKEN": refresh_token},
        )
    except ClientError as error:
        detail = _map_client_error(error)
        if detail["code"] == "NotAuthorizedException":
            return response(401, {"message": "Sessao invalida ou expirada."})
        raise

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    expires_in = int(authentication.get("ExpiresIn", 3600))

    if not access_token or not id_token:
        return response(500, {"message": "Resposta invalida do provedor de autenticacao."})

    return response(
        200,
        {
            "accessToken": access_token,
            "idToken": id_token,
            "expiresAt": int(time.time()) + expires_in,
        },
    )


ROUTES = {
    "POST /auth/check-email": lambda event: check_email(parse_body(event)),
    "POST /auth/register": lambda event: register(parse_body(event)),
    "POST /auth/login": lambda event: login(parse_body(event)),
    "POST /auth/verify-email": lambda event: verify_email(parse_body(event)),
    "POST /auth/resend-verification": lambda event: resend_verification(parse_body(event)),
    "POST /auth/refresh": lambda event: refresh(parse_body(event)),
    "POST /auth/set-password": set_password,
}


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    _ = context
    trigger_source = event.get("triggerSource", "")
    if isinstance(trigger_source, str) and trigger_source.startswith("PreSignUp_"):
        if not COGNITO_USER_POOL_ID:
            raise ValueError("COGNITO_USER_POOL_ID nao configurado.")
        return handle_pre_sign_up(event)

    if not COGNITO_USER_POOL_ID or not COGNITO_CLIENT_ID:
        return response(500, {"message": "Configuracao Cognito ausente."})

    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return response(204, {})

    handler_fn = ROUTES.get(f"{method} {path}")
    if handler_fn is None:
        return response(404, {"message": "Rota nao encontrada."})

    try:
        return handler_fn(event)
    except (ClientError, ValueError, TypeError, json.JSONDecodeError) as error:
        log_error("Erro interno.", event=event, error=error)
        return response(500, {"message": "Erro interno."})
