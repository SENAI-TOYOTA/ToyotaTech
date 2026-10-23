import os
from typing import Any, Dict, Optional

import boto3

from .responses import error_body, log_error

COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "").strip()
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "").strip()
REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))

cognito_client = boto3.client("cognito-idp", region_name=REGION)


def extract_token(event: Dict[str, Any]) -> Optional[str]:
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization") or ""
    auth_header = auth_header.strip()
    if not auth_header:
        return None
    prefix = "bearer "
    if not auth_header.lower().startswith(prefix):
        return None
    return auth_header[len(prefix) :].strip()


def parse_attributes(user_data: Any) -> Dict[str, str]:
    attributes = user_data if isinstance(user_data, list) else []
    parsed: Dict[str, str] = {}
    for item in attributes:
        name, value = item.get("Name"), item.get("Value")
        if isinstance(name, str) and isinstance(value, str):
            parsed[name] = value
    return parsed


def build_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    attrs = parse_attributes(user_data.get("UserAttributes", []))
    email = attrs.get("email") or user_data.get("Username", "")
    user: Dict[str, Any] = {
        "email": email,
        "name": attrs.get("name", ""),
        "isVerified": attrs.get("email_verified", "false").strip().lower() == "true",
    }
    if "sub" in attrs:
        user["sub"] = attrs["sub"]
    return user


def is_federated(user_data: Dict[str, Any]) -> bool:
    if str(user_data.get("UserStatus", "") or "") == "EXTERNAL_PROVIDER":
        return True
    username = user_data.get("Username")
    return isinstance(username, str) and username.lower().startswith("google_")


def warn_link_failure(error: Exception) -> None:
    code, _ = error_body(error)
    if code in (
        "ResourceNotFoundException",
        "ResourceConflictException",
        "AliasExistsException",
        "InvalidParameterException",
    ):
        print(f"Warning: failed to link IdP: {code}")
        return
    raise error


def link_provider(
    local_username: str, provider_name: str, provider_user_id: str
) -> None:
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


def get_user_by_access_token(access_token: str) -> Dict[str, Any]:
    return cognito_client.get_user(AccessToken=access_token)


def initiate_auth(auth_flow: str, params: Dict[str, str]) -> Dict[str, Any]:
    return cognito_client.initiate_auth(
        ClientId=COGNITO_CLIENT_ID, AuthFlow=auth_flow, AuthParameters=params
    )


__all__ = [
    "COGNITO_CLIENT_ID",
    "COGNITO_USER_POOL_ID",
    "cognito_client",
    "extract_token",
    "parse_attributes",
    "build_user",
    "is_federated",
    "warn_link_failure",
    "link_provider",
    "get_user_by_access_token",
    "initiate_auth",
    "log_error",
]
