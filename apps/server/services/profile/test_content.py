import json
from typing import Any, Dict, Optional

PROFILE_MODULES = ("content", "flows", "handler", "validation")

DEFAULT_IDS = ["economia-hibrida", "toyota-safety-sense", "acessorios-originais"]

PAGINATION_ITEMS = [
    {"id": "um", "title": "Um", "imageKey": "corolla-main"},
    {"id": "dois", "title": "Dois", "imageKey": "corolla-side"},
    {"id": "tres", "title": "Três", "imageKey": "corolla-news"},
]

TYPE_ITEMS = [
    {"id": "guia", "title": "Guia", "imageKey": "corolla-main", "category": "guide"},
    {
        "id": "noticia",
        "title": "Notícia",
        "imageKey": "corolla-news",
        "category": "news",
    },
    {"id": "sem", "title": "Sem categoria", "imageKey": "corolla-side"},
]

FILTER_ITEMS = [
    {
        "id": "hibrido",
        "title": "Economia Híbrida",
        "summary": "Dicas de consumo",
        "imageKey": "corolla-main",
        "category": "guide",
        "categoryLabel": "MANUTENÇÃO",
        "publishedAt": "26/11/2026",
    },
    {
        "id": "seguranca",
        "title": "Toyota Safety Sense",
        "summary": "Radares de frenagem",
        "imageKey": "corolla-news",
        "category": "guide",
        "categoryLabel": "TECNOLOGIA",
        "publishedAt": "25/11/2026",
    },
    {
        "id": "acessorios",
        "title": "Acessórios Originais",
        "summary": "Customização de fábrica",
        "imageKey": "corolla-side",
        "category": "news",
        "categoryLabel": "ESTILO",
        "publishedAt": "24/11/2026",
    },
    {
        "id": "servicos",
        "title": "Serviços Toyota",
        "summary": "Revisão programada",
        "imageKey": "corolla-main",
        "category": "news",
        "categoryLabel": "SERVIÇOS",
        "publishedAt": "23/11/2026",
    },
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
    assert len(body["highlights"]) == 32
    assert [item["id"] for item in body["highlights"][:3]] == DEFAULT_IDS
    assert body["highlights"][0] == {
        "id": "economia-hibrida",
        "title": "Economia Híbrida",
        "imageKey": "economia-hibrida",
        "categoryLabel": "HÍBRIDOS",
        "description": "Dicas para maximizar o uso elétrico no seu Corolla.",
        "category": "guide",
        "summary": "Veja como usar o modo elétrico com mais frequência no dia a dia.",
        "publishedAt": "26/11/2026",
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
                    "categoryLabel": "CAMPANHA",
                    "description": "Descrição da campanha.",
                    "category": "news",
                    "summary": "Resumo da campanha.",
                    "publishedAt": "24/11/2026",
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
                "categoryLabel": "CAMPANHA",
                "description": "Descrição da campanha.",
                "category": "news",
                "summary": "Resumo da campanha.",
                "publishedAt": "24/11/2026",
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


def test_highlights_filtra_por_type(dynamodb, service_loader):
    seed_highlights(dynamodb, TYPE_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:

        def request(params: Dict[str, str]) -> list:
            result = modules["handler"].lambda_handler(
                api_event("GET", "/content/highlights", params), None
            )
            assert result["statusCode"] == 200
            return [item["id"] for item in response_body(result)["highlights"]]

        assert request({"type": "guide"}) == ["guia"]
        assert request({"type": "NEWS"}) == ["noticia"]
        assert request({"type": "invalido"}) == ["guia", "noticia", "sem"]


def test_highlights_busca_em_titulo_e_resumo(dynamodb, service_loader):
    seed_highlights(dynamodb, FILTER_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:

        def request(params: Dict[str, str]) -> list:
            result = modules["handler"].lambda_handler(
                api_event("GET", "/content/highlights", params), None
            )
            assert result["statusCode"] == 200
            return [item["id"] for item in response_body(result)["highlights"]]

        assert request({"q": "hibrida"}) == ["hibrido"]
        assert request({"q": "revisao"}) == ["servicos"]
        assert request({"q": "TOYOTA"}) == ["seguranca", "servicos"]


def test_highlights_filtra_por_categoria(dynamodb, service_loader):
    seed_highlights(dynamodb, FILTER_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:

        def request(params: Dict[str, str]) -> list:
            result = modules["handler"].lambda_handler(
                api_event("GET", "/content/highlights", params), None
            )
            assert result["statusCode"] == 200
            return [item["id"] for item in response_body(result)["highlights"]]

        assert request({"category": "estilo"}) == ["acessorios"]
        assert request({"category": "MANUTENÇÃO"}) == ["hibrido"]
        assert request({"type": "guide", "category": "TECNOLOGIA"}) == ["seguranca"]
        assert request({"type": "news", "category": "TECNOLOGIA"}) == []


def test_highlights_ordena_e_pagina(dynamodb, service_loader):
    seed_highlights(dynamodb, FILTER_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        first = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "2"}), None
        )
        second = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "2", "offset": "2"}),
            None,
        )
        oldest = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "1", "sort": "oldest"}),
            None,
        )
        invalid_sort = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "1", "sort": "x"}),
            None,
        )

    first_body = response_body(first)
    second_body = response_body(second)
    assert [item["id"] for item in first_body["highlights"]] == [
        "hibrido",
        "seguranca",
    ]
    assert first_body["hasMore"] is True
    assert first_body["nextOffset"] == 2
    assert first_body["total"] == 4
    assert first_body["categories"] == [
        "MANUTENÇÃO",
        "TECNOLOGIA",
        "ESTILO",
        "SERVIÇOS",
    ]
    assert [item["id"] for item in second_body["highlights"]] == [
        "acessorios",
        "servicos",
    ]
    assert second_body["hasMore"] is False
    assert second_body["nextOffset"] is None
    assert [item["id"] for item in response_body(oldest)["highlights"]] == ["servicos"]
    assert [item["id"] for item in response_body(invalid_sort)["highlights"]] == [
        "hibrido"
    ]


def test_highlights_categorias_refletem_filtros(dynamodb, service_loader):
    seed_highlights(dynamodb, FILTER_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        guides = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"type": "guide", "limit": "2"}),
            None,
        )
        search = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"q": "revisao", "limit": "2"}),
            None,
        )

    assert response_body(guides)["categories"] == ["MANUTENÇÃO", "TECNOLOGIA"]
    assert response_body(search)["categories"] == ["SERVIÇOS"]


def test_highlights_respeita_limit_na_query_string(dynamodb, service_loader):
    seed_highlights(dynamodb, PAGINATION_ITEMS)

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights", {"limit": "2"}), None
        )

    assert result["statusCode"] == 200
    body = response_body(result)
    assert [item["id"] for item in body["highlights"]] == ["um", "dois"]
    assert body["hasMore"] is True
    assert body["nextOffset"] == 2
    assert body["total"] == 3
    assert body["categories"] == []


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
    assert body["hasMore"] is False
    assert body["nextOffset"] is None
    assert body["total"] == 3


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
    assert response_body(result) == {
        "highlights": [],
        "hasMore": False,
        "nextOffset": None,
        "total": 3,
        "categories": [],
    }


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


DETAIL_ITEM = {
    "id": "corolla",
    "title": "Corolla Altis",
    "imageKey": "corolla-main",
    "imageUrl": "https://example.com/corolla.jpg",
    "categoryLabel": "LANÇAMENTO",
    "description": "Descrição do conteúdo.",
    "category": "guide",
    "author": "Equipe ToyotaTech",
    "publishedAt": "22/11/2026",
    "readingTime": 4,
    "summary": "Resumo do conteúdo.",
    "body": ["Primeiro parágrafo.", "Segundo parágrafo."],
    "sourceName": "Toyota Comunica",
    "sourceUrl": "https://example.com/noticia",
}


def test_content_detail_retorna_conteudo_completo(dynamodb, service_loader):
    seed_highlights(dynamodb, [DETAIL_ITEM])

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights/corolla"), None
        )

    assert result["statusCode"] == 200
    content = response_body(result)["content"]
    assert content["id"] == "corolla"
    assert content["category"] == "guide"
    assert content["author"] == "Equipe ToyotaTech"
    assert content["readingTime"] == 4
    assert content["body"] == ["Primeiro parágrafo.", "Segundo parágrafo."]
    assert content["sourceName"] == "Toyota Comunica"
    assert content["sourceUrl"] == "https://example.com/noticia"


def test_content_detail_desconhecido_retorna_404(dynamodb, service_loader):
    seed_highlights(dynamodb, [DETAIL_ITEM])

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights/inexistente"), None
        )

    assert result["statusCode"] == 404
    assert response_body(result) == {"message": "Conteúdo não encontrado."}


def test_content_detail_sem_tabela_retorna_404(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights/inexistente"), None
        )

    assert result["statusCode"] == 404


def test_content_detail_usa_padrao_quando_tabela_esta_vazia(dynamodb, service_loader):
    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights/economia-hibrida"), None
        )

    assert result["statusCode"] == 200
    content = response_body(result)["content"]
    assert content["id"] == "economia-hibrida"
    assert content["category"] == "guide"
    assert content["summary"] == (
        "Veja como usar o modo elétrico com mais frequência no dia a dia."
    )
    assert len(content["body"]) == 2


def test_content_detail_normaliza_campos_invalidos(dynamodb, service_loader):
    seed_highlights(
        dynamodb,
        [
            {
                "id": "corolla",
                "title": "Corolla Altis",
                "imageKey": "corolla-main",
                "category": "outro",
                "readingTime": "abc",
                "body": "texto solto",
                "sourceUrl": "http://example.com/inseguro",
            }
        ],
    )

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights/corolla"), None
        )

    assert result["statusCode"] == 200
    content = response_body(result)["content"]
    assert "category" not in content
    assert "readingTime" not in content
    assert "sourceUrl" not in content
    assert content["body"] == []


def test_highlights_lista_nao_inclui_campos_de_detalhe(dynamodb, service_loader):
    seed_highlights(dynamodb, [DETAIL_ITEM])

    with service_loader("profile", PROFILE_MODULES) as modules:
        result = modules["handler"].lambda_handler(
            api_event("GET", "/content/highlights"), None
        )

    assert result["statusCode"] == 200
    item = response_body(result)["highlights"][0]
    assert set(item) == {
        "id",
        "title",
        "imageKey",
        "imageUrl",
        "categoryLabel",
        "description",
        "category",
        "summary",
        "publishedAt",
    }
