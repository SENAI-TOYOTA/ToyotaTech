import json
from typing import Any, Dict, List, Optional
from unittest.mock import patch

from services.tracking import handler

TABLES: Dict[str, Any] = {}


class FakeTable:
    def __init__(
        self,
        items: Optional[List[Dict[str, Any]]] = None,
        scan_items: Optional[List[Dict[str, Any]]] = None,
        query_items: Optional[List[Dict[str, Any]]] = None,
    ):
        self.items = list(items or [])
        self.scan_items = list(scan_items or [])
        self.query_items = list(query_items or [])
        self.put_item_calls: List[Dict[str, Any]] = []
        self.get_item_calls: List[Dict[str, Any]] = []
        self.scan_calls: List[Dict[str, Any]] = []
        self.query_calls: List[Dict[str, Any]] = []

    def get_item(self, Key: Dict[str, Any]) -> Dict[str, Any]:
        self.get_item_calls.append(Key)
        for item in self.items:
            if all(item.get(key) == value for key, value in Key.items()):
                return {"Item": item}
        return {}

    def put_item(self, Item: Dict[str, Any], **_kwargs: Any) -> Dict[str, Any]:
        self.put_item_calls.append(Item)
        return {}

    def scan(self, **kwargs: Any) -> Dict[str, Any]:
        self.scan_calls.append(kwargs)
        return {"Items": self.scan_items}

    def query(self, **kwargs: Any) -> Dict[str, Any]:
        self.query_calls.append(kwargs)
        return {"Items": self.query_items}


def wire_tables(tracking: FakeTable, garage: FakeTable) -> None:
    TABLES.clear()
    TABLES["TrackingTable"] = tracking
    TABLES["GarageTable"] = garage


def get_table_mock(name: str) -> Any:
    return TABLES[name]


def cognito_user(sub: str = "user-1") -> Dict[str, Any]:
    return {
        "Username": "user@test.com",
        "UserAttributes": [
            {"Name": "sub", "Value": sub},
            {"Name": "email", "Value": "user@test.com"},
        ],
    }


def garage_item() -> Dict[str, Any]:
    return {
        "userId": "user-1",
        "tracking": {
            "vehicleId": "CHASSI_123",
            "model": "Corolla",
            "currentStepIndex": 0,
        },
        "vehicle": {"chassi": "CHASSI_123", "model": "Corolla"},
        "trackingUpdatedAt": 100,
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
        event["headers"] = {"authorization": f"Bearer {token}"}
    return event


def iot_event() -> Dict[str, Any]:
    return {
        "state": {
            "reported": {
                "chassi": "CHASSI_123",
                "stage": "pintura",
                "status": "EM_ANDAMENTO",
            }
        }
    }


def test_status_sem_token_retorna_401() -> None:
    wire_tables(FakeTable(), FakeTable())
    result = handler.lambda_handler(api_event("GET", "/garage/status"), None)
    assert result["statusCode"] == 401
    assert json.loads(result["body"])["message"] == "Token não informado."
    assert all(not table.put_item_calls for table in TABLES.values())


def test_status_retorna_tracking_da_garage() -> None:
    old_event = {
        "vehicleId": "CHASSI_123",
        "receivedAt": 50,
        "payload": {"chassi": "CHASSI_123", "currentStepIndex": 4},
    }
    tracking_table = FakeTable(query_items=[old_event])
    garage_table = FakeTable(items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with (
        patch("services.tracking.store.get_table", get_table_mock),
        patch(
            "services.tracking.handler.get_user_by_access_token",
            return_value=cognito_user(),
        ),
    ):
        result = handler.lambda_handler(
            api_event("GET", "/garage/status", token="token"), None
        )

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["tracking"]["vehicleId"] == "CHASSI_123"
    assert body["tracking"]["currentStepIndex"] == 0
    assert len(garage_table.get_item_calls) == 1
    assert garage_table.get_item_calls[0] == {"userId": "user-1"}
    assert len(tracking_table.query_calls) == 1
    assert tracking_table.query_calls[0]["ScanIndexForward"] is False
    assert tracking_table.query_calls[0]["Limit"] == 1


def test_status_evento_mais_recente_da_tracking_table_ganha() -> None:
    new_event = {
        "vehicleId": "CHASSI_123",
        "receivedAt": 200,
        "payload": {"chassi": "CHASSI_123", "currentStepIndex": 4},
    }
    tracking_table = FakeTable(query_items=[new_event])
    garage_table = FakeTable(items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with (
        patch("services.tracking.store.get_table", get_table_mock),
        patch(
            "services.tracking.handler.get_user_by_access_token",
            return_value=cognito_user(),
        ),
    ):
        result = handler.lambda_handler(
            api_event("GET", "/garage/status", token="token"), None
        )

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["tracking"]["currentStepIndex"] == 4
    assert body["tracking"]["steps"][4]["status"] == "current"


def test_ingest_iot_sem_requestcontext_grava_na_tracking_table() -> None:
    tracking_table = FakeTable()
    garage = garage_item()
    garage_table = FakeTable(scan_items=[garage])
    wire_tables(tracking_table, garage_table)

    with patch("services.tracking.store.get_table", get_table_mock):
        result = handler.lambda_handler(iot_event(), None)

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["tracking"]["currentStepIndex"] == 1

    assert len(tracking_table.put_item_calls) == 1
    item = tracking_table.put_item_calls[0]
    assert item["vehicleId"] == "CHASSI_123"
    assert isinstance(item["timestamp"], int)
    assert isinstance(item["receivedAt"], int)
    assert item["stage"] == "pintura"
    assert item["payload"] == {
        "chassi": "CHASSI_123",
        "stage": "pintura",
        "status": "EM_ANDAMENTO",
    }
    assert len(garage_table.scan_calls) == 1
    assert garage_table.put_item_calls == []


def test_ingest_rota_http_explicita_processa_payload() -> None:
    """No novo design o ingest é a rota explícita POST /garage/ingest."""
    tracking_table = FakeTable()
    garage = garage_item()
    garage_table = FakeTable(scan_items=[garage])
    wire_tables(tracking_table, garage_table)

    with patch("services.tracking.store.get_table", get_table_mock):
        result = handler.lambda_handler(
            api_event(
                "POST",
                "/garage/ingest",
                body={"chassi": "CHASSI_123", "stage": "teste_de_qualidade"},
            ),
            None,
        )

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["tracking"]["currentStepIndex"] == 2
    assert len(tracking_table.put_item_calls) == 1
    assert tracking_table.put_item_calls[0]["vehicleId"] == "CHASSI_123"


def test_ingest_com_requestcontext_nao_dispara_path_iot() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable())

    with patch("services.tracking.store.get_table", get_table_mock):
        result = handler.lambda_handler(
            api_event(
                "POST",
                "/rota-desconhecida",
                body={"chassi": "CHASSI_123", "stage": "pintura"},
            ),
            None,
        )

    assert result["statusCode"] == 404
    assert json.loads(result["body"])["message"] == "Rota não encontrada."
    assert tracking_table.put_item_calls == []


def test_ingest_sem_identificador_do_veiculo() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable())

    with patch("services.tracking.store.get_table", get_table_mock):
        result = handler.lambda_handler(
            api_event("POST", "/garage/ingest", body={"stage": "pintura"}), None
        )

    assert result["statusCode"] == 400
    assert (
        json.loads(result["body"])["message"]
        == "Tracking sem identificador do veículo."
    )
    assert tracking_table.put_item_calls == []


def test_ingest_veiculo_nao_vinculado() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(scan_items=[])
    wire_tables(tracking_table, garage_table)

    with patch("services.tracking.store.get_table", get_table_mock):
        result = handler.lambda_handler(
            api_event("POST", "/garage/ingest", body={"chassi": "CHASSI_INEXISTENTE"}),
            None,
        )

    assert result["statusCode"] == 404
    assert json.loads(result["body"])["message"] == "Veículo não vinculado."
    assert tracking_table.put_item_calls == []
