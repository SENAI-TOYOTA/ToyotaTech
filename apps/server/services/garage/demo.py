import calendar
import hashlib
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from . import validation

GARAGE_MATCH_ALGORITHM_VERSION = "cpf_v2"

DEMO_VEHICLE_CATALOG = [
    {"model": "Toyota Corolla Altis", "version": "Hybrid 2025", "color": "Branco Perola", "year": "2025", "engine": "1.8 Hybrid"},
    {"model": "Toyota Corolla Cross XRX", "version": "Hybrid 2025", "color": "Prata Lua Nova", "year": "2025", "engine": "1.8 Hybrid"},
    {"model": "Toyota Hilux SRX", "version": "Cabine Dupla 2025", "color": "Cinza Granito", "year": "2025", "engine": "2.8 Diesel"},
]


def build_seed(user: Dict[str, Any], profile: Optional[Dict[str, str]] = None) -> str:
    if profile:
        cpf = validation.normalize_cpf(profile.get("cpf"))
        if cpf:
            return cpf
    return validation.coerce_text(user.get("email")) or validation.coerce_text(user.get("sub")) or "toyotatech"


def select_vehicle(seed: str) -> Dict[str, str]:
    digest = hashlib.sha1((validation.coerce_text(seed) or "toyotatech").encode("utf-8")).hexdigest()
    return dict(DEMO_VEHICLE_CATALOG[int(digest[8:12], 16) % len(DEMO_VEHICLE_CATALOG)])


def format_brl_cents(value_cents: int) -> str:
    value = max(value_cents, 0) / 100
    formatted = f"{value:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
    return f"R$ {formatted}"


def format_next_due_date(seed: str) -> str:
    digest = hashlib.sha1((validation.coerce_text(seed) or "toyotatech").encode("utf-8")).hexdigest()
    due_day = int(digest[12:16], 16) % 23 + 5
    today = datetime.now(timezone.utc).date()
    year, month = today.year, today.month
    if due_day <= today.day:
        month += 1
        if month > 12:
            month, year = 1, year + 1
    due_day = min(due_day, calendar.monthrange(year, month)[1])
    return f"{due_day:02d}/{month:02d}/{year:04d}"


def build_financing(seed: str) -> Dict[str, Any]:
    digest = hashlib.sha1((validation.coerce_text(seed) or "toyotatech").encode("utf-8")).hexdigest()
    installment_options = [36, 48, 60, 72]
    total_installments = installment_options[int(digest[:2], 16) % len(installment_options)]
    paid_installments = int(digest[2:4], 16) % max(total_installments // 2, 1)
    amount_cents = (2200 + int(digest[4:8], 16) % 3100) * 100
    return {
        "bank": "Banco Toyota do Brasil S.A",
        "contractNumber": f"FIN-{digest[:10].upper()}",
        "paidInstallments": paid_installments,
        "totalInstallments": total_installments,
        "installmentAmount": format_brl_cents(amount_cents),
        "nextDueDate": format_next_due_date(seed),
        "boletoAvailable": True,
        "status": "active",
    }


def build_documents(seed: str, purchase_date: str, vehicle: Dict[str, str]) -> list:
    digest = hashlib.sha1((validation.coerce_text(seed) or "toyotatech").encode("utf-8")).hexdigest()
    vehicle_model = validation.coerce_text(vehicle.get("model")) or "Toyota"
    return [
        {"id": "invoice", "title": "Nota fiscal", "date": purchase_date, "status": "available"},
        {"id": "crlv", "title": "CRLV-e", "date": purchase_date, "status": "available" if int(digest[16:18], 16) % 3 else "pending"},
        {"id": "warranty", "title": "Garantia Toyota", "date": purchase_date, "status": "available"},
        {"id": "manual", "title": f"Manual do {vehicle_model}", "date": purchase_date, "status": "available"},
        {"id": "maintenance-plan", "title": "Plano de revisoes", "date": purchase_date, "status": "available"},
    ]


def build_chassi(seed: str) -> str:
    digest = hashlib.sha1((validation.coerce_text(seed) or "toyotatech").encode("utf-8")).hexdigest()
    slot = int(digest[:8], 16) % 90000 + 10000
    return f"CHASSI_{slot:05d}"


def build_garage(user: Dict[str, Any], profile: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    seed = build_seed(user, profile)
    chassi = build_chassi(seed)
    now = int(time.time())
    vehicle = {"vehicleId": chassi, **select_vehicle(seed), "chassi": chassi}
    tracking_steps = [
        {"id": "1", "label": "Inicio da producao", "status": "completed", "date": "10/05/2026"},
        {"id": "2", "label": "Pintura", "status": "completed", "date": "12/05/2026"},
        {"id": "3", "label": "Processo de montagem", "status": "completed", "date": "15/05/2026"},
        {"id": "4", "label": "Aguardando o embarque", "status": "current"},
        {"id": "5", "label": "Em transito", "status": "pending"},
        {"id": "6", "label": "Saiu para entrega", "status": "pending"},
    ]
    return {
        "userId": str(user.get("sub", "")),
        "order": {
            "orderId": f"TT-{chassi[-5:]}",
            "status": "linked",
            "purchaseDate": "03/10/2025",
            "dealership": "Concessionaria Toyota",
        },
        "vehicle": vehicle,
        "financing": build_financing(seed),
        "documents": build_documents(seed, "03/10/2025", vehicle),
        "recalls": [],
        "tracking": {**vehicle, "currentStepIndex": 3, "steps": tracking_steps},
        "matchAlgorithmVersion": GARAGE_MATCH_ALGORITHM_VERSION,
        "createdAt": now,
        "updatedAt": now,
    }


def build_purchase(user: Dict[str, Any], profile: Dict[str, str]) -> Dict[str, Any]:
    garage = build_garage(user, profile)
    chassi = garage["vehicle"]["chassi"]
    now = int(time.time())
    return {
        "purchaseId": f"demo-{chassi[-5:]}",
        "orderId": garage["order"]["orderId"],
        "email": validation.coerce_text(user.get("email")).lower(),
        "fullName": validation.coerce_text(profile.get("fullName")),
        "normalizedName": validation.normalize_name(profile.get("fullName")),
        "birthDate": validation.normalize_birth_date(profile.get("birthDate")),
        "cpf": validation.normalize_cpf(profile.get("cpf")),
        "userId": validation.coerce_text(user.get("sub")),
        "status": garage["order"]["status"],
        "purchaseDate": garage["order"]["purchaseDate"],
        "dealership": garage["order"]["dealership"],
        "vehicleId": chassi,
        "chassi": chassi,
        "order": garage["order"],
        "vehicle": garage["vehicle"],
        "financing": garage["financing"],
        "documents": garage["documents"],
        "recalls": garage["recalls"],
        "tracking": garage["tracking"],
        "garage": garage,
        "matchSource": "generated_demo",
        "matchConfidence": "generated",
        "matchAlgorithmVersion": GARAGE_MATCH_ALGORITHM_VERSION,
        "createdAt": now,
        "updatedAt": now,
        "linkedAt": now,
    }
