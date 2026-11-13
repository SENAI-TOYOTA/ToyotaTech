import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  clearPendingRegistrationPassword,
  consumePendingRegistrationPassword,
  setPendingRegistrationPassword,
} from "@/services/pendingRegistration";

describe("pending registration password", () => {
  beforeEach(() => {
    clearPendingRegistrationPassword();
  });

  it("starts empty", () => {
    expect(consumePendingRegistrationPassword()).toBeNull();
  });

  it("consumes the stored password only once", () => {
    setPendingRegistrationPassword("Senha123");
    expect(consumePendingRegistrationPassword()).toBe("Senha123");
    expect(consumePendingRegistrationPassword()).toBeNull();
  });

  it("clears the stored password", () => {
    setPendingRegistrationPassword("Senha123");
    clearPendingRegistrationPassword();
    expect(consumePendingRegistrationPassword()).toBeNull();
  });

  it("overwrites the previous password", () => {
    setPendingRegistrationPassword("Senha123");
    setPendingRegistrationPassword("Senha456");
    expect(consumePendingRegistrationPassword()).toBe("Senha456");
  });
});
