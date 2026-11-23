import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  clearPendingRegistrationPassword,
  consumePendingRegistrationPassword,
  setPendingRegistrationPassword,
} from "@/services/pendingRegistration";

const EMAIL = "user@example.com";
const OTHER_EMAIL = "other@example.com";

describe("pending registration password", () => {
  beforeEach(() => {
    clearPendingRegistrationPassword();
  });

  it("starts empty", () => {
    expect(consumePendingRegistrationPassword(EMAIL)).toBeNull();
  });

  it("consumes the stored password only once for the same email", () => {
    setPendingRegistrationPassword(EMAIL, "Senha123");
    expect(consumePendingRegistrationPassword(EMAIL)).toBe("Senha123");
    expect(consumePendingRegistrationPassword(EMAIL)).toBeNull();
  });

  it("normalizes the email before matching", () => {
    setPendingRegistrationPassword("  USER@Example.com ", "Senha123");
    expect(consumePendingRegistrationPassword(EMAIL)).toBe("Senha123");
  });

  it("does not return the password for another email and clears it", () => {
    setPendingRegistrationPassword(EMAIL, "Senha123");
    expect(consumePendingRegistrationPassword(OTHER_EMAIL)).toBeNull();
    expect(consumePendingRegistrationPassword(EMAIL)).toBeNull();
  });

  it("clears the stored password", () => {
    setPendingRegistrationPassword(EMAIL, "Senha123");
    clearPendingRegistrationPassword();
    expect(consumePendingRegistrationPassword(EMAIL)).toBeNull();
  });

  it("overwrites the previous registration", () => {
    setPendingRegistrationPassword(EMAIL, "Senha123");
    setPendingRegistrationPassword(OTHER_EMAIL, "Senha456");
    expect(consumePendingRegistrationPassword(OTHER_EMAIL)).toBe("Senha456");
  });
});
