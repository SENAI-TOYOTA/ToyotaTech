import { describe, expect, it } from "@jest/globals";

import { validateCpf, validatePassword } from "../profileValidation";

describe("validatePassword", () => {
  it("accepts a password meeting length and complexity", () => {
    expect(validatePassword("P@ssw0rd2026")).toBeNull();
  });

  it("accepts a password with trailing whitespace", () => {
    expect(validatePassword("Abc1234 ")).toBeNull();
  });

  it("rejects passwords shorter than the minimum", () => {
    expect(validatePassword("Abc123")).not.toBeNull();
  });

  it("rejects passwords longer than the maximum", () => {
    expect(validatePassword(`Aa1${"x".repeat(126)}`)).not.toBeNull();
  });

  it("rejects a password without an uppercase letter", () => {
    expect(validatePassword("abc12345")).not.toBeNull();
  });

  it("rejects a password without a lowercase letter", () => {
    expect(validatePassword("ABC12345")).not.toBeNull();
  });

  it("rejects a password without a number", () => {
    expect(validatePassword("Abcdefgh")).not.toBeNull();
  });

  it("rejects common weak passwords that meet complexity", () => {
    expect(validatePassword("Toyota123")).not.toBeNull();
    expect(validatePassword("Admin@2024")).not.toBeNull();
    expect(validatePassword("Senha1234")).not.toBeNull();
  });

  it("rejects a blocklisted password regardless of case", () => {
    expect(validatePassword("PASSWORD1")).not.toBeNull();
  });
});

describe("validateCpf", () => {
  it("accepts a valid cpf", () => {
    expect(validateCpf("529.982.247-25")).toBeNull();
  });

  it("accepts a valid cpf without punctuation", () => {
    expect(validateCpf("52998224725")).toBeNull();
  });

  it("rejects a cpf with a wrong check digit", () => {
    expect(validateCpf("12345678901")).not.toBeNull();
  });

  it("rejects a sequential cpf", () => {
    expect(validateCpf("11111111111")).not.toBeNull();
  });

  it("rejects a cpf with the wrong length", () => {
    expect(validateCpf("5299822472")).not.toBeNull();
  });

  it("rejects an empty cpf", () => {
    expect(validateCpf("")).not.toBeNull();
  });
});
