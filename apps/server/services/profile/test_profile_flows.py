import json
from typing import Any, Dict, Optional
from unittest.mock import patch

import pytest
from botocore.exceptions import ClientError

PROFILE_MODULES = ("flows", "handler", "validation")

CPF = "52998224725"
OTHER_CPF = "11144477735"
USER = {
    "sub": "user-1",
    "email": "user@example.com",
    "name": "Maria Silva",
    "isVerified": True,
}
SECOND_USER = {
    "sub": "user-2",
    "email": "second@example.com",
    "name": "João Souza",
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


def seed_cpf_reservation(
    dynamodb: Any, cpf: str = CPF, owner: str = USER["sub"]
) -> Dict[str, Any]:
    item = {
        "userId": f"cpf#{cpf}",
        "ownerUserId": owner,
        "cpf": cpf,
        "createdAt": 1,
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
    reservation = dynamodb.Table("ProfileTable").get_item(Key={"userId": f"cpf#{CPF}"})
    assert "Item" not in reservation


def test_profile_put_cpf_duplicado_retorna_409(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_cpf_reservation(dynamodb)
    second_profile = {
        "userId": SECOND_USER["sub"],
        "fullName": "João Souza",
        "birthDate": "02/03/1991",
    }
    dynamodb.Table("ProfileTable").put_item(Item=second_profile)
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(
            modules["flows"], "authenticated_user", return_value=SECOND_USER
        ):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={"cpf": CPF}, token="token"),
                None,
            )

    assert result["statusCode"] == 409
    assert response_body(result)["message"] == "CPF já vinculado a outro usuário."
    stored = dynamodb.Table("ProfileTable").get_item(Key={"userId": SECOND_USER["sub"]})
    assert stored["Item"] == second_profile


def test_profile_put_mesmo_cpf_do_usuario_e_idempotente(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_cpf_reservation(dynamodb)
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "PUT",
                    "/profile",
                    body={"fullName": "Maria Silva", "cpf": "529.982.247-25"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 200
    assert response_body(result)["profile"]["cpf"] == CPF
    stored = dynamodb.Table("ProfileTable").get_item(Key={"userId": USER["sub"]})
    assert stored["Item"]["cpf"] == CPF


def test_profile_put_cpf_legado_cria_reserva(dynamodb, service_loader):
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
    assert response_body(result)["profile"]["cpf"] == CPF
    reservation = dynamodb.Table("ProfileTable").get_item(Key={"userId": f"cpf#{CPF}"})
    assert reservation["Item"]["ownerUserId"] == USER["sub"]
    assert reservation["Item"]["cpf"] == CPF
    assert "createdAt" in reservation["Item"]


def test_profile_put_reserva_de_outro_dono_retorna_409(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_cpf_reservation(dynamodb, owner=SECOND_USER["sub"])
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "PUT", "/profile", body={"fullName": "Maria Souza"}, token="token"
                ),
                None,
            )

    assert result["statusCode"] == 409
    assert response_body(result)["message"] == "CPF já vinculado a outro usuário."
    stored = dynamodb.Table("ProfileTable").get_item(Key={"userId": USER["sub"]})
    assert stored["Item"]["fullName"] == "Maria Silva"
    assert stored["Item"]["cpf"] == CPF


def test_profile_put_preserva_reserva_existente_em_falha(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_cpf_reservation(dynamodb)
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
    reservation = dynamodb.Table("ProfileTable").get_item(Key={"userId": f"cpf#{CPF}"})
    assert reservation["Item"]["ownerUserId"] == USER["sub"]


class TransientFailureTable:
    def __init__(self) -> None:
        self.put_calls = 0
        self.delete_calls = []

    def put_item(self, **kwargs: Any) -> Dict[str, Any]:
        self.put_calls += 1
        if self.put_calls == 1:
            return {}
        raise ClientError(
            {
                "Error": {
                    "Code": "ProvisionedThroughputExceededException",
                    "Message": "transient",
                }
            },
            "PutItem",
        )

    def delete_item(self, **kwargs: Any) -> None:
        self.delete_calls.append(kwargs)


def test_profile_put_nao_libera_reserva_em_falha_transitoria(service_loader):
    table = TransientFailureTable()
    with service_loader("profile", PROFILE_MODULES) as modules:
        with patch.object(modules["flows"], "get_table", return_value=table):
            with pytest.raises(ClientError):
                modules["flows"]._persist_profile(
                    USER["sub"],
                    {
                        "fullName": "Maria Silva",
                        "birthDate": "01/02/1990",
                        "cpf": CPF,
                    },
                    "",
                )

    assert table.delete_calls == []


def test_profile_put_cpf_concorrente_do_mesmo_usuario_preserva_reserva(
    dynamodb, service_loader
):
    with service_loader("profile", PROFILE_MODULES) as modules:
        flows = modules["flows"]
        table = dynamodb.Table("ProfileTable")
        original_reserve = flows._reserve_cpf

        def reserve_and_simulate_parallel_success(table_arg, cpf, user_id, created_at):
            created = original_reserve(table_arg, cpf, user_id, created_at)
            table.put_item(
                Item={
                    "userId": user_id,
                    "fullName": "Maria Silva",
                    "birthDate": "01/02/1990",
                    "cpf": cpf,
                }
            )
            return created

        with patch.object(
            flows,
            "_reserve_cpf",
            side_effect=reserve_and_simulate_parallel_success,
        ):
            flows._persist_profile(
                USER["sub"],
                {
                    "fullName": "Maria Silva",
                    "birthDate": "01/02/1990",
                    "cpf": CPF,
                },
                "",
            )

        reservation = table.get_item(Key={"userId": f"cpf#{CPF}"})
        assert reservation["Item"]["ownerUserId"] == USER["sub"]

        with patch.object(
            modules["flows"], "authenticated_user", return_value=SECOND_USER
        ):
            result = modules["handler"].lambda_handler(
                api_event("PUT", "/profile", body={"cpf": CPF}, token="token"),
                None,
            )

    assert result["statusCode"] == 409
