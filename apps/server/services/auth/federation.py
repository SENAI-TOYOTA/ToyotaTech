from typing import Any, Dict

from botocore.exceptions import ClientError

from common.cognito import is_federated, link_provider, log_error
from common.cognito_users import find_by_email
from common.responses import error_body


def pre_sign_up(event: Dict[str, Any]) -> Dict[str, Any]:
    trigger_source = event.get("triggerSource")
    request = event.get("request") or {}
    event_response = event.setdefault("response", {})
    email = str((request.get("userAttributes") or {}).get("email", "")).strip().lower()

    if (
        not email
        or "@" not in email
        or trigger_source not in ("PreSignUp_SignUp", "PreSignUp_ExternalProvider")
    ):
        return event

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
        link_provider(
            local["Username"],
            provider_identity["providerName"],
            provider_identity["providerUserId"],
        )
        event_response["autoConfirmUser"] = True
        event_response["autoVerifyEmail"] = True
    except ClientError as error:
        code, _ = error_body(error)
        if code == "ResourceConflictException":
            return event
        log_error("Falha ao vincular provedor no PreSignUp.", event=event, error=error)
        raise

    return event


def _parse_provider_username(username: str) -> dict | None:
    provider_name, _, provider_user_id = username.partition("_")
    if provider_name and provider_user_id:
        return {"providerName": provider_name, "providerUserId": provider_user_id}
    return None
