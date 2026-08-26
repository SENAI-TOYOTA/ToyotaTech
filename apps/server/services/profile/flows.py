import os
import time
from typing import Any, Dict

from botocore.exceptions import ClientError

from common.cognito import (
    build_user,
    get_user_by_access_token,
    extract_token,
    parse_attributes,
)
from common.cognito_users import link_federated_if_needed
from common.ddb import get_table
from common.responses import ApiError, error_body, parse_body, require
import os

PROFILE_TABLE_NAME = os.environ.get("PROFILE_TABLE_NAME", "").strip()

from . import validation


def authenticated_user(event: Dict[str, Any]) -> Dict[str, Any]:
    access_token = extract_token(event)
    require(bool(access_token), 401, "Token não informado.")

    try:
        cognito_user = get_user_by_access_token(access_token)
        link_federated_if_needed(cognito_user)
        return build_user(cognito_user)
    except ClientError as error:
        code, _ = error_body(error)
        if code == "NotAuthorizedException":
            raise ApiError(401, "Sessão inválida ou expirada.")
        raise


def _get_profile(user_id: str) -> Dict[str, str]:
    item = (get_table(PROFILE_TABLE_NAME).get_item(Key={"userId": user_id})).get("Item") or {}
    return {
        "fullName": str(item.get("fullName", "") or ""),
        "birthDate": validation.normalize_birth_date(item.get("birthDate", "")),
        "cpf": validation.normalize_cpf(item.get("cpf", "")),
    }


def read_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    user_id = user.get("sub")
    require(isinstance(user_id, str) and bool(user_id), 500, "Usuário sem identificador válido.")

    return {"profile": _get_profile(user_id)}


def save_profile(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    user_id = user.get("sub")
    require(isinstance(user_id, str) and bool(user_id), 500, "Usuário sem identificador válido.")

    body = parse_body(event)
    updates: Dict[str, str] = {}

    if "fullName" in body:
        require(isinstance(body.get("fullName"), str), 400, "Nome completo inválido.")
        updates["fullName"] = body.get("fullName", "").strip()

    if "birthDate" in body:
        require(isinstance(body.get("birthDate"), str), 400, "Data de nascimento inválida.")
        normalized, error_message = validation.validate_birth_date(body.get("birthDate", ""))
        if error_message:
            raise ApiError(400, error_message)
        updates["birthDate"] = normalized or ""

    if "cpf" in body:
        require(isinstance(body.get("cpf"), str), 400, "CPF inválido.")
        normalized_cpf = validation.normalize_cpf(body.get("cpf", ""))
        require(len(normalized_cpf) == 11, 400, "CPF inválido.")
        updates["cpf"] = normalized_cpf

    require(bool(updates), 400, "Nenhum campo de perfil informado.")

    existing = _get_profile(user_id)
    existing_cpf = validation.normalize_cpf(existing.get("cpf"))
    incoming_cpf = validation.normalize_cpf(updates.get("cpf", ""))
    require(
        not (incoming_cpf and existing_cpf and incoming_cpf != existing_cpf),
        409,
        "CPF não pode ser alterado depois de vinculado ao perfil.",
    )

    profile = {
        "fullName": updates.get("fullName", existing.get("fullName", "")),
        "birthDate": updates.get("birthDate", existing.get("birthDate", "")),
        "cpf": existing_cpf or updates.get("cpf", ""),
    }

    try:
        table = get_table(PROFILE_TABLE_NAME)
        table.put_item(
            Item={
                "userId": user_id,
                **profile,
                "updatedAt": int(time.time()),
            }
        )
        return {"profile": profile}
    except ClientError as error:
        code, _ = error_body(error)
        if code == "NotAuthorizedException":
            raise ApiError(401, "Sessão inválida ou expirada.")
        raise


def me(event: Dict[str, Any]) -> Dict[str, Any]:
    user = authenticated_user(event)
    if "sub" in user:
        user["profile"] = _get_profile(user["sub"])
    return {"user": user}
