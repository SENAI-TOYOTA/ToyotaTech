import base64
import importlib
import json
from unittest.mock import patch

from botocore.exceptions import ClientError

handler = importlib.import_module("services.auth.handler")
flows = importlib.import_module("flows")


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
    return ClientError({"Error": {"Code": code, "Message": message}}, "InitiateAuth")


def auth_result_tokens():
    return {
        "AuthenticationResult": {
            "AccessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature",
            "IdToken": "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjQ3MDAwMDAwMDB9.sig",
            "RefreshToken": "refresh-token-value",
            "ExpiresIn": 3600,
        }
    }


def test_login_unicode_email_accented():
    event = api_event(
        "POST",
        "/auth/login",
        body={"email": "tést@example.com", "password": "StrongPass123"},
    )
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return []

    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401
    assert captured["email"] == "tést@example.com"


def test_login_unicode_email_emoji():
    event = api_event(
        "POST",
        "/auth/login",
        body={"email": "test😀@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_unicode_email_cyrillic():
    event = api_event(
        "POST",
        "/auth/login",
        body={"email": "тест@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_unicode_email_normalization_case():
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return []

    event = api_event(
        "POST",
        "/auth/login",
        body={"email": "  TÉST@Example.COM  ", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401
    assert captured["email"] == "tést@example.com"


def test_login_unicode_password_preserved():
    captured_params = {}

    def fake_initiate(flow, params):
        captured_params.update(params)
        return auth_result_tokens()

    event = api_event(
        "POST",
        "/auth/login",
        body={"email": "user@example.com", "password": "pässwörd😀🔑"},
    )
    users = [{"Username": "user@example.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates",
            return_value=["user@example.com"],
        ):
            with patch("flows.initiate_auth", side_effect=fake_initiate):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "user@example.com",
                        "UserAttributes": [
                            {"Name": "sub", "Value": "123"},
                            {"Name": "email", "Value": "user@example.com"},
                        ],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert captured_params["PASSWORD"] == "pässwörd😀🔑"


def test_login_unicode_password_cyrillic_long():
    pwd = "пароль" * 20
    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch(
                "flows.initiate_auth",
                side_effect=client_error("NotAuthorizedException", "bad"),
            ):
                with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                    with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_unicode_flow_direct():
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            try:
                flows.login({"email": "ñoño@example.com", "password": "StrongPass123"})
                assert False
            except Exception as error:
                assert error.status_code == 401


def test_login_unicode_email_plus_unicode():
    event = api_event(
        "POST",
        "/auth/login",
        body={"email": "tést+alias@example.com", "password": "StrongPass123"},
    )
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_senha_longa_72_chars_boundary():
    pwd = "a" * 72
    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch(
                "flows.initiate_auth",
                side_effect=client_error("NotAuthorizedException", "bad"),
            ):
                with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                    with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401
    assert parse_response(result)["message"] == "Credenciais inválidas."


def test_login_senha_longa_1000_chars():
    pwd = "A1!" + "x" * 997
    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch(
                "flows.initiate_auth",
                side_effect=client_error("NotAuthorizedException", "bad"),
            ):
                with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                    with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_senha_longa_10000_chars_no_crash():
    pwd = "P" * 10000
    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch(
                "flows.initiate_auth",
                side_effect=client_error("NotAuthorizedException", "bad"),
            ):
                with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                    with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_senha_longa_unicode_5000():
    pwd = "🔑" * 2000 + "aB1!"
    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch(
                "flows.initiate_auth",
                side_effect=client_error("NotAuthorizedException", "bad"),
            ):
                with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                    with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                        result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_senha_longa_does_not_leak_in_log():
    pwd = "S" * 5000
    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch(
                "flows.initiate_auth",
                side_effect=client_error("InternalErrorException", "fail"),
            ):
                with patch("services.auth.handler.log_error") as mock_log:
                    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 500
    assert pwd not in json.dumps(parse_response(result))
    if mock_log.called:
        _, kwargs = mock_log.call_args
        error_str = str(kwargs.get("error", ""))
        assert pwd not in error_str
        assert parse_response(result)["message"] == "Erro interno."


def test_login_senha_longa_success_still_returns_tokens():
    pwd = "L" * 500 + "123!"
    users = [{"Username": "a@b.com"}]

    def fake_initiate(flow, params):
        assert params["PASSWORD"] == pwd
        return auth_result_tokens()

    event = api_event("POST", "/auth/login", body={"email": "a@b.com", "password": pwd})
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch("flows.initiate_auth", side_effect=fake_initiate):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "a@b.com",
                        "UserAttributes": [
                            {"Name": "sub", "Value": "123"},
                            {"Name": "email", "Value": "a@b.com"},
                        ],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    body = parse_response(result)
    assert "accessToken" in body
    assert "refreshToken" in body


def test_login_senha_longa_flow_direct_does_not_truncate():
    pwd = "x" * 10000
    captured = {}

    def fake_initiate(flow, params):
        captured["pwd"] = params["PASSWORD"]
        raise client_error("NotAuthorizedException", "bad")

    with patch(
        "common.cognito_users.find_by_email", return_value=[{"Username": "a@b.com"}]
    ):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch("flows.initiate_auth", side_effect=fake_initiate):
                try:
                    flows.login({"email": "a@b.com", "password": pwd})
                    assert False
                except Exception as error:
                    assert error.status_code == 401
    assert captured["pwd"] == pwd


def test_login_token_malformado_refresh_missing():
    event = api_event("POST", "/auth/refresh", body={})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "Refresh token obrigatório."


def test_login_token_malformado_refresh_empty_string():
    event = api_event("POST", "/auth/refresh", body={"refreshToken": ""})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_login_token_malformado_refresh_whitespace():
    event = api_event("POST", "/auth/refresh", body={"refreshToken": "   "})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_login_token_malformado_refresh_random_string():
    event = api_event(
        "POST", "/auth/refresh", body={"refreshToken": "not-a-valid-token!!!"}
    )
    with patch(
        "flows.initiate_auth",
        side_effect=client_error("NotAuthorizedException", "invalid"),
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401
    assert parse_response(result)["message"] == "Sessão inválida ou expirada."


def test_login_token_malformado_refresh_jwt_truncated():
    truncated = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM"
    event = api_event("POST", "/auth/refresh", body={"refreshToken": truncated})
    with patch(
        "flows.initiate_auth",
        side_effect=client_error("NotAuthorizedException", "invalid"),
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_refresh_base64_garbage():
    garbage = base64.b64encode(b"\xff\xfe\xfd").decode()
    event = api_event("POST", "/auth/refresh", body={"refreshToken": garbage})
    with patch(
        "flows.initiate_auth",
        side_effect=client_error("NotAuthorizedException", "invalid"),
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_refresh_numeric_type():
    event = api_event("POST", "/auth/refresh", body={"refreshToken": 12345})
    with patch(
        "flows.initiate_auth",
        side_effect=client_error("NotAuthorizedException", "invalid"),
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_set_password_no_header():
    event = api_event("POST", "/auth/set-password", body={"password": "StrongPass123"})
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401
    assert parse_response(result)["message"] == "Token não informado."


def test_login_token_malformado_set_password_bearer_empty():
    event = api_event(
        "POST",
        "/auth/set-password",
        body={"password": "StrongPass123"},
        headers={"authorization": "Bearer "},
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_set_password_without_bearer_prefix():
    event = api_event(
        "POST",
        "/auth/set-password",
        body={"password": "StrongPass123"},
        headers={"authorization": "eyJhbGciOiJIUzI1NiJ9.payload.sig"},
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_set_password_invalid_jwt_structure():
    event = {
        "rawPath": "/auth/set-password",
        "requestContext": {"http": {"method": "POST"}},
        "headers": {"authorization": "Bearer not.jwt"},
        "body": json.dumps({"password": "StrongPass123"}),
    }
    with patch(
        "flows.get_user_by_access_token",
        side_effect=client_error("NotAuthorizedException", "invalid"),
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_set_password_truncated():
    event = {
        "rawPath": "/auth/set-password",
        "requestContext": {"http": {"method": "POST"}},
        "headers": {"authorization": "Bearer eyJhbG"},
        "body": json.dumps({"password": "StrongPass123"}),
    }
    with patch(
        "flows.get_user_by_access_token",
        side_effect=client_error("NotAuthorizedException", "invalid"),
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_token_malformado_flow_direct_refresh_invalid():
    with patch(
        "flows.initiate_auth",
        side_effect=client_error("NotAuthorizedException", "bad"),
    ):
        try:
            flows.refresh({"refreshToken": "!!!malformed!!!"})
            assert False
        except Exception as error:
            assert error.status_code == 401


def test_login_base64_valid_login():
    payload = json.dumps({"email": "b64@example.com", "password": "StrongPass123"})
    encoded = base64.b64encode(payload.encode("utf-8")).decode("utf-8")
    event = api_event("POST", "/auth/login", raw_body=encoded, base64_encoded=True)
    users = [{"Username": "b64@example.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates",
            return_value=["b64@example.com"],
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "b64@example.com",
                        "UserAttributes": [
                            {"Name": "sub", "Value": "123"},
                            {"Name": "email", "Value": "b64@example.com"},
                        ],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert "accessToken" in parse_response(result)


def test_login_base64_valid_unicode_payload():
    payload = json.dumps(
        {"email": "tést@example.com", "password": "pässwörd🔑"}, ensure_ascii=False
    )
    encoded = base64.b64encode(payload.encode("utf-8")).decode("utf-8")
    event = api_event("POST", "/auth/login", raw_body=encoded, base64_encoded=True)
    with patch("common.cognito_users.find_by_email", return_value=[]):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401


def test_login_base64_malformed_json_returns_500():
    encoded = base64.b64encode(b"{ not json").decode("utf-8")
    event = api_event("POST", "/auth/login", raw_body=encoded, base64_encoded=True)
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_login_base64_invalid_base64_string_returns_500():
    event = api_event(
        "POST", "/auth/login", raw_body="!!!not-base64!!!", base64_encoded=True
    )
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_login_base64_empty_decoded_returns_400():
    encoded = base64.b64encode(b"").decode("utf-8")
    event = api_event("POST", "/auth/login", raw_body=encoded, base64_encoded=True)
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400
    assert parse_response(result)["message"] == "Informe e-mail e senha."


def test_login_base64_missing_padding():
    payload = json.dumps({"email": "a@b.com", "password": "StrongPass123"})
    encoded = base64.b64encode(payload.encode()).decode().rstrip("=")
    event = api_event("POST", "/auth/login", raw_body=encoded, base64_encoded=True)
    with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
        with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
            result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 400


def test_login_base64_flag_false_treats_as_plain_json():
    payload = json.dumps({"email": "plain@example.com", "password": "StrongPass123"})
    event = {
        "rawPath": "/auth/login",
        "requestContext": {"http": {"method": "POST"}},
        "body": payload,
        "isBase64Encoded": False,
    }
    users = [{"Username": "plain@example.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates",
            return_value=["plain@example.com"],
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "plain@example.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_login_base64_refresh_valid():
    payload = json.dumps({"refreshToken": "valid-refresh-token"})
    encoded = base64.b64encode(payload.encode()).decode()
    event = api_event("POST", "/auth/refresh", raw_body=encoded, base64_encoded=True)
    with patch(
        "flows.initiate_auth",
        return_value={
            "AuthenticationResult": {
                "AccessToken": "at",
                "IdToken": "it",
                "ExpiresIn": 3600,
            }
        },
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_login_extra_fields_ignored_success():
    body = {
        "email": "extra@example.com",
        "password": "StrongPass123",
        "unexpected": "field",
        "foo": 123,
        "nested": {"a": 1},
        "admin": True,
    }
    event = api_event("POST", "/auth/login", body=body)
    users = [{"Username": "extra@example.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates",
            return_value=["extra@example.com"],
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "extra@example.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
    assert "accessToken" in parse_response(result)


def test_login_extra_fields_large_payload_ignored():
    body = {
        "email": "a@b.com",
        "password": "StrongPass123",
        "extra": "x" * 10000,
        "array": list(range(1000)),
    }
    event = api_event("POST", "/auth/login", body=body)
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "a@b.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_login_extra_fields_proto_pollution_ignored():
    body = {
        "email": "a@b.com",
        "password": "StrongPass123",
        "__proto__": {"admin": True},
        "constructor": {"prototype": {"a": 1}},
    }
    event = api_event("POST", "/auth/login", body=body)
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "a@b.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_login_extra_fields_does_not_override_email():
    body = {
        "email": "real@example.com",
        "password": "StrongPass123",
        "Username": "hacked@example.com",
    }
    captured = {}

    def fake_find(email):
        captured["email"] = email
        return []

    event = api_event("POST", "/auth/login", body=body)
    with patch("common.cognito_users.find_by_email", side_effect=fake_find):
        with patch(
            "flows.initiate_auth",
            side_effect=client_error("NotAuthorizedException", "bad"),
        ):
            with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
                with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 401
    assert captured["email"] == "real@example.com"


def test_login_extra_fields_with_unicode_and_base64():
    payload = {
        "email": "extra@example.com",
        "password": "StrongPass123",
        "extra": "tést😀",
        "nested": {"x": 1},
    }
    encoded = base64.b64encode(
        json.dumps(payload, ensure_ascii=False).encode()
    ).decode()
    event = api_event("POST", "/auth/login", raw_body=encoded, base64_encoded=True)
    users = [{"Username": "extra@example.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates",
            return_value=["extra@example.com"],
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "extra@example.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_login_extra_fields_flow_direct_ignored():
    users = [{"Username": "a@b.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates", return_value=["a@b.com"]
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "a@b.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        result = flows.login(
                            {
                                "email": "a@b.com",
                                "password": "StrongPass123",
                                "extra": "ignore",
                                "x": 1,
                                "admin": True,
                            }
                        )
    assert "accessToken" in result


def test_login_extra_fields_refresh_ignored():
    event = api_event(
        "POST",
        "/auth/refresh",
        body={"refreshToken": "valid-token", "extra": "field", "admin": True},
    )
    with patch(
        "flows.initiate_auth",
        return_value={
            "AuthenticationResult": {
                "AccessToken": "at",
                "IdToken": "it",
                "ExpiresIn": 3600,
            }
        },
    ):
        with patch("services.auth.handler.COGNITO_USER_POOL_ID", "pool"):
            with patch("services.auth.handler.COGNITO_CLIENT_ID", "client"):
                result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200


def test_login_body_as_dict_with_extra_fields():
    event = {
        "rawPath": "/auth/login",
        "requestContext": {"http": {"method": "POST"}},
        "body": {
            "email": "dict@example.com",
            "password": "StrongPass123",
            "extra": 123,
        },
    }
    users = [{"Username": "dict@example.com"}]
    with patch("common.cognito_users.find_by_email", return_value=users):
        with patch(
            "common.cognito_users.password_auth_candidates",
            return_value=["dict@example.com"],
        ):
            with patch("flows.initiate_auth", return_value=auth_result_tokens()):
                with patch(
                    "flows.get_user_by_access_token",
                    return_value={
                        "Username": "dict@example.com",
                        "UserAttributes": [{"Name": "sub", "Value": "123"}],
                    },
                ):
                    with patch("flows.get_table") as mock_table:
                        mock_table.return_value.get_item.return_value = {"Item": {}}
                        with patch(
                            "services.auth.handler.COGNITO_USER_POOL_ID", "pool"
                        ):
                            with patch(
                                "services.auth.handler.COGNITO_CLIENT_ID", "client"
                            ):
                                with patch(
                                    "common.cognito.COGNITO_CLIENT_ID", "client"
                                ):
                                    result = handler.lambda_handler(event, None)
    assert result["statusCode"] == 200
