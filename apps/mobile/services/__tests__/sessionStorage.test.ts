import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import * as SecureStore from "expo-secure-store";

import {
  deleteStoredSession,
  getStoredSession,
  isSessionExpired,
  setStoredSession,
  StoredSession,
} from "../sessionStorage";

jest.mock("expo-secure-store", () => ({
  isAvailableAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

const mockIsAvailable = SecureStore.isAvailableAsync as jest.Mock<
  () => Promise<boolean>
>;
const mockGetItem = SecureStore.getItemAsync as jest.Mock<
  (key: string) => Promise<string | null>
>;
const mockSetItem = SecureStore.setItemAsync as jest.Mock<
  (key: string, value: string) => Promise<void>
>;
const mockDeleteItem = SecureStore.deleteItemAsync as jest.Mock<
  (key: string) => Promise<void>
>;

const VALID_SESSION: StoredSession = {
  accessToken: "access-token",
  idToken: "id-token",
  refreshToken: "refresh-token",
  expiresAt: 1_800_000_000,
};

function rawSession(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({ ...VALID_SESSION, ...overrides });
}

describe("isSessionExpired", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("treats a session past its expiry as expired", () => {
    expect(
      isSessionExpired({ ...VALID_SESSION, expiresAt: 1_699_999_999 })
    ).toBe(true);
  });

  it("treats a session expiring exactly now as expired", () => {
    expect(
      isSessionExpired({ ...VALID_SESSION, expiresAt: 1_700_000_000 })
    ).toBe(true);
  });

  it("treats a session with time left as valid", () => {
    expect(
      isSessionExpired({ ...VALID_SESSION, expiresAt: 1_700_000_001 })
    ).toBe(false);
  });
});

describe("session storage", () => {
  beforeEach(() => {
    mockIsAvailable.mockResolvedValue(true as never);
    mockGetItem.mockResolvedValue(null as never);
    mockSetItem.mockResolvedValue(undefined as never);
    mockDeleteItem.mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("round trips a session", async () => {
    mockGetItem.mockResolvedValue(rawSession() as never);
    await expect(getStoredSession()).resolves.toEqual(VALID_SESSION);
  });

  it("returns null when nothing is stored", async () => {
    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("returns null for malformed json", async () => {
    mockGetItem.mockResolvedValue("{not json" as never);
    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("returns null when a field is missing", async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({ accessToken: "only" }) as never
    );
    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("returns null when a field has the wrong type", async () => {
    mockGetItem.mockResolvedValue(rawSession({ expiresAt: "soon" }) as never);
    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("reads the session when secure store is available", async () => {
    mockGetItem.mockResolvedValue(rawSession() as never);
    await getStoredSession();
    expect(mockGetItem).toHaveBeenCalledWith("toyotatech.auth.session");
  });

  it("returns null when secure store is unavailable", async () => {
    mockIsAvailable.mockResolvedValue(false as never);
    await expect(getStoredSession()).resolves.toBeNull();
    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it("returns null when the availability check throws", async () => {
    mockIsAvailable.mockRejectedValue(new Error("no keystore") as never);
    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("returns null when reading throws", async () => {
    mockGetItem.mockRejectedValue(new Error("read failed") as never);
    await expect(getStoredSession()).resolves.toBeNull();
  });

  it("does not crash when writing throws", async () => {
    mockSetItem.mockRejectedValue(new Error("write failed") as never);
    await expect(setStoredSession(VALID_SESSION)).resolves.toBeUndefined();
  });

  it("skips the write when secure store is unavailable", async () => {
    mockIsAvailable.mockResolvedValue(false as never);
    await setStoredSession(VALID_SESSION);
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it("does not crash when deleting throws", async () => {
    mockDeleteItem.mockRejectedValue(new Error("delete failed") as never);
    await expect(deleteStoredSession()).resolves.toBeUndefined();
  });

  it("skips the delete when secure store is unavailable", async () => {
    mockIsAvailable.mockResolvedValue(false as never);
    await deleteStoredSession();
    expect(mockDeleteItem).not.toHaveBeenCalled();
  });
});
