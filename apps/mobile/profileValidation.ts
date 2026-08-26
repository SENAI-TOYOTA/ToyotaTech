export const MINIMUM_PROFILE_AGE = 18;

export function validateBirthDate(value: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return "Informe uma data de nascimento valida.";
  }

  const [dayText, monthText, yearText] = value.split("/");
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getDate() !== day ||
    parsed.getMonth() !== month - 1 ||
    parsed.getFullYear() !== year ||
    year < 1900
  ) {
    return "Informe uma data de nascimento valida.";
  }

  const today = new Date();
  if (parsed > today) {
    return "Informe uma data de nascimento valida.";
  }

  let age = today.getFullYear() - year;
  const birthdayAlreadyHappened =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);
  if (!birthdayAlreadyHappened) {
    age -= 1;
  }

  if (age < MINIMUM_PROFILE_AGE) {
    return `Voce precisa ter pelo menos ${MINIMUM_PROFILE_AGE} anos.`;
  }

  return null;
}
