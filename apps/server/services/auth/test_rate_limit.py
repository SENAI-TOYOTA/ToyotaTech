import importlib
import json
import time
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
from botocore.exceptions import ClientError

handler = importlib.import_module("services.auth.handler")
ratelimit = importlib.import_module("common.ratelimit")
flows = importlib.import_module("flows")


def api_event(method, path, body=None, source_ip="1.2.3.4"):
    payload = json.dumps(body) if body is not None else None
    return {
        "rawPath": path,
        "requestContext": {
            "http": {"method": method, "sourceIp": source_ip},
            "requestId": "req-rl",
        },
        "body": payload,
    }


def parse_response(result):
    return json.loads(result["body"]) if result.get("body") else {}


def test_rate_limit_disabled_without_table():
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", ""):
        ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")


def test_rate_limit_creates_first_hit():
    table = MagicMock()
    table.get_item.return_value = {}
    table.put_item.return_value = {}
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateTable"):
        with patch.object(ratelimit, "get_table", return_value=table):
            ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")
    table.put_item.assert_called_once()
    item = table.put_item.call_args.kwargs["Item"]
    assert item["tokens"] == Decimal(str(ratelimit.CAPACITY - 1))
    assert isinstance(item["last_refill"], Decimal)
    assert item["pk"] == "POST /auth/login#1.2.3.4"
    assert item["ttl"] > int(time.time())


def test_rate_limit_allows_when_tokens_available():
    table = MagicMock()
    now = time.time()
    table.get_item.return_value = {
        "Item": {"pk": "k", "tokens": 5.0, "last_refill": now, "ttl": 1}
    }
    table.update_item.return_value = {}
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateTable"):
        with patch.object(ratelimit, "get_table", return_value=table):
            ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")
    table.update_item.assert_called_once()


def test_rate_limit_returns_429_when_exhausted():
    table = MagicMock()
    now = time.time()
    table.get_item.return_value = {
        "Item": {"pk": "k", "tokens": 0.0, "last_refill": now, "ttl": 1}
    }
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateTable"):
        with patch.object(ratelimit, "get_table", return_value=table):
            with pytest.raises(ratelimit.ApiError) as excinfo:
                ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")
    assert excinfo.value.status_code == 429
    assert excinfo.value.extra["retryAfter"] >= 1


def test_rate_limit_update_escapes_ttl_reserved_keyword():
    table = MagicMock()
    now = time.time()
    table.get_item.return_value = {
        "Item": {
            "pk": "k",
            "tokens": Decimal("5"),
            "last_refill": Decimal(str(now)),
            "ttl": 1,
        }
    }
    table.update_item.return_value = {}
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateTable"):
        with patch.object(ratelimit, "get_table", return_value=table):
            ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")
    kwargs = table.update_item.call_args.kwargs
    assert "#ttl" in kwargs["UpdateExpression"]
    assert kwargs["ExpressionAttributeNames"] == {"#ttl": "ttl"}


def test_rate_limit_store_client_error_propagates_from_enforce():
    error = ClientError(
        {"Error": {"Code": "ValidationException", "Message": "bad"}}, "UpdateItem"
    )
    table = MagicMock()
    table.get_item.side_effect = error
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateTable"):
        with patch.object(ratelimit, "get_table", return_value=table):
            with pytest.raises(ClientError):
                ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")


def test_rate_limit_store_client_error_handler_fails_open():
    event = api_event(
        "POST", "/auth/login", {"email": "a@b.com", "password": "StrongPass123"}
    )
    error = ClientError(
        {"Error": {"Code": "ValidationException", "Message": "bad"}}, "GetItem"
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "services.auth.handler.enforce_rate_limit", side_effect=error
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch(
                        "flows.initiate_auth",
                        return_value={
                            "AuthenticationResult": {
                                "AccessToken": "a",
                                "IdToken": "i",
                                "RefreshToken": "r",
                                "ExpiresIn": 3600,
                            }
                        },
                    ):
                        with patch(
                            "flows.get_user_by_access_token",
                            return_value={"UserAttributes": []},
                        ):
                            with patch("flows.build_user", return_value={}):
                                with patch("flows._profile", return_value={}):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_rate_limit_refills_when_elapsed():
    table = MagicMock()
    now = time.time()
    table.get_item.return_value = {
        "Item": {"pk": "k", "tokens": 0.0, "last_refill": now - 5, "ttl": 1}
    }
    table.update_item.return_value = {}
    with patch.object(ratelimit, "RATE_LIMIT_TABLE_NAME", "RateTable"):
        with patch.object(ratelimit, "get_table", return_value=table):
            ratelimit.enforce_rate_limit("1.2.3.4", "POST /auth/login")
    table.update_item.assert_called_once()


def test_rate_limit_handler_returns_429_with_retry_after():
    event = api_event(
        "POST", "/auth/login", {"email": "a@b.com", "password": "StrongPass123"}
    )
    api_error = ratelimit.ApiError(429, "Muitas requisições.", {"retryAfter": 30})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            with patch(
                "services.auth.handler.enforce_rate_limit", side_effect=api_error
            ):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429
    assert parse_response(result)["message"] == "Muitas requisições."
    assert result["headers"]["Retry-After"] == "30"


def test_rate_limit_handler_skips_for_options():
    event = api_event("OPTIONS", "/auth/login")
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            with patch("services.auth.handler.enforce_rate_limit") as mock_rl:
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 204
    mock_rl.assert_not_called()


def test_login_cognito_throttling_returns_429():
    event = api_event(
        "POST", "/auth/login", {"email": "a@b.com", "password": "StrongPass123"}
    )
    error = ClientError(
        {"Error": {"Code": "TooManyRequestsException", "Message": "Throttled"}},
        "InitiateAuth",
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("flows.initiate_auth", side_effect=error):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch(
                        "services.auth.handler.enforce_rate_limit", return_value=None
                    ):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429
    assert parse_response(result)["message"] == "Muitas requisições."
    assert result["headers"]["Retry-After"] == "60"


def test_refresh_cognito_throttling_returns_429():
    event = api_event("POST", "/auth/refresh", {"refreshToken": "abc"})
    error = ClientError(
        {"Error": {"Code": "LimitExceededException", "Message": "Limit"}},
        "InitiateAuth",
    )
    with patch("flows.initiate_auth", side_effect=error):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                with patch(
                    "services.auth.handler.enforce_rate_limit", return_value=None
                ):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429
    assert result["headers"]["Retry-After"] == "60"


def test_verify_email_cognito_throttling_returns_429():
    event = api_event("POST", "/auth/verify-email", {"email": "a@b.com", "code": "1"})
    error = ClientError(
        {"Error": {"Code": "TooManyRequestsException", "Message": "Throttled"}},
        "ConfirmSignUp",
    )
    with patch("common.cognito.cognito_client.confirm_sign_up", side_effect=error):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                with patch(
                    "services.auth.handler.enforce_rate_limit", return_value=None
                ):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429


def test_resend_cognito_throttling_returns_429():
    event = api_event("POST", "/auth/resend-verification", {"email": "a@b.com"})
    error = ClientError(
        {"Error": {"Code": "TooManyRequestsException", "Message": "Throttled"}},
        "ResendConfirmationCode",
    )
    with patch(
        "common.cognito.cognito_client.resend_confirmation_code", side_effect=error
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                with patch(
                    "services.auth.handler.enforce_rate_limit", return_value=None
                ):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429


def test_set_password_cognito_throttling_returns_429():
    event = {
        "rawPath": "/auth/set-password",
        "requestContext": {
            "http": {"method": "POST", "sourceIp": "1.2.3.4"},
            "requestId": "req-rl",
        },
        "headers": {"authorization": "Bearer tok"},
        "body": json.dumps({"password": "StrongPass123"}),
    }
    error = ClientError(
        {"Error": {"Code": "TooManyRequestsException", "Message": "Throttled"}},
        "AdminSetUserPassword",
    )
    with patch(
        "flows.get_user_by_access_token",
        return_value={
            "Username": "user1",
            "UserAttributes": [
                {"Name": "email", "Value": "a@b.com"},
                {"Name": "email_verified", "Value": "true"},
            ],
        },
    ):
        with patch(
            "common.cognito.cognito_client.admin_set_user_password", side_effect=error
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch(
                        "services.auth.handler.enforce_rate_limit", return_value=None
                    ):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429
    assert result["headers"]["Retry-After"] == "60"
