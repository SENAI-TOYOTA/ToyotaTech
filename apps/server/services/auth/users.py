from typing import Any, Dict, List, Optional

from botocore.exceptions import ClientError

from common.cognito import cognito_client, COGNITO_USER_POOL_ID, is_federated
from common.responses import error_body


def matches_email(user: Dict[str, Any], email: str) -> bool:
    from common.cognito import parse_attributes

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
    found: Dict[str, Dict[str, Any]] = {}

    def add(user: Dict[str, Any]) -> None:
        username = user.get("Username")
        if isinstance(username, str) and username and matches_email(user, email):
            found[username] = user

    try:
        add(cognito_client.admin_get_user(UserPoolId=COGNITO_USER_POOL_ID, Username=email))
    except ClientError as error:
        code, _ = error_body(error)
        if code != "UserNotFoundException":
            raise

    result = cognito_client.list_users(
        UserPoolId=COGNITO_USER_POOL_ID,
        Filter=f'email = "{email}"',
        Limit=10,
    )
    for user in result.get("Users", []):
        add(user)

    for user in scan_by_email(email):
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
