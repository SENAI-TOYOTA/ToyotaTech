import json
from typing import Any, Dict, Optional
from unittest.mock import patch

GARAGE_MODULES = (
    "demo",
    "flows",
    "handler",
    "projection",
    "purchases",
    "resolver",
    "validation",
)

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


def seed_profile(
    dynamodb: Any,
    cpf: str = CPF,
    full_name: str = "Maria Silva",
    birth_date: str = "01/02/1990",
) -> Dict[str, Any]:
    item = {
        "userId": USER["sub"],
        "fullName": full_name,
        "birthDate": birth_date,
    }
    if cpf:
        item["cpf"] = cpf
    dynamodb.Table("ProfileTable").put_item(Item=item)
    return item


def seed_purchase(
    dynamodb: Any,
    purchase_id: str = "purchase-1",
    cpf: str = CPF,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    item: Dict[str, Any] = {
        "purchaseId": purchase_id,
        "orderId": f"TT-{purchase_id}",
        "email": USER["email"],
        "fullName": "Maria Silva",
        "cpf": cpf,
        "purchaseDate": "03/10/2025",
        "dealership": "Concessionaria Toyota",
        "vehicle": {"chassi": "CHASSI_12345", "model": "Corolla"},
    }
    if user_id is not None:
        item["userId"] = user_id
    dynamodb.Table("PurchasesTable").put_item(Item=item)
    return item


def response_body(result: Dict[str, Any]) -> Dict[str, Any]:
    return json.loads(result["body"])


def test_current_cria_e_persiste_garagem(dynamodb, service_loader):
    seed_profile(dynamodb)
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("GET", "/garage/current", token="token"), None
            )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert set(body) == {"garage"}
    assert body["garage"]["userId"] == USER["sub"]
    assert body["garage"]["matchSource"] == "generated_demo"
    stored = dynamodb.Table("GarageTable").get_item(Key={"userId": USER["sub"]})
    assert stored["Item"]["chassi"] == body["garage"]["chassi"]
    assert stored["Item"]["purchaseId"].startswith("demo-")


def test_current_reutiliza_garagem_existente(dynamodb, service_loader):
    seed_profile(dynamodb)
    existing = {
        "userId": USER["sub"],
        "chassi": "CHASSI_EXISTENTE",
        "purchaseId": "purchase-1",
        "matchSource": "linked_user",
        "matchAlgorithmVersion": "cpf_v2",
        "createdAt": 100,
        "updatedAt": 100,
    }
    dynamodb.Table("GarageTable").put_item(Item=existing)

    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("GET", "/garage/current", token="token"), None
            )

    assert result["statusCode"] == 200
    assert response_body(result)["garage"] == existing


def test_current_sem_token_retorna_401(dynamodb, service_loader):
    with service_loader("garage", GARAGE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/garage/current"), None
        )

    assert result["statusCode"] == 401
    assert response_body(result) == {"message": "Token não informado."}


def test_current_perfil_incompleto_retorna_409(dynamodb, service_loader):
    seed_profile(dynamodb, cpf="")
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("GET", "/garage/current", token="token"), None
            )

    assert result["statusCode"] == 409
    body = response_body(result)
    assert body["message"] == "Perfil incompleto para vincular veículo."
    assert body["code"] == "PROFILE_INCOMPLETE"
    assert dynamodb.Table("GarageTable").scan()["Items"] == []


def test_resolve_gera_compra_demo(dynamodb, service_loader):
    seed_profile(dynamodb)
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event("POST", "/garage/resolve", token="token"), None
            )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert body["matchSource"] == "generated_demo"
    assert body["purchase"]["purchaseId"].startswith("demo-")
    assert body["garage"]["purchaseId"] == body["purchase"]["purchaseId"]
    stored = dynamodb.Table("PurchasesTable").get_item(
        Key={"purchaseId": body["purchase"]["purchaseId"]}
    )
    assert stored["Item"]["userId"] == USER["sub"]


def test_resolve_sem_token_retorna_401(dynamodb, service_loader):
    with service_loader("garage", GARAGE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("POST", "/garage/resolve"), None
        )

    assert result["statusCode"] == 401


def test_link_vincula_compra_por_purchase_id(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_purchase(dynamodb)
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "POST",
                    "/garage/link",
                    body={"purchaseId": "purchase-1"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert body["purchase"]["purchaseId"] == "purchase-1"
    assert body["purchase"]["userId"] == USER["sub"]
    assert body["garage"]["purchaseId"] == "purchase-1"
    assert body["garage"]["matchSource"] == "manual_link"
    stored_purchase = dynamodb.Table("PurchasesTable").get_item(
        Key={"purchaseId": "purchase-1"}
    )
    assert stored_purchase["Item"]["userId"] == USER["sub"]
    stored_garage = dynamodb.Table("GarageTable").get_item(Key={"userId": USER["sub"]})
    assert stored_garage["Item"]["purchaseId"] == "purchase-1"


def test_link_sem_cpf_retorna_409(dynamodb, service_loader):
    seed_profile(dynamodb, cpf="")
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "POST",
                    "/garage/link",
                    body={"purchaseId": "purchase-1"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 409
    assert response_body(result)["message"] == "Perfil sem CPF para vincular compra."


def test_link_compra_inexistente_retorna_404(dynamodb, service_loader):
    seed_profile(dynamodb)
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "POST",
                    "/garage/link",
                    body={"purchaseId": "inexistente"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 404
    assert response_body(result)["message"] == "Compra não encontrada."


def test_link_compra_de_outro_cpf_retorna_403(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_purchase(dynamodb, cpf=OTHER_CPF)
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "POST",
                    "/garage/link",
                    body={"purchaseId": "purchase-1"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 403
    assert response_body(result)["message"] == "Compra não pertence ao CPF do perfil."


def test_link_compra_ja_vinculada_retorna_409(dynamodb, service_loader):
    seed_profile(dynamodb)
    seed_purchase(dynamodb, user_id="outro-usuario")
    with service_loader("garage", GARAGE_MODULES) as modules:
        with patch.object(modules["flows"], "authenticated_user", return_value=USER):
            result = modules["handler"].lambda_handler(
                api_event(
                    "POST",
                    "/garage/link",
                    body={"purchaseId": "purchase-1"},
                    token="token",
                ),
                None,
            )

    assert result["statusCode"] == 409
    assert response_body(result)["message"] == "Compra já vinculada a outro usuário."
