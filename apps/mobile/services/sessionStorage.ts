import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { StoredSession } from "./sessionStorage.types";

export type { StoredSession };

const SESSION_STORAGE_KEY = "toyotatech.auth.session";
const isWeb = Platform.OS === "web";

export type SessionPersistence = "persistent" | "memory-only" | "unavailable";

type PersistenceListener = (state: SessionPersistence) => void;

let persistence: SessionPersistence = "persistent";
const persistenceListeners = new Set<PersistenceListener>();

function updatePersistence(next: SessionPersistence): void {
  if (persistence === next) {
    return;
  }
  persistence = next;
  for (const listener of Array.from(persistenceListeners)) {
    listener(persistence);
  }
}

export function getSessionPersistence(): SessionPersistence {
  return persistence;
}

export function subscribeSessionPersistence(
  listener: PersistenceListener
): () => void {
  persistenceListeners.add(listener);
  return () => {
    persistenceListeners.delete(listener);
  };
}

export function resetSessionPersistence(): void {
  persistence = "persistent";
  persistenceListeners.clear();
}

function warnDev(message: string, error?: unknown) {
  if (__DEV__) {
    console.warn(error === undefined ? message : `${message} ${String(error)}`);
  }
}

async function isSecureStoreAvailable(): Promise<boolean> {
  if (isWeb) {
    return true;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch (error) {
    warnDev("[Auth] SecureStore availability check failed.", error);
    return false;
  }
}

function parseSession(rawValue: string | null): StoredSession | null {
  if (!rawValue) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredSession>;
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.idToken !== "string" ||
      typeof parsed.refreshToken !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      warnDev("[Auth] Stored session has an unexpected shape. Ignoring.");
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      idToken: parsed.idToken,
      refreshToken: parsed.refreshToken,
      expiresAt: parsed.expiresAt,
    };
  } catch (error) {
    warnDev("[Auth] Stored session is not valid json. Ignoring.", error);
    return null;
  }
}

export function isSessionExpired(session: StoredSession): boolean {
  return session.expiresAt <= Math.floor(Date.now() / 1000);
}

export async function getStoredSession(): Promise<StoredSession | null> {
  if (isWeb) {
    return parseSession(
      globalThis.localStorage?.getItem(SESSION_STORAGE_KEY) ?? null
    );
  }
  if (!(await isSecureStoreAvailable())) {
    warnDev("[Auth] SecureStore unavailable. Stored session will be ignored.");
    updatePersistence("unavailable");
    return null;
  }
  try {
    const raw = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
    updatePersistence("persistent");
    return parseSession(raw);
  } catch (error) {
    warnDev("[Auth] Failed to read the stored session.", error);
    updatePersistence("memory-only");
    return null;
  }
}

export async function setStoredSession(session: StoredSession) {
  const raw = JSON.stringify(session);
  if (isWeb) {
    globalThis.localStorage?.setItem(SESSION_STORAGE_KEY, raw);
    return;
  }
  if (!(await isSecureStoreAvailable())) {
    warnDev(
      "[Auth] SecureStore unavailable. The session will not survive a restart."
    );
    updatePersistence("unavailable");
    return;
  }
  try {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, raw);
    updatePersistence("persistent");
  } catch (error) {
    warnDev("[Auth] Failed to store the session.", error);
    updatePersistence("memory-only");
  }
}

export async function deleteStoredSession() {
  if (isWeb) {
    globalThis.localStorage?.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  if (!(await isSecureStoreAvailable())) {
    warnDev("[Auth] SecureStore unavailable. Nothing to delete.");
    updatePersistence("unavailable");
    return;
  }
  try {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    updatePersistence("persistent");
  } catch (error) {
    warnDev("[Auth] Failed to delete the stored session.", error);
    updatePersistence("memory-only");
  }
}
