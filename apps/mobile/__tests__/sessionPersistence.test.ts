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
  getSessionPersistence,
  getStoredSession,
  resetSessionPersistence,
  setStoredSession,
  StoredSession,
  subscribeSessionPersistence,
} from "@/services/sessionStorage";

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

describe("session persistence state", () => {
  beforeEach(() => {
    mockIsAvailable.mockResolvedValue(true as never);
    mockGetItem.mockResolvedValue(null as never);
    mockSetItem.mockResolvedValue(undefined as never);
    mockDeleteItem.mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetSessionPersistence();
  });

  it("starts as persistent", () => {
    expect(getSessionPersistence()).toBe("persistent");
  });

  it("stays persistent when the session is written", async () => {
    await setStoredSession(VALID_SESSION);
    expect(getSessionPersistence()).toBe("persistent");
  });

  it("reports unavailable when secure store is unavailable on write", async () => {
    mockIsAvailable.mockResolvedValue(false as never);
    await setStoredSession(VALID_SESSION);
    expect(getSessionPersistence()).toBe("unavailable");
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it("reports unavailable when the availability check throws", async () => {
    mockIsAvailable.mockRejectedValue(new Error("no keystore") as never);
    await setStoredSession(VALID_SESSION);
    expect(getSessionPersistence()).toBe("unavailable");
  });

  it("reports memory-only when the write throws", async () => {
    mockSetItem.mockRejectedValue(new Error("write failed") as never);
    await setStoredSession(VALID_SESSION);
    expect(getSessionPersistence()).toBe("memory-only");
  });

  it("reports unavailable when secure store is unavailable on read", async () => {
    mockIsAvailable.mockResolvedValue(false as never);
    await getStoredSession();
    expect(getSessionPersistence()).toBe("unavailable");
  });

  it("reports memory-only when the read throws", async () => {
    mockGetItem.mockRejectedValue(new Error("read failed") as never);
    await expect(getStoredSession()).resolves.toBeNull();
    expect(getSessionPersistence()).toBe("memory-only");
  });

  it("reports unavailable when secure store is unavailable on delete", async () => {
    mockIsAvailable.mockResolvedValue(false as never);
    await deleteStoredSession();
    expect(getSessionPersistence()).toBe("unavailable");
    expect(mockDeleteItem).not.toHaveBeenCalled();
  });

  it("reports memory-only when the delete throws", async () => {
    mockDeleteItem.mockRejectedValue(new Error("delete failed") as never);
    await deleteStoredSession();
    expect(getSessionPersistence()).toBe("memory-only");
  });

  it("returns to persistent once a write succeeds again", async () => {
    mockSetItem.mockRejectedValueOnce(new Error("write failed") as never);
    await setStoredSession(VALID_SESSION);
    expect(getSessionPersistence()).toBe("memory-only");
    await setStoredSession(VALID_SESSION);
    expect(getSessionPersistence()).toBe("persistent");
  });

  it("notifies listeners only when the state changes", async () => {
    const listener = jest.fn();
    subscribeSessionPersistence(listener);
    mockSetItem.mockRejectedValue(new Error("write failed") as never);
    await setStoredSession(VALID_SESSION);
    await setStoredSession(VALID_SESSION);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("memory-only");
  });

  it("stops notifying after unsubscribe", async () => {
    const listener = jest.fn();
    const unsubscribe = subscribeSessionPersistence(listener);
    unsubscribe();
    mockSetItem.mockRejectedValue(new Error("write failed") as never);
    await setStoredSession(VALID_SESSION);
    expect(listener).not.toHaveBeenCalled();
  });
});
