import json
from typing import Any, Dict, Optional

from botocore.exceptions import ClientError

from common.cognito import (
    COGNITO_USER_POOL_ID,
    is_federated,
    link_provider,
    log_error,
    parse_attributes,
    warn_link_failure,
)
from common.responses import error_body


def _provider_identity(attrs: Dict[str, str]) -> Optional[Dict[str, str]]:
    try:
        identities = json.loads(attrs.get("identities") or "null")
    except (TypeError, ValueError):
        return None
    identity = identities[0] if isinstance(identities, list) and identities else None
    if not isinstance(identity, dict):
        return None
    name, user_id = identity.get("providerName"), identity.get("userId")
    if isinstance(name, str) and isinstance(user_id, str):
        return {"providerName": name, "providerUserId": user_id}
    return None


def _link_federated_to_local_if_needed(federated_user: Dict[str, Any]) -> None:
    attrs = parse_attributes(federated_user.get("UserAttributes", []))
    email = attrs.get("email", "").strip().lower()
    identity = _provider_identity(attrs) if email else None
    if not identity or identity["providerName"] != "Google":
        return

    from .users import find_local_by_email

    local = find_local_by_email(email)
    local_username = (local or {}).get("Username")
    federated_username = federated_user.get("Username")
    if not isinstance(local_username, str) or local_username == federated_username:
        return
    try:
        link_provider(local_username, identity["providerName"], identity["providerUserId"])
    except ClientError as error:
        warn_link_failure(error)


def _parse_provider_username(username: str) -> Optional[Dict[str, str]]:
    provider_name, _, provider_user_id = username.partition("_")
    if provider_name and provider_user_id:
        return {"providerName": provider_name, "providerUserId": provider_user_id}
    return None


def pre_sign_up(event: Dict[str, Any]) -> Dict[str, Any]:
    trigger_source = event.get("triggerSource")
    request = event.get("request") or {}
    event_response = event.setdefault("response", {})
    email = str((request.get("userAttributes") or {}).get("email", "")).strip().lower()

    if not email or "@" not in email or trigger_source not in ("PreSignUp_SignUp", "PreSignUp_ExternalProvider"):
        return event

    from .users import find_by_email, find_local_by_email

    users = find_by_email(email)

    if trigger_source == "PreSignUp_SignUp":
        if users:
            raise ValueError("Usuário já cadastrado com este e-mail.")
        return event

    local = next((user for user in users if not is_federated(user)), None)
    provider_identity = _parse_provider_username(str(event.get("userName", "")))
    if not local or not provider_identity:
        return event

    try:
        link_provider(local["Username"], provider_identity["providerName"], provider_identity["providerUserId"])
        event_response["autoConfirmUser"] = True
        event_response["autoVerifyEmail"] = True
    except ClientError as error:
        code, _ = error_body(error)
        if code == "ResourceConflictException":
            return event
        log_error("Falha ao vincular provedor no PreSignUp.", event=event, error=error)
        raise

    return event


__all__ = ["pre_sign_up", "_link_federated_to_local_if_needed"]
