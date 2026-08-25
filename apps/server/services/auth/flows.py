import os
import re
import time
from typing import Any, Dict

from botocore.exceptions import ClientError

from common.cognito import (
    COGNITO_CLIENT_ID,
    COGNITO_USER_POOL_ID,
    build_user,
    get_user_by_access_token,
    initiate_auth,
    is_federated,
    parse_attributes,
)
from common.ddb import get_table
from common.responses import ApiError, error_body, parse_body, require

PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()

FEDERATED_MESSAGE = (
    "Esta conta foi criada com Google. Entre com Google ou use a senha definida no seu perfil."
)


def _email(body: Dict[str, Any]) -> str:
    email = str(body.get("email", "")).strip().lower()
    require(bool(email) and "@" in email, 400, "E-mail inválido.")
    return email


def _normalize_cpf(value: Any) -> str:
    text = str(value or "").strip()
    return re.sub(r"\D+", "", text)[:11]


def _normalize_birth_date(value: Any) -> str:
    text = str(value or "").strip()
    digits = re.sub(r"\D+", "", text)
    if len(digits) == 8:
        return f"{digits[:2]}/{digits[2:4]}/{digits[4:]}"
    return text


def _profile(user_id: str) -> Dict[str, str]:
    item = (get_table(PROFILE_TABLE_NAME).get_item(Key={"userId": user_id})).get("Item") or {}
    return {
        "fullName": str(item.get("fullName", "") or ""),
        "birthDate": _normalize_birth_date(item.get("birthDate", "")),
        "cpf": _normalize_cpf(item.get("cpf", "")),
    }


def check_email(body: Dict[str, Any]) -> Dict[str, Any]:
    from .users import find_by_email, is_federated as _f

    email = _email(body)
    users = find_by_email(email)
    if not users:
        return {"exists": False, "nextRoute": "/register"}

    has_local = any(not _f(user) for user in users)
    has_federated = any(_f(user) for user in users)
    return {
        "exists": True,
        "nextRoute": "/login",
        "isFederated": has_federated and not has_local,
    }


def register(body: Dict[str, Any]) -> Dict[str, Any]:
    from .users import find_by_email

    email = _email(body)
    password = body.get("password", "")
    name = (body.get("name", "") or "").strip()
    require(len(password) >= 8, 400, "A senha deve ter ao menos 8 caracteres.")
    require(not find_by_email(email), 409, "Usuário já cadastrado.")

    attributes = [{"Name": "email", "Value": email}]
    if name:
        attributes.append({"Name": "name", "Value": name})

    from common.cognito import cognito_client

    try:
        sign_up = cognito_client.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=attributes,
        )
    except ClientError as error:
        code, message = error_body(error)
        if code == "UsernameExistsException":
            raise ApiError(409, "Usuário já cadastrado.")
        if code in ("InvalidPasswordException", "InvalidParameterException"):
            raise ApiError(400, message)
        raise

    return {
        "message": "Usuário cadastrado. Verifique seu e-mail para concluir o acesso.",
        "requiresEmailVerification": not bool(sign_up.get("UserConfirmed")),
    }


def verify_email(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _email(body)
    code_value = str(body.get("code", "")).strip()
    require(bool(code_value), 400, "Código de verificação obrigatório.")

    from common.cognito import cognito_client

    try:
        cognito_client.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID, Username=email, ConfirmationCode=code_value
        )
        return {"message": "E-mail verificado com sucesso."}
    except ClientError as error:
        code, _ = error_body(error)
        mapping = {
            "CodeMismatchException": (400, "Código inválido."),
            "ExpiredCodeException": (400, "Código expirado. Solicite novo código."),
            "UserNotFoundException": (404, "Usuário não encontrado."),
        }
        if code in mapping:
            status, message = mapping[code]
            raise ApiError(status, message)
        if code == "NotAuthorizedException":
            return {"message": "E-mail já verificado."}
        raise


def resend_verification(body: Dict[str, Any]) -> Dict[str, Any]:
    email = _email(body)

    from common.cognito import cognito_client

    try:
        cognito_client.resend_confirmation_code(ClientId=COGNITO_CLIENT_ID, Username=email)
        return {"message": "Código reenviado."}
    except ClientError as error:
        code, _ = error_body(error)
        mapping = {
            "UserNotFoundException": (404, "Usuário não encontrado."),
            "InvalidParameterException": (409, "E-mail já verificado."),
            "NotAuthorizedException": (409, "Não foi possível reenviar o código no momento."),
        }
        if code in mapping:
            status, message = mapping[code]
            raise ApiError(status, message)
        raise


def login(body: Dict[str, Any]) -> Dict[str, Any]:
    from .users import find_by_email, is_federated, password_auth_candidates

    email = str(body.get("email", "")).strip().lower()
    password = body.get("password", "")
    require(bool(email and password), 400, "Informe e-mail e senha.")

    users = find_by_email(email)
    auth_result: Dict[str, Any] | None = None
    last_code: str | None = None
    last_error: ClientError | None = None

    for username in password_auth_candidates(email, users):
        try:
            auth_result = initiate_auth(
                "USER_PASSWORD_AUTH", {"USERNAME": username, "PASSWORD": password}
            )
            break
        except ClientError as error:
            code, _ = error_body(error)
            if code == "UserNotConfirmedException":
                raise ApiError(403, "E-mail ainda não verificado.", {"code": "EMAIL_NOT_VERIFIED"})
            if code in ("NotAuthorizedException", "UserNotFoundException", "InvalidParameterException"):
                last_code, last_error = code, error
                continue
            raise

    if auth_result is None:
        federated_only = any(is_federated(user) for user in users) and not any(
            not is_federated(user) for user in users
        )
        if federated_only:
            raise ApiError(409, FEDERATED_MESSAGE, {"code": "FEDERATED_USER_NO_PASSWORD"})
        if last_code in ("NotAuthorizedException", "UserNotFoundException"):
            raise ApiError(401, "Credenciais inválidas.")
        if last_error:
            raise last_error
        raise ApiError(401, "Credenciais inválidas.")

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    refresh_token = authentication.get("RefreshToken")
    require(
        bool(access_token and id_token and refresh_token),
        500,
        "Resposta inválida do provedor de autenticação.",
    )

    user = build_user(get_user_by_access_token(access_token))
    if "sub" in user:
        user["profile"] = _profile(user["sub"])

    return {
        "accessToken": access_token,
        "idToken": id_token,
        "refreshToken": refresh_token,
        "expiresAt": int(time.time()) + int(authentication.get("ExpiresIn", 3600)),
        "user": user,
    }


def set_password(event: Dict[str, Any]) -> Dict[str, Any]:
    from common.cognito import extract_token, log_error

    access_token = extract_token(event)
    require(bool(access_token), 401, "Token não informado.")

    password = str(parse_body(event).get("password", "")).strip()
    require(len(password) >= 8, 400, "A senha deve ter ao menos 8 caracteres.")

    from common.cognito import cognito_client

    try:
        cognito_user = get_user_by_access_token(access_token)
        attrs = parse_attributes(cognito_user.get("UserAttributes", []))
        email = attrs.get("email", "").strip().lower()
        username = cognito_user.get("Username")
        require(bool(email), 500, "Não foi possível identificar o usuário.")
        require(isinstance(username, str) and bool(username), 500, "Não foi possível identificar o usuário.")

        if is_federated(cognito_user):
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
                code, _ = error_body(error)
                if code != "AliasExistsException":
                    raise
                log_error("Falha ao verificar e-mail federado por alias existente.", event=event, error=error)

        cognito_client.admin_set_user_password(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=username,
            Password=password,
            Permanent=True,
        )
        return {"message": "Senha definida com sucesso."}
    except ClientError as error:
        code, message = error_body(error)
        log_error("Falha ao definir senha.", event=event, error=error)
        mapping = {
            "NotAuthorizedException": (401, "Sessão inválida ou expirada."),
            "UserNotFoundException": (409, "Conta não encontrada para definir senha."),
            "InvalidPasswordException": (400, message),
            "InvalidParameterException": (400, message),
        }
        if code in mapping:
            status, msg = mapping[code]
            raise ApiError(status, msg)
        raise


def refresh(body: Dict[str, Any]) -> Dict[str, Any]:
    refresh_token = str(body.get("refreshToken", "")).strip()
    require(bool(refresh_token), 400, "Refresh token obrigatório.")

    try:
        auth_result = initiate_auth("REFRESH_TOKEN_AUTH", {"REFRESH_TOKEN": refresh_token})
    except ClientError as error:
        code, _ = error_body(error)
        if code == "NotAuthorizedException":
            raise ApiError(401, "Sessão inválida ou expirada.")
        raise

    authentication = auth_result.get("AuthenticationResult", {})
    access_token = authentication.get("AccessToken")
    id_token = authentication.get("IdToken")
    require(
        bool(access_token and id_token),
        500,
        "Resposta inválida do provedor de autenticação.",
    )

    return {
        "accessToken": access_token,
        "idToken": id_token,
        "expiresAt": int(time.time()) + int(authentication.get("ExpiresIn", 3600)),
    }
