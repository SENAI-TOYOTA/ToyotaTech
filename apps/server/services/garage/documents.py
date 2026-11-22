import os
from copy import deepcopy
from typing import Any, Dict

import boto3
from botocore.config import Config

from common.ddb import REGION

DOCUMENTS_BUCKET = os.environ.get("DOCUMENTS_BUCKET", "")
CRLV_DEMO_KEY = "documents/demo/crlv.pdf"
PRESIGN_TTL_SECONDS = 300


def _presign_crlv() -> str:
    client = boto3.client(
        "s3",
        region_name=REGION,
        config=Config(signature_version="s3v4"),
    )
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": DOCUMENTS_BUCKET, "Key": CRLV_DEMO_KEY},
        ExpiresIn=PRESIGN_TTL_SECONDS,
    )


def attach_document_urls(garage: Dict[str, Any]) -> Dict[str, Any]:
    result = deepcopy(garage)
    documents = result.get("documents")
    if not isinstance(documents, list) or not DOCUMENTS_BUCKET:
        return result

    for document in documents:
        if not isinstance(document, dict) or document.get("id") != "crlv":
            continue
        if document.get("status") == "available":
            document["url"] = _presign_crlv()
        break
    return result
