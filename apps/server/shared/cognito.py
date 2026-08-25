from typing import Any, Dict, Optional

import boto3
import os

COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "").strip()
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "").strip()
COGNITO_REGION = os.environ.get("COGNITO_REGION", os.environ.get("AWS_REGION", "us-east-1"))

cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)


def extract_token(event: Dict[str, Any]) -> Optional[str]:
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization")
    if not auth_header:
        return None
    prefix = "bearer "
    if auth_header.lower().startswith(prefix):
        return auth_header[len(prefix) :].strip()
    return None


def parse_user_attributes(user_attributes: Any) -> Dict[str, str]:
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


def build_auth_user(user_data: Dict[str, Any], fallback_email: str = "") -> Dict[str, Any]:
    attrs = parse_user_attributes(user_data.get("UserAttributes", []))
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


def get_user_attributes(user_data: Dict[str, Any]) -> list[Dict[str, Any]]:
    attributes = user_data.get("UserAttributes")
    if not isinstance(attributes, list):
        attributes = user_data.get("Attributes")
    return attributes if isinstance(attributes, list) else []
