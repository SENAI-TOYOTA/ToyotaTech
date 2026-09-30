import os
import sys
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parents[2]
COMMON_DIR = SERVER_DIR / "layers" / "common" / "python"

for path in (str(COMMON_DIR), str(SERVER_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)

os.environ.setdefault("COGNITO_USER_POOL_ID", "us-east-1_testPool")
os.environ.setdefault("COGNITO_CLIENT_ID", "testClientId")
os.environ.setdefault("COGNITO_REGION", "us-east-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_REGION", "us-east-1")
