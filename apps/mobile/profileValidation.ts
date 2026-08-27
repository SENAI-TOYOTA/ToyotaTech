export const MINIMUM_PROFILE_AGE = 18;
export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter ao menos uma letra maiúscula.";
  }
  if (!/[a-z]/.test(password)) {
    return "A senha deve conter ao menos uma letra minúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve conter ao menos um número.";
  }
  return null;
}

export function hasCompleteProfile(
  user: {
    profile?: {
      fullName?: string | null;
      birthDate?: string | null;
      cpf?: string | null;
    } | null;
  } | null
) {
  return Boolean(
    user?.profile?.fullName && user.profile.birthDate && user.profile.cpf
  );
}

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
