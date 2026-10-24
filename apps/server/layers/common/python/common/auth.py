from typing import Any, Dict

from botocore.exceptions import ClientError

from .cognito import build_user, extract_token, get_user_by_access_token
from .cognito_users import link_federated_if_needed
from .responses import ApiError, error_body, require


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
