import base64
import importlib
import json
from unittest.mock import patch

handler = importlib.import_module("services.auth.handler")
flows = importlib.import_module("services.auth.flows")


def api_event(
    method, path, body=None, raw_body=None, headers=None, base64_encoded=False
):
    event = {
        "rawPath": path,
        "requestContext": {"http": {"method": method}, "requestId": "req-1"},
    }
    if raw_body is not None:
        event["body"] = raw_body
        event["isBase64Encoded"] = base64_encoded
    elif body is not None:
        if isinstance(body, dict):
            event["body"] = json.dumps(body, ensure_ascii=False)
        else:
            event["body"] = body
    if headers is not None:
        event["headers"] = headers
    return event


def parse_response(result):
    return json.loads(result["body"]) if result.get("body") else {}


def test_check_email_valid_new_user_returns_next_register():
    event = api_event(
        "POST", "/auth/check-email", body={"email": "newuser@example.com"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    body = parse_response(result)
    assert body["exists"] is False
    assert body["nextRoute"] == "/register"


def test_check_email_valid_existing_local_user():
    users = [
        {"Username": "user@example.com", "UserStatus": "CONFIRMED", "Attributes": []}
    ]
    event = api_event("POST", "/auth/check-email", body={"email": "user@example.com"})
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch("common.cognito_users.is_federated", return_value=False):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    body = parse_response(result)
    assert body["exists"] is True
    assert body["nextRoute"] == "/login"
    assert body["isFederated"] is False


def test_check_email_valid_federated_only():
    users = [
        {"Username": "Google_123", "UserStatus": "EXTERNAL_PROVIDER", "Attributes": []}
    ]
    event = api_event(
        "POST", "/auth/check-email", body={"email": "federated@example.com"}
    )
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch("common.cognito_users.is_federated", return_value=True):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    body = parse_response(result)
    assert body["exists"] is True
    assert body["isFederated"] is True


def test_check_email_case_insensitive_normalization():
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return []

    event = api_event("POST", "/auth/check-email", body={"email": "TeSt@Example.COM"})
    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert captured["email"] == "test@example.com"


def test_check_email_case_insensitive_with_spaces():
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return []

    event = api_event(
        "POST", "/auth/check-email", body={"email": "  USER@EXAMPLE.COM  "}
    )
    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert captured["email"] == "user@example.com"


def test_check_email_unicode_local_part():
    event = api_event("POST", "/auth/check-email", body={"email": "tést@example.com"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    body = parse_response(result)
    assert body["exists"] is False


def test_check_email_unicode_with_accents():
    event = api_event("POST", "/auth/check-email", body={"email": "ñoño@example.com"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert parse_response(result)["exists"] is False


def test_check_email_unicode_domain():
    event = api_event("POST", "/auth/check-email", body={"email": "user@exämple.com"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_unicode_emoji():
    event = api_event("POST", "/auth/check-email", body={"email": "test😀@example.com"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_long_email_64_chars():
    local = "a" * 64
    email = f"{local}@example.com"
    event = api_event("POST", "/auth/check-email", body={"email": email})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert parse_response(result)["exists"] is False


def test_check_email_long_email_254_chars():
    local = "a" * 64
    domain = "b" * 63 + "." + "c" * 63 + "." + "d" * 57 + ".com"
    email = f"{local}@{domain}"
    assert len(email) <= 254
    event = api_event("POST", "/auth/check-email", body={"email": email})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_long_email_320_chars_exceeds_standard():
    local = "a" * 64
    domain = "b" * 250 + ".com"
    email = f"{local}@{domain}"
    assert len(email) > 254
    event = api_event("POST", "/auth/check-email", body={"email": email})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_long_email_case_sensitivity():
    local = "A" * 64
    email = f"{local}@EXAMPLE.COM"
    captured = {}

    def fake_find(e):
        captured["email"] = e
        return []

    event = api_event("POST", "/auth/check-email", body={"email": email})
    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert captured["email"] == email.lower()


def test_check_email_invalid_missing_field():
    event = api_event("POST", "/auth/check-email", body={})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "E-mail inválido."


def test_check_email_invalid_empty_string():
    event = api_event("POST", "/auth/check-email", body={"email": ""})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_invalid_whitespace_only():
    event = api_event("POST", "/auth/check-email", body={"email": "   "})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_invalid_no_at_sign():
    event = api_event("POST", "/auth/check-email", body={"email": "invalidemail.com"})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_invalid_none_value():
    event = api_event("POST", "/auth/check-email", body={"email": None})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_invalid_numeric_value():
    event = api_event("POST", "/auth/check-email", body={"email": 12345})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_invalid_list_value():
    event = api_event("POST", "/auth/check-email", body={"email": ["a@b.com"]})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_invalid_only_at():
    event = api_event("POST", "/auth/check-email", body={"email": "@"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_extra_fields_ignored():
    body = {
        "email": "extra@example.com",
        "unexpected": "field",
        "foo": 123,
        "nested": {"a": 1},
    }
    event = api_event("POST", "/auth/check-email", body=body)
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert parse_response(result)["exists"] is False


def test_check_email_extra_fields_with_valid_email():
    body = {"email": "user@example.com", "extra": "x" * 1000, "array": [1, 2, 3]}
    users = [{"Username": "user@example.com", "UserStatus": "CONFIRMED"}]
    event = api_event("POST", "/auth/check-email", body=body)
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch("common.cognito_users.is_federated", return_value=False):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert parse_response(result)["exists"] is True


def test_check_email_body_as_dict_direct():
    event = {
        "rawPath": "/auth/check-email",
        "requestContext": {"http": {"method": "POST"}},
        "body": {"email": "dict@example.com"},
    }
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_body_none():
    event = {
        "rawPath": "/auth/check-email",
        "requestContext": {"http": {"method": "POST"}},
        "body": None,
    }
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_json_malformed_returns_500():
    event = api_event("POST", "/auth/check-email", raw_body="{ invalid json")
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_json_malformed_trailing_comma():
    event = api_event("POST", "/auth/check-email", raw_body='{"email": "a@b.com",}')
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_json_empty_string_body():
    event = api_event("POST", "/auth/check-email", raw_body="")
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_base64_encoded_valid():
    payload = json.dumps({"email": "b64@example.com"})
    encoded = base64.b64encode(payload.encode("utf-8")).decode("utf-8")
    event = api_event(
        "POST", "/auth/check-email", raw_body=encoded, base64_encoded=True
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_base64_encoded_malformed_json():
    encoded = base64.b64encode(b"{ not json").decode("utf-8")
    event = api_event(
        "POST", "/auth/check-email", raw_body=encoded, base64_encoded=True
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_check_email_plus_alias_and_dots():
    event = api_event(
        "POST", "/auth/check-email", body={"email": "user+alias.test@example.com"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_subdomain():
    event = api_event(
        "POST", "/auth/check-email", body={"email": "user@mail.example.co.uk"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_numeric_domain():
    event = api_event(
        "POST", "/auth/check-email", body={"email": "user@123.example.com"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_check_email_whitespace_and_newline_trim():
    event = api_event(
        "POST", "/auth/check-email", body={"email": "\n\t user@example.com \n"}
    )
    captured = {}

    def fake_find(e):
        captured["email"] = e
        return []

    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert captured["email"] == "user@example.com"


def test_check_email_flow_direct_unicode_normalization():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        result = flows.check_email({"email": "TÉST@EXAMPLE.COM"})
    assert result["exists"] is False


def test_check_email_flow_direct_long_unicode():
    long_local = "ü" * 50
    email = f"{long_local}@example.com"
    with patch("common.cognito_users.find_by_email", return_value=[]):
        result = flows.check_email({"email": email})
    assert result["exists"] is False


def test_check_email_flow_direct_invalid_raises():
    try:
        flows.check_email({"email": "invalid"})
        assert False
    except Exception as e:
        assert e.status_code == 400


def test_check_email_flow_direct_extra_fields_ignored():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        result = flows.check_email(
            {"email": "ok@example.com", "extra": "ignore", "x": 1}
        )
    assert result["exists"] is False


def test_check_email_options_returns_204():
    event = api_event("POST", "/auth/check-email", body={"email": "a@b.com"})
    event["requestContext"]["http"]["method"] = "OPTIONS"
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 204


def test_check_email_route_not_found():
    event = api_event("POST", "/auth/unknown", body={"email": "a@b.com"})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 404


def test_check_email_presignup_trigger_bypass():
    event = {
        "triggerSource": "PreSignUp_SignUp",
        "request": {"userAttributes": {"email": "a@b.com"}},
    }
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("federation.find_by_email", return_value=[]):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["triggerSource"] == "PreSignUp_SignUp"


def test_register_and_login_email_normalization_integration():
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return []

    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch("common.cognito.cognito_client") as mock_client:
            mock_client.sign_up.return_value = {"UserConfirmed": False}
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        event = api_event(
                            "POST",
                            "/auth/register",
                            body={
                                "email": "  NEW@Example.COM  ",
                                "password": "password123",
                            },
                        )
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    assert captured["email"] == "new@example.com"


def test_parse_body_handles_dict_and_string():
    from common.responses import parse_body

    assert parse_body({"body": {"email": "a@b.com"}}) == {"email": "a@b.com"}
    assert parse_body({"body": '{"email":"a@b.com"}'}) == {"email": "a@b.com"}
    assert parse_body({"body": None}) == {}
    assert parse_body({}) == {}
    encoded = base64.b64encode(b'{"email":"b64@test.com"}').decode()
    assert parse_body({"body": encoded, "isBase64Encoded": True}) == {
        "email": "b64@test.com"
    }
