export const MINIMUM_PROFILE_AGE = 18;
export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must have at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
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
    return "Enter a valid birth date.";
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
    return "Enter a valid birth date.";
  }

  const today = new Date();
  if (parsed > today) {
    return "Enter a valid birth date.";
  }

  let age = today.getFullYear() - year;
  const birthdayAlreadyHappened =
    today.getMonth() > month - 1 ||
    (today.getMonth() === month - 1 && today.getDate() >= day);
  if (!birthdayAlreadyHappened) {
    age -= 1;
  }

  if (age < MINIMUM_PROFILE_AGE) {
    return `You must be at least ${MINIMUM_PROFILE_AGE} years old.`;
  }

  return null;
}
