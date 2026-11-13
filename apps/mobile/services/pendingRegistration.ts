let pendingRegistrationPassword: string | null = null;

export function setPendingRegistrationPassword(password: string): void {
  pendingRegistrationPassword = password;
}

export function consumePendingRegistrationPassword(): string | null {
  const password = pendingRegistrationPassword;
  pendingRegistrationPassword = null;
  return password;
}

export function clearPendingRegistrationPassword(): void {
  pendingRegistrationPassword = null;
}
