import json
from typing import Any, Dict, Optional
from unittest.mock import patch

PROFILE_MODULES = ("flows", "handler", "validation")

CPF = "52998224725"
OTHER_CPF = "11144477735"
USER = {
    "sub": "user-1",
    "email": "user@example.com",
    "name": "Maria Silva",
    "isVerified": True,
}


def api_event(
    method: str, path: str, body: Any = None, token: Optional[str] = None
) -> Dict[str, Any]:
    event: Dict[str, Any] = {
        "rawPath": path,
        "requestContext": {"http": {"method": method}, "requestId": "req-1"},
    }
    if body is not None:
        event["body"] = json.dumps(body)
    if token:
        event["headers"] = {"Authorization": f"Bearer {token}"}
    return event


def seed_profile(dynamodb: Any, cpf: str = CPF) -> Dict[str, Any]:
    item = {
        "userId": USER["sub"],
        "fullName": "Maria Silva",
        "birthDate": "01/02/1990",
        "cpf": cpf,
    }
    dynamodb.Table("ProfileTable").put_item(Item=item)
    return item


def response_body(result: Dict[str, Any]) -> Dict[str, Any]:
    return json.loads(result["body"])


def test_profile_get_retorna_perfil_normalizado(dynamodb, service_loader):
    dynamodb.Table("ProfileTable").put_item(
        Item={
            "userId": USER["sub"],
            "fullName": "  Maria Silva  ",
            "birthDate": "01021990",
            "cpf": "529.982.247-25",
        }
    )
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("GET", "/profile", token="token"), None
            )

    assert result["statusCode"] == 200
    assert response_body(result) == {
        "profile": {
            "fullName": "  Maria Silva  ",
            "birthDate": "01/02/1990",
            "cpf": CPF,
        }
    }


def test_profile_get_sem_perfil_retorna_campos_vazios(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("GET", "/profile", token="token"), None
            )

    assert result["statusCode"] == 200
    assert response_body(result) == {
        "profile": {"fullName": "", "birthDate": "", "cpf": ""}
    }


def test_profile_get_sem_token_retorna_401(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(api_event("GET", "/profile"), None)

    assert result["statusCode"] == 401
    assert response_body(result) == {"message": "Token não informado."}


def test_profile_put_atualiza_perfil(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "PUT",
                    "/profile",
                    body={
                        "fullName": "Maria Silva",
                        "birthDate": "01/02/1990",
                        "cpf": "529.982.247-25",
                    },
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 200
    assert response_body(result) == {
        "profile": {
            "fullName": "Maria Silva",
            "birthDate": "01/02/1990",
            "cpf": CPF,
        }
    }
    stored = dynamodb.Table("ProfileTable").get_item(Key={"userId": USER["sub"]})
    assert stored["Item"]["fullName"] == "Maria Silva"
    assert stored["Item"]["birthDate"] == "01/02/1990"
    assert stored["Item"]["cpf"] == CPF


def test_profile_put_aceita_atualizacao_parcial(dynamodb, service_loader):
    seed_profile(dynamodb)
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "PUT", "/profile", body={"fullName": "Maria Souza"}, token="token"
                ),
                None,
            )

    assert result["statusCode"] == 200
    assert response_body(result)["profile"] == {
        "fullName": "Maria Souza",
        "birthDate": "01/02/1990",
        "cpf": CPF,
    }


def test_profile_put_sem_campos_retorna_400(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={}, token="token"), None
            )

    assert result["statusCode"] == 400
    assert response_body(result)["message"] == "Nenhum campo de perfil informado."


def test_profile_put_cpf_invalido_retorna_400(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={"cpf": "123"}, token="token"), None
            )

    assert result["statusCode"] == 400
    assert response_body(result)["message"] == "CPF inválido."


def test_profile_put_data_invalida_retorna_400(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "PUT",
                    "/profile",
                    body={"birthDate": "31/02/1990"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert response_body(result)["message"] == "Informe uma data de nascimento válida."


def test_profile_put_nao_altera_cpf_vinculado(dynamodb, service_loader):
    seed_profile(dynamodb)
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={"cpf": OTHER_CPF}, token="token"),
                None,
            )

    assert result["statusCode"] == 409
    assert (
        response_body(result)["message"]
        == "CPF não pode ser alterado depois de vinculado ao perfil."
    )
    stored = dynamodb.Table("ProfileTable").get_item(Key={"userId": USER["sub"]})
    assert stored["Item"]["cpf"] == CPF


def test_profile_put_nome_vazio_retorna_400(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={"fullName": "   "}, token="token"),
                None,
            )

    assert result["statusCode"] == 400
    assert response_body(result)["message"] == "Informe nome e sobrenome."


def test_profile_put_nome_com_uma_palavra_retorna_400(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={"fullName": "Maria"}, token="token"),
                None,
            )

    assert result["statusCode"] == 400
    assert response_body(result)["message"] == "Informe nome e sobrenome."


def test_profile_put_nao_sobrescreve_cpf_alterado_em_corrida(dynamodb, service_loader):
    seed_profile(dynamodb)
    dynamodb.Table("ProfileTable").update_item(
        Key={"userId": USER["sub"]},
        UpdateExpression="SET cpf = :cpf",
        ExpressionAttributeValues={":cpf": OTHER_CPF},
    )
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            with patch.object(
                modules["flows"],
                "_get_profile",
                return_value={"fullName": "Maria Silva", "birthDate": "", "cpf": CPF},
            ):
                result = modules["handler"].lambda_handler(
                    api_event("PUT", "/profile", body={"fullName": "Maria Souza"}),
                    None,
                )

    assert result["statusCode"] == 409
    stored = dynamodb.Table("ProfileTable").get_item(Key={"userId": USER["sub"]})
    assert stored["Item"]["cpf"] == OTHER_CPF
    assert stored["Item"]["fullName"] == "Maria Silva"
