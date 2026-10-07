import re
import unicodedata
from datetime import date, datetime, timezone
from typing import Any, Dict, Optional, Tuple

MINIMUM_PROFILE_AGE = 18
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128

PASSWORD_POLICY_MESSAGE = (
    "A senha não atende aos requisitos: mínimo de 8 caracteres, "
    "com letra maiúscula, minúscula e número."
)

PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")

WEAK_PASSWORDS = frozenset(
    {
        "12345678",
        "123456789",
        "1234567890",
        "password",
        "password1",
        "passw0rd",
        "senha123",
        "senha1234",
        "qwerty123",
        "qwerty1234",
        "abc12345",
        "abc123456",
        "iloveyou",
        "admin123",
        "letmein1",
        "welcome1",
        "toyota123",
        "00000000",
        "11111111",
        "monkey123",
        "dragon123",
        "football",
        "baseball",
        "princess",
        "sunshine",
        "trustno1",
        "abc1234567",
    }
)


def coerce_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def normalize_cpf(value: Any) -> str:
    return re.sub(r"\D+", "", coerce_text(value))


def is_valid_cpf(value: Any) -> bool:
    digits = normalize_cpf(value)
    if len(digits) != 11:
        return False
    if digits == digits[0] * 11:
        return False

    first_sum = sum(int(digits[index]) * (10 - index) for index in range(9))
    first_digit = (first_sum * 10) % 11
    first_digit = 0 if first_digit == 10 else first_digit
    if first_digit != int(digits[9]):
        return False

    second_sum = sum(int(digits[index]) * (11 - index) for index in range(10))
    second_digit = (second_sum * 10) % 11
    second_digit = 0 if second_digit == 10 else second_digit
    return second_digit == int(digits[10])


def validate_password_policy(value: Any) -> Optional[str]:
    password = coerce_text(value)
    if len(password) < PASSWORD_MIN_LENGTH or len(password) > PASSWORD_MAX_LENGTH:
        return PASSWORD_POLICY_MESSAGE
    if not PASSWORD_PATTERN.match(password):
        return PASSWORD_POLICY_MESSAGE
    if password.lower() in WEAK_PASSWORDS:
        return PASSWORD_POLICY_MESSAGE
    return None


def normalize_name(value: Any) -> str:
    text = coerce_text(value).lower()
    if not text:
        return ""
    normalized = (
        unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    )
    return re.sub(r"\s+", " ", normalized).strip()


def normalize_birth_date(value: Any) -> str:
    text = coerce_text(value)
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
        coerce_text(profile.get("fullName"))
        and coerce_text(profile.get("birthDate"))
        and len(normalize_cpf(profile.get("cpf"))) == 11
        and not birth_date_error
    )
