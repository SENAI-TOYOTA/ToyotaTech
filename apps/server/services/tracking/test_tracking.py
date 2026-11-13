import importlib
import json
import time
from contextlib import contextmanager
from decimal import Decimal
from typing import Any, Dict, List, Optional
from unittest.mock import patch

from botocore.exceptions import ClientError

from conftest import INGEST_KEY, FakeBoto3, FakeSsm

handler = importlib.import_module("services.tracking.handler")
ingest_key = importlib.import_module("common.ingest_key")


@contextmanager
def ssm(value: str = INGEST_KEY, error: Any = None):
    fake = FakeSsm(value, error)
    with patch.object(ingest_key, "boto3", FakeBoto3(fake)):
        yield fake


TABLES: Dict[str, Any] = {}


def conditional_error(operation: str) -> ClientError:
    return ClientError(
        {
            "Error": {
                "Code": "ConditionalCheckFailedException",
                "Message": "conditional request failed",
            }
        },
        operation,
    )


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
        self.update_item_calls: List[Dict[str, Any]] = []
        self.get_item_calls: List[Dict[str, Any]] = []
        self.scan_calls: List[Dict[str, Any]] = []
        self.query_calls: List[Dict[str, Any]] = []

    def get_item(self, Key: Dict[str, Any]) -> Dict[str, Any]:
        self.get_item_calls.append(Key)
        for item in self.items:
            if all(item.get(key) == value for key, value in Key.items()):
                return {"Item": item}
        return {}

    def put_item(self, Item: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
        self.put_item_calls.append(Item)
        if "ConditionExpression" in kwargs:
            duplicate = any(
                item.get("vehicleId") == Item.get("vehicleId")
                and item.get("timestamp") == Item.get("timestamp")
                for item in self.items
            )
            if duplicate:
                raise conditional_error("PutItem")
        self.items.append(dict(Item))
        return {}

    def update_item(self, **kwargs: Any) -> Dict[str, Any]:
        self.update_item_calls.append(kwargs)
        key = kwargs.get("Key") or {}
        target = None
        for item in (*self.items, *self.query_items):
            if all(item.get(name) == value for name, value in key.items()):
                target = item
                break
        if target is None:
            return {}

        values = kwargs.get("ExpressionAttributeValues") or {}
        new_updated_at = int(values.get(":trackingUpdatedAt") or 0)
        current_updated_at = int(target.get("trackingUpdatedAt") or 0)
        if kwargs.get("ConditionExpression") and current_updated_at >= new_updated_at:
            raise conditional_error("UpdateItem")

        target["tracking"] = values.get(":tracking")
        target["trackingUpdatedAt"] = new_updated_at
        target["updatedAt"] = values.get(":updatedAt")
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
    method: str,
    path: str,
    body: Any = None,
    token: Optional[str] = None,
    key: Optional[str] = None,
) -> Dict[str, Any]:
    event: Dict[str, Any] = {
        "rawPath": path,
        "requestContext": {"http": {"method": method}, "requestId": "req-1"},
    }
    if body is not None:
        event["body"] = json.dumps(body)
    if token:
        event["headers"] = {"authorization": f"Bearer {token}"}
    if key:
        event["headers"] = {**(event.get("headers") or {}), "X-Ingest-Key": key}
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
        patch("store.get_table", get_table_mock),
        patch("services.tracking.store.get_table", get_table_mock),
        patch(
            "common.auth.get_user_by_access_token",
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
        patch("store.get_table", get_table_mock),
        patch("services.tracking.store.get_table", get_table_mock),
        patch(
            "common.auth.get_user_by_access_token",
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


def test_ingest_iot_sem_requestcontext_nao_ingere_mais() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm() as fake:
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(iot_event(), None)

    assert result["statusCode"] == 404
    assert json.loads(result["body"])["message"] == "Rota não encontrada."
    assert tracking_table.put_item_calls == []
    assert garage_table.put_item_calls == []
    assert fake.calls == []


def test_ingest_rota_http_explicita_processa_payload() -> None:
    tracking_table = FakeTable()
    garage = garage_item()
    garage_table = FakeTable(query_items=[garage])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123", "stage": "teste_de_qualidade"},
                    key=INGEST_KEY,
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

    with patch("store.get_table", get_table_mock):
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

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST", "/garage/ingest", body={"stage": "pintura"}, key=INGEST_KEY
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert (
        json.loads(result["body"])["message"]
        == "Tracking sem identificador do veículo."
    )
    assert tracking_table.put_item_calls == []


def test_ingest_veiculo_nao_vinculado() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "9BWZZZ377VT999999"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 404
    assert json.loads(result["body"])["message"] == "Veículo não vinculado."
    assert tracking_table.put_item_calls == []


def test_find_garage_by_chassi_consulta_o_indice_e_nao_varre() -> None:
    store = importlib.import_module("store")
    garage = garage_item()
    garage_table = FakeTable(query_items=[garage])
    TABLES["GarageTable"] = garage_table

    with patch("store.get_table", get_table_mock):
        found = store.find_garage_by_chassi("CHASSI_123")

    assert found == garage
    assert garage_table.scan_calls == []
    assert len(garage_table.query_calls) == 1
    query = garage_table.query_calls[0]
    assert query["IndexName"] == "chassi-index"
    assert query["Limit"] == 1


def test_find_garage_by_chassi_normaliza_espacos() -> None:
    store = importlib.import_module("store")
    garage = garage_item()
    garage_table = FakeTable(query_items=[garage])
    TABLES["GarageTable"] = garage_table

    with patch("store.get_table", get_table_mock):
        found = store.find_garage_by_chassi("  CHASSI_123  ")

    assert found == garage
    assert garage_table.scan_calls == []


def test_find_garage_by_chassi_devolve_none_quando_nao_encontra() -> None:
    store = importlib.import_module("store")
    garage_table = FakeTable(query_items=[])
    TABLES["GarageTable"] = garage_table

    with patch("store.get_table", get_table_mock):
        found = store.find_garage_by_chassi("CHASSI_INEXISTENTE")

    assert found is None
    assert garage_table.scan_calls == []


def test_find_garage_by_chassi_ignora_entrada_vazia() -> None:
    store = importlib.import_module("store")
    garage_table = FakeTable()
    TABLES["GarageTable"] = garage_table

    with patch("store.get_table", get_table_mock):
        assert store.find_garage_by_chassi("   ") is None

    assert garage_table.scan_calls == []
    assert garage_table.query_calls == []


def test_ingest_aceito_registra_o_veiculo_no_log() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch.object(handler, "log_event") as log:
            with patch("store.get_table", get_table_mock):
                result = handler.lambda_handler(
                    api_event(
                        "POST",
                        "/garage/ingest",
                        body={"chassi": "CHASSI_123"},
                        key=INGEST_KEY,
                    ),
                    None,
                )

    assert result["statusCode"] == 200
    log.assert_called_once()
    message, kwargs = log.call_args
    assert message[0] == "Tracking ingest aceito."
    assert kwargs["vehicleRef"] == "CHASSI_123"


def test_ingest_rejeitado_registra_o_veiculo_no_log() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch.object(handler, "log_event") as log:
            with patch("store.get_table", get_table_mock):
                result = handler.lambda_handler(
                    api_event(
                        "POST",
                        "/garage/ingest",
                        body={"chassi": "9BWZZZ377VT999999"},
                        key=INGEST_KEY,
                    ),
                    None,
                )

    assert result["statusCode"] == 404
    log.assert_called_once()
    message, kwargs = log.call_args
    assert message[0] == "Tracking ingest rejeitado."
    assert kwargs["vehicleRef"] == "9BWZZZ377VT999999"


def test_ingest_sem_chave_retorna_401_e_nao_grava() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event("POST", "/garage/ingest", body={"chassi": "CHASSI_123"}),
                None,
            )

    assert result["statusCode"] == 401
    assert json.loads(result["body"])["message"] == "Chave de ingest inválida."
    assert tracking_table.put_item_calls == []
    assert garage_table.put_item_calls == []


def test_ingest_com_chave_errada_retorna_401_e_nao_grava() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123"},
                    key=f"{INGEST_KEY}-errada",
                ),
                None,
            )

    assert result["statusCode"] == 401
    assert tracking_table.put_item_calls == []


def test_ingest_com_chave_correta_grava() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 200
    assert len(tracking_table.put_item_calls) == 1


def test_ingest_aceita_header_em_caixa_qualquer() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    event = api_event("POST", "/garage/ingest", body={"chassi": "CHASSI_123"})
    event["headers"] = {"x-InGeSt-KeY": INGEST_KEY}

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(event, None)

    assert result["statusCode"] == 200


def test_ingest_le_o_parametro_com_decrypt_e_uma_vez_por_execucao() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    base = int(time.time()) - 10
    with ssm() as fake:
        with patch("store.get_table", get_table_mock):
            for index in range(3):
                handler.lambda_handler(
                    api_event(
                        "POST",
                        "/garage/ingest",
                        body={"chassi": "CHASSI_123", "timestamp": base + index},
                        key=INGEST_KEY,
                    ),
                    None,
                )

    assert len(fake.calls) == 1
    assert fake.calls[0]["Name"] == "/toyotatech/garage/ingest/key"
    assert fake.calls[0]["WithDecryption"] is True
    assert len(tracking_table.put_item_calls) == 3


def test_ingest_falha_fechada_quando_o_ssm_recusa() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    denied = ClientError(
        {"Error": {"Code": "AccessDeniedException", "Message": "denied"}},
        "GetParameter",
    )

    with ssm(error=denied):
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 500
    assert (
        json.loads(result["body"])["message"] == "Chave de ingest indisponível no SSM."
    )
    assert tracking_table.put_item_calls == []
    assert garage_table.put_item_calls == []


def test_ingest_falha_fechada_quando_o_parametro_nao_existe() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    missing = ClientError(
        {"Error": {"Code": "ParameterNotFound", "Message": "not found"}},
        "GetParameter",
    )

    with ssm(error=missing):
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 500
    assert tracking_table.put_item_calls == []


def test_ingest_falha_fechada_quando_a_chave_vem_vazia() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm(value="   "):
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 500
    assert json.loads(result["body"])["message"] == "Chave de ingest vazia no SSM."
    assert tracking_table.put_item_calls == []


def test_ingest_falha_fechada_sem_parametro_configurado() -> None:
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm() as fake:
        with patch.object(ingest_key, "INGEST_KEY_PARAMETER_NAME", ""):
            with patch("store.get_table", get_table_mock):
                result = handler.lambda_handler(
                    api_event(
                        "POST",
                        "/garage/ingest",
                        body={"chassi": "CHASSI_123"},
                        key=INGEST_KEY,
                    ),
                    None,
                )

    assert result["statusCode"] == 500
    assert (
        json.loads(result["body"])["message"]
        == "Parâmetro da chave de ingest não configurado."
    )
    assert fake.calls == []
    assert tracking_table.put_item_calls == []


def test_status_nao_exige_a_chave_de_ingest() -> None:
    tracking_table = FakeTable(query_items=[])
    garage_table = FakeTable(items=[garage_item()])
    wire_tables(tracking_table, garage_table)

    with ssm() as fake:
        with (
            patch("store.get_table", get_table_mock),
            patch(
                "common.auth.get_user_by_access_token",
                return_value=cognito_user(),
            ),
        ):
            result = handler.lambda_handler(
                api_event("GET", "/garage/status", token="token"), None
            )

    assert result["statusCode"] == 200
    assert fake.calls == []


def test_ingest_vin17_atualiza_tracking_da_garage() -> None:
    tracking_table = FakeTable()
    garage = garage_item()
    garage_table = FakeTable(query_items=[garage])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "9BWZZZ377VT004251",
                        "stage": "pintura",
                        "timestamp": 1773568800,
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["tracking"]["vehicleId"] == "9BWZZZ377VT004251"
    assert body["tracking"]["currentStepIndex"] == 1
    assert tracking_table.put_item_calls[0]["timestamp"] == 1773568800
    assert garage["tracking"] == body["tracking"]
    assert garage["trackingUpdatedAt"] == 1773568800


def test_ingest_chassi_invalido_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_INEXISTENTE", "stage": "pintura"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Chassi do veículo inválido."
    assert tracking_table.put_item_calls == []


def test_ingest_stage_fora_do_enum_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123", "stage": "etapa_inexistente"},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Etapa de tracking inválida."
    assert tracking_table.put_item_calls == []


def test_ingest_indice_de_etapa_fora_da_faixa_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123", "currentStepIndex": 9},
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Etapa de tracking inválida."
    assert tracking_table.put_item_calls == []


def test_ingest_timestamp_no_futuro_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "timestamp": int(time.time()) + 3600,
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Timestamp de tracking no futuro."
    assert tracking_table.put_item_calls == []


def test_ingest_timestamp_invalido_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "eventTime": "data-invalida",
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Timestamp de tracking inválido."
    assert tracking_table.put_item_calls == []


def test_ingest_timestamp_iso8601_e_persistido() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "eventTime": "2026-03-15T10:00:00Z",
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 200
    assert tracking_table.put_item_calls[0]["timestamp"] == 1773568800


def test_ingest_evento_duplicado_nao_cria_segundo_item() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))
    body = {
        "chassi": "CHASSI_123",
        "stage": "pintura",
        "timestamp": 1773568800,
    }

    with ssm():
        with patch("store.get_table", get_table_mock):
            first = handler.lambda_handler(
                api_event("POST", "/garage/ingest", body=body, key=INGEST_KEY),
                None,
            )
            second = handler.lambda_handler(
                api_event("POST", "/garage/ingest", body=body, key=INGEST_KEY),
                None,
            )

    assert first["statusCode"] == 200
    assert second["statusCode"] == 200
    assert len(tracking_table.items) == 1
    assert len(tracking_table.put_item_calls) == 1


def test_ingest_evento_atrasado_nao_regride_a_garage() -> None:
    garage = garage_item()
    garage["trackingUpdatedAt"] = 2000
    garage["tracking"] = {**garage["tracking"], "currentStepIndex": 3}
    tracking_table = FakeTable()
    garage_table = FakeTable(query_items=[garage])
    wire_tables(tracking_table, garage_table)

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "inicio",
                        "timestamp": 1500,
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 200
    assert json.loads(result["body"])["tracking"]["currentStepIndex"] == 3
    assert tracking_table.put_item_calls == []
    assert garage_table.update_item_calls == []
    assert garage["trackingUpdatedAt"] == 2000


def test_ingest_header_nao_ascii_retorna_401() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123", "stage": "pintura"},
                    key="ç",
                ),
                None,
            )

    assert result["statusCode"] == 401
    assert json.loads(result["body"])["message"] == "Chave de ingest inválida."
    assert tracking_table.put_item_calls == []


def test_ingest_timestamp_infinito_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "timestamp": float("inf"),
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Timestamp de tracking inválido."
    assert tracking_table.put_item_calls == []


def test_ingest_timestamp_cientifico_gigante_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "timestamp": "1e400",
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Timestamp de tracking inválido."
    assert tracking_table.put_item_calls == []


def test_ingest_payload_com_float_e_persistido_como_decimal() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "timestamp": 1773568800,
                        "temperatura": 24.5,
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 200
    payload = tracking_table.put_item_calls[0]["payload"]
    assert payload["temperatura"] == Decimal("24.5")


def test_ingest_replay_no_mesmo_timestamp_nao_sobrescreve_garage() -> None:
    tracking_table = FakeTable()
    garage = garage_item()
    garage_table = FakeTable(query_items=[garage])
    wire_tables(tracking_table, garage_table)
    first_body = {
        "chassi": "CHASSI_123",
        "stage": "pintura",
        "timestamp": 1773568800,
    }
    replay_body = {
        "chassi": "CHASSI_123",
        "stage": "entrega",
        "timestamp": 1773568800,
    }

    with ssm():
        with patch("store.get_table", get_table_mock):
            first = handler.lambda_handler(
                api_event("POST", "/garage/ingest", body=first_body, key=INGEST_KEY),
                None,
            )
            replay = handler.lambda_handler(
                api_event("POST", "/garage/ingest", body=replay_body, key=INGEST_KEY),
                None,
            )

    assert first["statusCode"] == 200
    assert replay["statusCode"] == 200
    assert len(tracking_table.items) == 1
    assert garage_table.update_item_calls and len(garage_table.update_item_calls) == 1
    assert garage["tracking"]["currentStepIndex"] == 1
    assert garage["trackingUpdatedAt"] == 1773568800


def test_ingest_body_acima_do_limite_retorna_413() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    event = api_event(
        "POST",
        "/garage/ingest",
        body={"chassi": "CHASSI_123", "stage": "pintura"},
        key=INGEST_KEY,
    )
    event["body"] = "x" * 17000

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(event, None)

    assert result["statusCode"] == 413
    assert json.loads(result["body"])["message"] == "Payload de tracking muito grande."
    assert tracking_table.put_item_calls == []


def test_ingest_key_cache_expira_apos_o_ttl() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))
    body = {"chassi": "CHASSI_123", "stage": "pintura"}

    with ssm() as fake:
        with patch("store.get_table", get_table_mock):
            handler.lambda_handler(
                api_event("POST", "/garage/ingest", body=body, key=INGEST_KEY),
                None,
            )
            ingest_key._cached_at = time.monotonic() - 301
            handler.lambda_handler(
                api_event("POST", "/garage/ingest", body=body, key=INGEST_KEY),
                None,
            )

    assert len(fake.calls) == 2


def test_ingest_payload_com_nan_retorna_400() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={
                        "chassi": "CHASSI_123",
                        "stage": "pintura",
                        "timestamp": 1773568800,
                        "temperatura": float("nan"),
                    },
                    key=INGEST_KEY,
                ),
                None,
            )

    assert result["statusCode"] == 400
    assert json.loads(result["body"])["message"] == "Payload de tracking inválido."
    assert tracking_table.put_item_calls == []


def test_ingest_header_com_surrogate_retorna_401() -> None:
    tracking_table = FakeTable()
    wire_tables(tracking_table, FakeTable(query_items=[garage_item()]))

    with ssm():
        with patch("store.get_table", get_table_mock):
            result = handler.lambda_handler(
                api_event(
                    "POST",
                    "/garage/ingest",
                    body={"chassi": "CHASSI_123", "stage": "pintura"},
                    key=chr(0xD800),
                ),
                None,
            )

    assert result["statusCode"] == 401
    assert json.loads(result["body"])["message"] == "Chave de ingest inválida."
    assert tracking_table.put_item_calls == []


def test_update_garage_tracking_nao_sobrescreve_mesmo_timestamp() -> None:
    store = importlib.import_module("store")
    garage = {"userId": "user-1", "trackingUpdatedAt": 2000}
    TABLES["GarageTable"] = FakeTable(items=[garage])

    tracking = {"currentStepIndex": 9}
    with patch("store.get_table", get_table_mock):
        assert store.update_garage_tracking("user-1", tracking, 2000) is False
        assert store.update_garage_tracking("user-1", tracking, 2001) is True

    assert garage["trackingUpdatedAt"] == 2001


def test_format_tracking_date_aceita_decimal() -> None:
    assert handler.ingest.format_tracking_date(Decimal("1773568800")) == "15/03/2026"
