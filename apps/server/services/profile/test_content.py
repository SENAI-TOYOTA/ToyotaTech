import json
from typing import Any, Dict, Optional

PROFILE_MODULES = ("content", "flows", "handler", "validation")

DEFAULT_IDS = ["corolla", "yaris", "services", "lifestyle"]

PAGINATION_ITEMS = [
    {"id": "um", "title": "Um", "imageKey": "corolla-main"},
    {"id": "dois", "title": "Dois", "imageKey": "corolla-side"},
    {"id": "tres", "title": "Três", "imageKey": "corolla-news"},
]


def api_event(
    method: str, path: str, query: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    event: Dict[str, Any] = {
        "rawPath": path,
        "requestContext": {"http": {"method": method}, "requestId": "req-1"},
    }
    if query:
        event["queryStringParameters"] = query
    return event


def seed_highlights(dynamodb: Any, highlights: Any) -> None:
    dynamodb.Table("ContentTable").put_item(
        Item={"pk": "highlights", "highlights": highlights}
    )


def response_body(result: Dict[str, Any]) -> Dict[str, Any]:
    return json.loads(result["body"])


def test_highlights_usa_padrao_quando_tabela_esta_vazia(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == DEFAULT_IDS
    assert body["highlights"][0] == {
        "id": "corolla",
        "title": "Corolla Altis",
        "imageKey": "corolla-main",
    }


def test_highlights_le_item_persistido_e_ignora_invalidos(dynamodb, service_loader):
    dynamodb.Table("ContentTable").put_item(
        Item={
            "pk": "highlights",
            "highlights": [
                {
                    "id": "campanha",
                    "title": "Campanha Toyota",
                    "imageKey": "corolla-news",
                    "extra": "ignorado",
                },
                {"id": "", "title": "Sem id", "imageKey": "corolla-main"},
                {"id": "sem-imagem", "title": "Sem imagem"},
            ],
        }
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    assert response_body(result) == {
        "highlights": [
            {
                "id": "campanha",
                "title": "Campanha Toyota",
                "imageKey": "corolla-news",
            }
        ]
    }


def test_highlights_respeita_lista_vazia_persistida(dynamodb, service_loader):
    dynamodb.Table("ContentTable").put_item(Item={"pk": "highlights", "highlights": []})

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    assert response_body(result) == {"highlights": []}


def test_highlights_respeita_limit_na_query_string(dynamodb, service_loader):
    seed_highlights(dynamodb, PAGINATION_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "2"}), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == ["um", "dois"]


def test_highlights_aplica_offset_com_limit(dynamodb, service_loader):
    seed_highlights(dynamodb, PAGINATION_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"offset": "1", "limit": "2"}),
            None,
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == ["dois", "tres"]


def test_highlights_limit_apos_normalizacao(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {"id": "um", "title": "Um", "imageKey": "corolla-main"},
            {"id": "", "title": "Inválido", "imageKey": "corolla-side"},
            {"id": "dois", "title": "Dois", "imageKey": "corolla-news"},
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "2"}), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == ["um", "dois"]


def test_highlights_ignora_query_string_invalida(dynamodb, service_loader):
    seed_highlights(dynamodb, PAGINATION_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "abc"}), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == ["um", "dois", "tres"]


def test_highlights_normaliza_imageurl(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {
                "id": "com-url",
                "title": "Com URL",
                "imageKey": "corolla-main",
                "imageUrl": "https://example.com/highlight.jpg",
            },
            {"id": "sem-url", "title": "Sem URL", "imageKey": "corolla-side"},
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert body["highlights"][0]["imageUrl"] == "https://example.com/highlight.jpg"
    assert "imageUrl" not in body["highlights"][1]


def test_highlights_aplica_offset_sem_limit(dynamodb, service_loader):
    seed_highlights(dynamodb, PAGINATION_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"offset": "1"}), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == ["dois", "tres"]


def test_highlights_limit_zero_retorna_lista_vazia(dynamodb, service_loader):
    seed_highlights(dynamodb, PAGINATION_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "0"}), None
        )

    assert result["statusCode"] == 200
    assert response_body(result) == {"highlights": []}


def test_highlights_rejeita_imageurl_inseguro(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {
                "id": "http",
                "title": "HTTP",
                "imageKey": "corolla-main",
                "imageUrl": "http://example.com/x.jpg",
            },
            {
                "id": "data",
                "title": "Data URI",
                "imageKey": "corolla-main",
                "imageUrl": "data:image/png;base64,AAAA",
            },
            {
                "id": "javascript",
                "title": "JavaScript",
                "imageKey": "corolla-main",
                "imageUrl": "javascript:alert(1)",
            },
            {
                "id": "vazio",
                "title": "Vazio",
                "imageKey": "corolla-main",
                "imageUrl": "",
            },
            {
                "id": "sem-host",
                "title": "Sem host",
                "imageKey": "corolla-main",
                "imageUrl": "https://",
            },
            {
                "id": "seguro",
                "title": "Seguro",
                "imageKey": "corolla-main",
                "imageUrl": "https://example.com/x.jpg?w=120",
            },
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert len(body["highlights"]) == 6
    assert all("imageUrl" not in item for item in body["highlights"][:5])
    assert body["highlights"][5]["imageUrl"] == "https://example.com/x.jpg?w=120"


def test_highlights_imageurl_exige_netloc(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {
                "id": "query",
                "title": "Query",
                "imageKey": "corolla-main",
                "imageUrl": "https://?x",
            },
            {
                "id": "fragmento",
                "title": "Fragmento",
                "imageKey": "corolla-side",
                "imageUrl": "https://#",
            },
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert len(body["highlights"]) == 2
    assert all("imageUrl" not in item for item in body["highlights"])


def test_highlights_imageurl_aceita_scheme_maiusculo(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {
                "id": "maiusculo",
                "title": "Maiúsculo",
                "imageKey": "corolla-main",
                "imageUrl": "HTTPS://example.com/x.jpg",
            }
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert body["highlights"][0]["imageUrl"] == "HTTPS://example.com/x.jpg"


def test_highlights_imageurl_malformada_nao_quebra(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {
                "id": "ipv6",
                "title": "IPv6 inválido",
                "imageKey": "corolla-main",
                "imageUrl": "https://[",
            },
            {
                "id": "fechamento",
                "title": "Fechamento inválido",
                "imageKey": "corolla-side",
                "imageUrl": "https://]",
            },
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert len(body["highlights"]) == 2
    assert all("imageUrl" not in item for item in body["highlights"])
