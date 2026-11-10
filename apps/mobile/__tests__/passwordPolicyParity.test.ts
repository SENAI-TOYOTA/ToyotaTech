import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "@jest/globals";

import { validatePassword } from "../profileValidation";

const BACKEND_VALIDATION = join(
  __dirname,
  "..",
  "..",
  "server",
  "layers",
  "common",
  "python",
  "common",
  "validation.py"
);

function backendWeakPasswords(): string[] {
  const source = readFileSync(BACKEND_VALIDATION, "utf8");
  const block = source.match(/WEAK_PASSWORDS = frozenset\(\s*\{([\s\S]*?)\}/);
  if (!block) {
    throw new Error("WEAK_PASSWORDS not found in backend validation.py");
  }
  return Array.from(block[1].matchAll(/"([^"]+)"/g)).map((match) => match[1]);
}

describe("weak password parity", () => {
  const backend = backendWeakPasswords();

  it("finds the backend blocklist", () => {
    expect(backend.length).toBeGreaterThan(0);
  });

  it("blocks every backend entry that meets complexity", () => {
    for (const password of backend) {
      const shaped = password.replace(/^./, (char) => char.toUpperCase());
      if (!/[A-Z]/.test(shaped) || !/[0-9]/.test(shaped)) {
        continue;
      }
      expect(validatePassword(shaped)).not.toBeNull();
    }
  });

  it("keeps the same verdict as the backend for common weak passwords", () => {
    for (const password of ["Toyota123", "Senha1234", "Mudar@123"]) {
      expect(validatePassword(password)).not.toBeNull();
      expect(backend.map((entry) => entry.toLowerCase())).toContain(
        password.toLowerCase()
      );
    }
  });
});
