import re
from datetime import date, datetime, timezone
from typing import Any, Dict, Optional, Tuple

MINIMUM_PROFILE_AGE = 18


def normalize_cpf(value: Any) -> str:
    text = str(value or "").strip()
    return re.sub(r"\D+", "", text)[:11]


def normalize_birth_date(value: Any) -> str:
    text = str(value or "").strip()
    digits = re.sub(r"\D+", "", text)
    if len(digits) == 8:
        return f"{digits[:2]}/{digits[2:4]}/{digits[4:]}"
    return text


def parse_birth_date(value: Any) -> Optional[date]:
    text = normalize_birth_date(value)
    if not re.fullmatch(r"\d{2}/\d{2}/\d{4}", text):
        return None
    try:
        parsed = datetime.strptime(text, "%d/%m/%Y").date()
    except ValueError:
        return None
    if parsed.strftime("%d/%m/%Y") != text:
        return None
    return parsed


def calculate_age(birth_date: date, today: date) -> int:
    age = today.year - birth_date.year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    return age


def validate_birth_date(value: Any) -> Tuple[Optional[str], Optional[str]]:
    normalized = normalize_birth_date(value)
    parsed = parse_birth_date(normalized)
    if not parsed or parsed.year < 1900:
        return None, "Informe uma data de nascimento válida."

    today = datetime.now(timezone.utc).date()
    if parsed > today:
        return None, "Informe uma data de nascimento válida."
    if calculate_age(parsed, today) < MINIMUM_PROFILE_AGE:
        return None, "Você precisa ter pelo menos 18 anos."

    return normalized, None


def is_complete(profile: Dict[str, str]) -> bool:
    _, birth_date_error = validate_birth_date(profile.get("birthDate"))
    return bool(
        str(profile.get("fullName") or "").strip()
        and str(profile.get("birthDate") or "").strip()
        and len(normalize_cpf(profile.get("cpf"))) == 11
        and not birth_date_error
    )
