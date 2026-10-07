export const MINIMUM_PROFILE_AGE = 18;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const WEAK_PASSWORDS = new Set([
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
  "admin@2024",
  "abc@1234",
  "mudar@123",
  "teste@123",
]);

export function validatePassword(password: string): string | null {
  if (password !== password.trim()) {
    return "A senha não pode começar ou terminar com espaço.";
  }
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve ter pelo menos uma letra maiúscula.";
  }
  if (!/[a-z]/.test(password)) {
    return "A senha deve ter pelo menos uma letra minúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve ter pelo menos um número.";
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return "Escolha uma senha menos comum.";
  }
  return null;
}

export function validateCpf(value: string): string | null {
  const digits = value.replace(/\D+/g, "");
  if (digits.length !== 11) {
    return "Informe um CPF válido.";
  }
  if (/^(\d)\1{10}$/.test(digits)) {
    return "Informe um CPF válido.";
  }

  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) {
    firstDigit = 0;
  }
  if (firstDigit !== Number(digits[9])) {
    return "Informe um CPF válido.";
  }

  sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index);
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) {
    secondDigit = 0;
  }
  if (secondDigit !== Number(digits[10])) {
    return "Informe um CPF válido.";
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
    return "Informe uma data de nascimento válida.";
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
    return "Informe uma data de nascimento válida.";
  }

  const today = new Date();
  if (parsed > today) {
    return "Informe uma data de nascimento válida.";
  }

  let age = today.getFullYear() - year;
  const birthdayAlreadyHappened =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);
  if (!birthdayAlreadyHappened) {
    age -= 1;
  }

  if (age < MINIMUM_PROFILE_AGE) {
    return `Você precisa ter pelo menos ${MINIMUM_PROFILE_AGE} anos.`;
  }

  return null;
}
