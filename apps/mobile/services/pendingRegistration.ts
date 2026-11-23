interface PendingRegistration {
  email: string;
  password: string;
}

let pendingRegistration: PendingRegistration | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function setPendingRegistrationPassword(
  email: string,
  password: string
): void {
  pendingRegistration = { email: normalizeEmail(email), password };
}

export function consumePendingRegistrationPassword(
  email: string
): string | null {
  const pending = pendingRegistration;
  pendingRegistration = null;
  if (!pending || pending.email !== normalizeEmail(email)) {
    return null;
  }
  return pending.password;
}

export function clearPendingRegistrationPassword(): void {
  pendingRegistration = null;
}
