import os
import sys
from pathlib import Path

import pytest

SERVER_DIR = Path(__file__).resolve().parents[2]
COMMON_DIR = SERVER_DIR / "layers" / "common" / "python"
SERVICE_DIR = SERVER_DIR / "services" / "tracking"

for path in (str(COMMON_DIR), str(SERVER_DIR), str(SERVICE_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)

os.environ.setdefault("TRACKING_TABLE_NAME", "TrackingTable")
os.environ.setdefault("GARAGE_TABLE_NAME", "GarageTable")
os.environ.setdefault("PROFILE_TABLE_NAME", "ProfileTable")
os.environ.setdefault("INGEST_KEY_PARAMETER_NAME", "/toyotatech/garage/ingest/key")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")

INGEST_KEY = "chave-de-ingest-de-teste"


class FakeSsm:
    def __init__(self, value: str = INGEST_KEY, error=None):
        self.value = value
        self.error = error
        self.calls = []

    def get_parameter(self, Name, WithDecryption):
        self.calls.append({"Name": Name, "WithDecryption": WithDecryption})
        if self.error is not None:
            raise self.error
        return {"Parameter": {"Value": self.value}}


class FakeBoto3:
    def __init__(self, ssm: FakeSsm):
        self._ssm = ssm

    def client(self, service_name):
        assert service_name == "ssm"
        return self._ssm


@pytest.fixture(autouse=True)
def reset_ingest_key():
    import common.ingest_key as ingest_key

    ingest_key._cached_key = None
    yield
    ingest_key._cached_key = None
