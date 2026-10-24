import base64
import importlib
import json
from unittest.mock import patch

from botocore.exceptions import ClientError

from common.validation import PASSWORD_WHITESPACE_MESSAGE

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


def client_error(code, message):
    return ClientError({"Error": {"Code": code, "Message": message}}, "SignUp")


def test_register_valid_minimal():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "valid@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    body = parse_response(result)
    assert body["requiresEmailVerification"] is True
    assert "message" in body


def test_register_valid_with_name():
    event = api_event(
        "POST",
        "/auth/register",
        body={
            "email": "named@example.com",
            "password": "StrongPass123",
            "name": "Julio Silva",
        },
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": True},
        ) as mock_sign:
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    assert parse_response(result)["requiresEmailVerification"] is False
    assert mock_sign.call_args.kwargs["UserAttributes"] == [
        {"Name": "email", "Value": "named@example.com"},
        {"Name": "name", "Value": "Julio Silva"},
    ]


def test_register_valid_with_cpf_formatted():
    event = api_event(
        "POST",
        "/auth/register",
        body={
            "email": "cpf@example.com",
            "password": "StrongPass123",
            "cpf": "529.982.247-25",
        },
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_valid_email_normalization():
    captured = {}

    def fake_sign_up(**kwargs):
        captured["username"] = kwargs.get("Username")
        captured["attributes"] = kwargs.get("UserAttributes")
        return {"UserConfirmed": False}

    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "  VALID@Example.COM  ", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]) as mock_find:
        mock_find.side_effect = lambda e: []
        with patch("common.cognito.cognito_client.sign_up", side_effect=fake_sign_up):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    assert captured["username"] == "valid@example.com"
    assert {"Name": "email", "Value": "valid@example.com"} in captured["attributes"]


def test_register_valid_extra_fields_ignored():
    event = api_event(
        "POST",
        "/auth/register",
        body={
            "email": "extra@example.com",
            "password": "StrongPass123",
            "unexpected": "field",
            "foo": 123,
            "nested": {"a": 1},
        },
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_valid_flow_direct():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            result = flows.register(
                {"email": "direct@example.com", "password": "StrongPass123"}
            )
    assert result["requiresEmailVerification"] is True


def test_register_duplicate_precheck():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "dup@example.com", "password": "StrongPass123"},
    )
    with patch(
        "common.cognito_users.find_by_email",
        return_value=[{"Username": "dup@example.com"}],
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 409
    assert parse_response(result)["message"] == "Usuário já cadastrado."


def test_register_duplicate_cognito_username_exists():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "dup2@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("UsernameExistsException", "User exists"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 409
    assert parse_response(result)["message"] == "Usuário já cadastrado."


def test_register_duplicate_flow_direct():
    with patch(
        "common.cognito_users.find_by_email", return_value=[{"Username": "a@b.com"}]
    ):
        try:
            flows.register({"email": "a@b.com", "password": "StrongPass123"})
            assert False
        except Exception as error:
            assert error.status_code == 409


def test_register_duplicate_case_insensitive():
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return [{"Username": "dup@example.com"}]

    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "DUP@EXAMPLE.COM", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 409
    assert captured["email"] == "dup@example.com"


def test_register_invalid_cpf_short():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": "123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "CPF inválido."


def test_register_invalid_cpf_formatted_short():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": "123.456.789-0"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_empty_string():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": ""},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_letters():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": "abcdefghijk"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_ten_digits():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": "1234567890"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_numeric_type():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": 12345678901},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_none():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": None},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_whitespace():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "cpf": "   "},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_invalid_cpf_flow_direct():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        try:
            flows.register(
                {"email": "a@b.com", "password": "StrongPass123", "cpf": "123"}
            )
            assert False
        except Exception as error:
            assert error.status_code == 400
            assert error.message == "CPF inválido."


def test_register_weak_password_short():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": "short"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    expected_message = (
        "A senha não atende aos requisitos: mínimo de 8 caracteres, "
        "com letra maiúscula, minúscula e número."
    )
    assert parse_response(result)["message"] == expected_message


def test_register_weak_password_seven_chars():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": "1234567"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_weak_password_empty():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": ""}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_weak_password_missing():
    event = api_event("POST", "/auth/register", body={"email": "a@b.com"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_weak_password_none():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": None}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_weak_password_numeric():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": 12345678}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_weak_password_list():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": ["StrongPass123"]},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_weak_password_eight_digits_rejected():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "ok@example.com", "password": "12345678"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_strong_password_accepted():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "ok@example.com", "password": "Toyota2026"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_weak_password_flow_direct():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        try:
            flows.register({"email": "a@b.com", "password": "weak"})
            assert False
        except Exception as error:
            assert error.status_code == 400


def test_register_name_empty_allowed():
    event = api_event(
        "POST",
        "/auth/register",
        body={
            "email": "emptyname@example.com",
            "password": "StrongPass123",
            "name": "",
        },
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ) as mock:
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    assert mock.call_args.kwargs["UserAttributes"] == [
        {"Name": "email", "Value": "emptyname@example.com"}
    ]


def test_register_name_whitespace_allowed():
    event = api_event(
        "POST",
        "/auth/register",
        body={
            "email": "wsname@example.com",
            "password": "StrongPass123",
            "name": "   ",
        },
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ) as mock:
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    assert mock.call_args.kwargs["UserAttributes"] == [
        {"Name": "email", "Value": "wsname@example.com"}
    ]


def test_register_name_missing_allowed():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "noname@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_name_valid_stripped():
    event = api_event(
        "POST",
        "/auth/register",
        body={
            "email": "strip@example.com",
            "password": "StrongPass123",
            "name": "  Julio  ",
        },
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ) as mock:
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201
    assert {"Name": "name", "Value": "Julio"} in mock.call_args.kwargs["UserAttributes"]


def test_register_name_invalid_numeric():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "name": 12345},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "Nome inválido."


def test_register_name_invalid_list():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "name": ["Julio"]},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_name_invalid_dict():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "a@b.com", "password": "StrongPass123", "name": {"a": 1}},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_name_flow_direct_invalid():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        try:
            flows.register(
                {"email": "a@b.com", "password": "StrongPass123", "name": 123}
            )
            assert False
        except Exception as error:
            assert error.status_code == 400


def test_register_malformed_body_none():
    event = {
        "rawPath": "/auth/register",
        "requestContext": {"http": {"method": "POST"}},
        "body": None,
    }
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "E-mail inválido."


def test_register_malformed_empty_dict():
    event = api_event("POST", "/auth/register", body={})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_missing_email():
    event = api_event("POST", "/auth/register", body={"password": "StrongPass123"})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "E-mail inválido."


def test_register_malformed_missing_password():
    event = api_event("POST", "/auth/register", body={"email": "a@b.com"})
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_invalid_email_no_at():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "invalidemail.com", "password": "StrongPass123"},
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_invalid_email_empty():
    event = api_event(
        "POST", "/auth/register", body={"email": "", "password": "StrongPass123"}
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_invalid_email_whitespace():
    event = api_event(
        "POST", "/auth/register", body={"email": "   ", "password": "StrongPass123"}
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_invalid_email_none():
    event = api_event(
        "POST", "/auth/register", body={"email": None, "password": "StrongPass123"}
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_invalid_email_numeric():
    event = api_event(
        "POST", "/auth/register", body={"email": 12345, "password": "StrongPass123"}
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_invalid_email_list():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": ["a@b.com"], "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_json_invalid():
    event = api_event("POST", "/auth/register", raw_body="{ invalid json")
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_json_trailing_comma():
    event = api_event("POST", "/auth/register", raw_body='{"email":"a@b.com",}')
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_json_empty_string():
    event = api_event("POST", "/auth/register", raw_body="")
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_base64_valid():
    payload = json.dumps({"email": "b64@example.com", "password": "StrongPass123"})
    encoded = base64.b64encode(payload.encode("utf-8")).decode("utf-8")
    event = api_event("POST", "/auth/register", raw_body=encoded, base64_encoded=True)
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_malformed_base64_invalid_json():
    encoded = base64.b64encode(b"{ not json").decode("utf-8")
    event = api_event("POST", "/auth/register", raw_body=encoded, base64_encoded=True)
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_register_malformed_body_as_dict_direct():
    event = {
        "rawPath": "/auth/register",
        "requestContext": {"http": {"method": "POST"}},
        "body": {"email": "dict@example.com", "password": "StrongPass123"},
    }
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_malformed_unicode_email():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "tést@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_cognito_invalid_password():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "weakcog@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("InvalidPasswordException", "Password weak"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "Password weak"


def test_register_cognito_invalid_parameter():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "param@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("InvalidParameterException", "Invalid param"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "Dados inválidos."


def test_register_cognito_unknown_error_returns_500():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "unknown@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("InternalErrorException", "Internal"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 500
    assert parse_response(result)["message"] == "Erro interno."


def test_register_cognito_throttling_returns_429():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "throttle@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("TooManyRequestsException", "Throttled"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 429
    assert parse_response(result)["message"] == "Muitas requisições."
    assert result["headers"].get("Retry-After") == "60"


def test_register_cognito_flow_direct_invalid_password():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("InvalidPasswordException", "Weak"),
        ):
            try:
                flows.register({"email": "a@b.com", "password": "StrongPass123"})
                assert False
            except Exception as error:
                assert error.status_code == 400


def test_register_cognito_flow_direct_username_exists():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("UsernameExistsException", "Exists"),
        ):
            try:
                flows.register({"email": "a@b.com", "password": "StrongPass123"})
                assert False
            except Exception as error:
                assert error.status_code == 409


def test_register_cognito_unexpected_propagates():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            side_effect=client_error("ServiceUnavailable", "Down"),
        ):
            try:
                flows.register({"email": "a@b.com", "password": "StrongPass123"})
                assert False
            except ClientError as error:
                assert error.response["Error"]["Code"] == "ServiceUnavailable"


def test_register_options_returns_204():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": "StrongPass123"}
    )
    event["requestContext"]["http"]["method"] = "OPTIONS"
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 204


def test_register_route_not_found():
    event = api_event(
        "POST", "/auth/unknown", body={"email": "a@b.com", "password": "StrongPass123"}
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 404


def test_register_handler_config_missing():
    event = api_event(
        "POST", "/auth/register", body={"email": "a@b.com", "password": "StrongPass123"}
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", ""):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 500


def test_register_long_email_still_valid():
    local = "a" * 64
    email = f"{local}@example.com"
    event = api_event(
        "POST", "/auth/register", body={"email": email, "password": "StrongPass123"}
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def test_register_password_with_special_chars():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "special@example.com", "password": "P@SSw0rd123!"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 201


def register_sign_up_password(password):
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "common.cognito.cognito_client.sign_up",
            return_value={"UserConfirmed": False},
        ) as sign_up:
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    with patch("common.cognito.COGNITO_CLIENT_ID", "client"):
                        event = api_event(
                            "POST",
                            "/auth/register",
                            body={
                                "email": "space@example.com",
                                "password": password,
                            },
                        )
                        result = handler.lambda_handler(event, None)
    sent = sign_up.call_args.kwargs["Password"] if sign_up.call_args else None
    return result["statusCode"], sent


def test_register_rejects_weak_password_that_meets_complexity():
    status_code, _ = register_sign_up_password("Admin@2024")
    assert status_code == 400


def test_register_rejects_blocklisted_password_case_insensitively():
    status_code, _ = register_sign_up_password("ADMIN@2024")
    assert status_code == 400


def test_register_rejects_trailing_space_in_password():
    status_code, sent = register_sign_up_password("Abc1234 ")
    assert status_code == 400
    assert sent is None


def test_register_rejects_leading_space_in_password():
    status_code, sent = register_sign_up_password(" Abc1234")
    assert status_code == 400
    assert sent is None


def test_register_rejects_trailing_newline_in_password():
    status_code, sent = register_sign_up_password("Abc12345\n")
    assert status_code == 400
    assert sent is None


def test_register_reports_whitespace_before_length():
    event = api_event(
        "POST",
        "/auth/register",
        body={"email": "ws@example.com", "password": " Ab1 "},
    )
    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == PASSWORD_WHITESPACE_MESSAGE


def test_set_password_rejects_trailing_space():
    with patch("common.cognito.extract_token", return_value="token"):
        with patch(
            "services.auth.flows.get_user_by_access_token",
            return_value={
                "Username": "user@example.com",
                "UserAttributes": [{"Name": "email", "Value": "user@example.com"}],
            },
        ):
            with patch("services.auth.flows.is_federated", return_value=False):
                with patch("services.auth.flows.COGNITO_USER_POOL_ID", "pool"):
                    with patch(
                        "common.cognito.cognito_client.admin_set_user_password"
                    ) as set_password_call:
                        event = api_event(
                            "POST",
                            "/auth/set-password",
                            body={"password": "Abc1234 "},
                        )
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert set_password_call.call_args is None


def test_set_password_preserves_inner_spaces():
    with patch("common.cognito.extract_token", return_value="token"):
        with patch(
            "services.auth.flows.get_user_by_access_token",
            return_value={
                "Username": "user@example.com",
                "UserAttributes": [{"Name": "email", "Value": "user@example.com"}],
            },
        ):
            with patch("services.auth.flows.is_federated", return_value=False):
                with patch("services.auth.flows.COGNITO_USER_POOL_ID", "pool"):
                    with patch(
                        "common.cognito.cognito_client.admin_set_user_password"
                    ) as set_password_call:
                        flows.set_password({"body": '{"password": "Abc 1234"}'})
    assert set_password_call.call_args.kwargs["Password"] == "Abc 1234"
