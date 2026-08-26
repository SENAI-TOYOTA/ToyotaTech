import os
import sys
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parents[2]
COMMON_DIR = SERVER_DIR / "layers" / "common" / "python"

for path in (str(COMMON_DIR), str(SERVER_DIR)):
    if path not in sys.path:
        sys.path.insert(0, path)

os.environ.setdefault("TRACKING_TABLE_NAME", "TrackingTable")
os.environ.setdefault("GARAGE_TABLE_NAME", "GarageTable")
os.environ.setdefault("PROFILE_TABLE_NAME", "ProfileTable")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
