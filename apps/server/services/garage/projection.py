import time
from typing import Any, Dict, List

from . import demo, purchases, validation


def merge_purchase_source(purchase: Dict[str, Any]) -> Dict[str, Any]:
    source = dict(purchase)
    garage = source.get("garage")
    if isinstance(garage, dict):
        for key, value in garage.items():
            if source.get(key) in (None, "", [], {}):
                source[key] = value
    return source


def _merge_documents(default_documents: List[Dict[str, Any]], source_documents: List[Any]) -> List[Dict[str, Any]]:
    merged: List[Dict[str, Any]] = []
    positions: Dict[str, int] = {}
    for document in default_documents:
        document_id = validation.coerce_text(document.get("id"))
        if not document_id:
            continue
        positions[document_id] = len(merged)
        merged.append(dict(document))

    for document in source_documents:
        if not isinstance(document, dict):
            continue
        document_id = validation.coerce_text(document.get("id"))
        if not document_id:
            continue
        if document_id in positions:
            merged[positions[document_id]].update(document)
        else:
            positions[document_id] = len(merged)
            merged.append(dict(document))

    return merged


def project_garage(user: Dict[str, Any], purchase: Dict[str, Any]) -> Dict[str, Any]:
    source = merge_purchase_source(purchase)
    source_profile = {
        "fullName": validation.coerce_text(source.get("fullName") or purchases.customer_value(source, "fullName")),
        "birthDate": validation.normalize_birth_date(source.get("birthDate") or purchases.customer_value(source, "birthDate")),
        "cpf": validation.normalize_cpf(source.get("cpf") or purchases.customer_value(source, "cpf")),
    }
    garage = demo.build_garage(user, source_profile)
    now = int(time.time())

    order = source.get("order")
    if isinstance(order, dict):
        garage["order"].update(order)
    vehicle = source.get("vehicle")
    if isinstance(vehicle, dict):
        garage["vehicle"].update(vehicle)
    financing = source.get("financing")
    if isinstance(financing, dict):
        garage["financing"].update(financing)
    documents = source.get("documents")
    if isinstance(documents, list):
        garage["documents"] = _merge_documents(garage["documents"], documents)
    recalls = source.get("recalls")
    if isinstance(recalls, list):
        garage["recalls"] = recalls
    tracking = source.get("tracking")
    if isinstance(tracking, dict):
        garage["tracking"] = tracking

    purchase_id = validation.coerce_text(source.get("purchaseId"))
    if purchase_id:
        garage["purchaseId"] = purchase_id
    match_source = validation.coerce_text(source.get("matchSource"))
    if match_source:
        garage["matchSource"] = match_source
    match_confidence = validation.coerce_text(source.get("matchConfidence"))
    if match_confidence:
        garage["matchConfidence"] = match_confidence
    garage["matchAlgorithmVersion"] = (
        validation.coerce_text(source.get("matchAlgorithmVersion")) or demo.GARAGE_MATCH_ALGORITHM_VERSION
    )

    order_id = validation.coerce_text(
        source.get("orderId")
        or purchase_id
        or (order.get("orderId") if isinstance(order, dict) else "")
        or garage["order"].get("orderId")
    )
    if order_id:
        garage["order"]["orderId"] = order_id

    status = validation.coerce_text(source.get("status"))
    if status:
        garage["order"]["status"] = status
    purchase_date = validation.coerce_text(source.get("purchaseDate"))
    if purchase_date:
        garage["order"]["purchaseDate"] = purchase_date
    dealership = validation.coerce_text(source.get("dealership") or source.get("dealer"))
    if dealership:
        garage["order"]["dealership"] = dealership

    vehicle_id = validation.coerce_text(
        source.get("vehicleId")
        or source.get("chassi")
        or (vehicle.get("vehicleId") if isinstance(vehicle, dict) else "")
        or order_id
        or purchase_id
    )
    if vehicle_id:
        garage["vehicle"]["vehicleId"] = vehicle_id
    chassi = validation.coerce_text(source.get("chassi") or garage["vehicle"].get("chassi") or vehicle_id)
    if chassi:
        garage["vehicle"]["chassi"] = chassi
    if isinstance(tracking, dict):
        garage["tracking"].update(
            {
                "vehicleId": garage["vehicle"].get("vehicleId", ""),
                "chassi": garage["vehicle"].get("chassi", ""),
            }
        )

    created_at = source.get("createdAt")
    if isinstance(created_at, (int, float)):
        garage["createdAt"] = int(created_at)
    elif isinstance(created_at, str) and created_at.isdigit():
        garage["createdAt"] = int(created_at)
    else:
        garage["createdAt"] = now

    garage["userId"] = validation.coerce_text(user.get("sub"))
    garage["updatedAt"] = now
    return garage
