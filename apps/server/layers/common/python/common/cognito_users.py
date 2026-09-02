import json
from typing import Any, Dict, List, Optional

from botocore.exceptions import ClientError

from .cognito import (
    COGNITO_USER_POOL_ID,
    cognito_client,
    is_federated,
    link_provider,
    parse_attributes,
    warn_link_failure,
)
from .responses import error_body


def matches_email(user: Dict[str, Any], email: str) -> bool:
    attrs = parse_attributes(user.get("UserAttributes") or user.get("Attributes") or [])
    if attrs.get("email", "").strip().lower() == email:
        return True
    username = user.get("Username")
    return isinstance(username, str) and username.strip().lower() == email


def scan_by_email(email: str, *, max_pages: int = 10) -> List[Dict[str, Any]]:
    matches: List[Dict[str, Any]] = []
    token: Optional[str] = None
    pages = 0

    while pages < max_pages:
        pages += 1
        params: Dict[str, Any] = {"UserPoolId": COGNITO_USER_POOL_ID, "Limit": 60}
        if token:
            params["PaginationToken"] = token
        result = cognito_client.list_users(**params)
        for user in result.get("Users", []):
            if matches_email(user, email):
                matches.append(user)
        if matches:
            return matches
        token = result.get("PaginationToken")
        if not token:
            break
    return matches


def find_by_email(email: str) -> List[Dict[str, Any]]:
    normalized_email = email.strip().lower()
    found: Dict[str, Dict[str, Any]] = {}

    def add(user: Dict[str, Any]) -> None:
        username = user.get("Username")
        if (
            isinstance(username, str)
            and username
            and matches_email(user, normalized_email)
        ):
            found[username] = user

    try:
        add(
            cognito_client.admin_get_user(
                UserPoolId=COGNITO_USER_POOL_ID, Username=normalized_email
            )
        )
    except ClientError as error:
        code, _ = error_body(error)
        if code != "UserNotFoundException":
            raise

    escaped_email = normalized_email.replace('"', '\\"')
    result = cognito_client.list_users(
        UserPoolId=COGNITO_USER_POOL_ID,
        Filter=f'email = "{escaped_email}"',
        Limit=10,
    )
    for user in result.get("Users", []):
        add(user)

    if not found:
        for user in scan_by_email(normalized_email):
            add(user)

    return list(found.values())


def find_local_by_email(email: str) -> Optional[Dict[str, Any]]:
    return next((user for user in find_by_email(email) if not is_federated(user)), None)


def password_auth_candidates(email: str, users: List[Dict[str, Any]]) -> List[str]:
    candidates = [email]
    for user in users:
        username = user.get("Username")
        if isinstance(username, str) and username and username not in candidates:
            candidates.append(username)
    return candidates


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


def link_federated_if_needed(federated_user: Dict[str, Any]) -> None:
    attrs = parse_attributes(federated_user.get("UserAttributes", []))
    email = attrs.get("email", "").strip().lower()
    identity = _provider_identity(attrs) if email else None
    if not identity or identity["providerName"] != "Google":
        return

    local = find_local_by_email(email)
    local_username = (local or {}).get("Username")
    federated_username = federated_user.get("Username")
    if not isinstance(local_username, str) or local_username == federated_username:
        return
    try:
        link_provider(
            local_username, identity["providerName"], identity["providerUserId"]
        )
    except ClientError as error:
        warn_link_failure(error)
        return
