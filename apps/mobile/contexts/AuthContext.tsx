import * as SecureStore from "expo-secure-store";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { hasCompleteProfile } from "@/profileValidation";
import { ApiError } from "@/services/api";
import {
  fetchMe,
  login,
  refreshSession,
  register,
  setPassword as setPasswordService,
} from "@/services/auth";
import { fetchGarageCurrent } from "@/services/garage";
import { AuthUser, RegisterResponse } from "@/types/auth";

const SESSION_STORAGE_KEY = "toyotatech.auth.session";
const isWeb = Platform.OS === "web";

interface StoredSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

async function getStoredSession(): Promise<StoredSession | null> {
  const parseSession = (rawValue: string | null): StoredSession | null => {
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
        return null;
      }
      return {
        accessToken: parsed.accessToken,
        idToken: parsed.idToken,
        refreshToken: parsed.refreshToken,
        expiresAt: parsed.expiresAt,
      };
    } catch {
      return null;
    }
  };

  if (isWeb) {
    return parseSession(
      globalThis.localStorage?.getItem(SESSION_STORAGE_KEY) ?? null
    );
  }
  const raw = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  return parseSession(raw);
}

async function setStoredSession(session: StoredSession) {
  const raw = JSON.stringify(session);
  if (isWeb) {
    globalThis.localStorage?.setItem(SESSION_STORAGE_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, raw);
}

async function deleteStoredSession() {
  if (isWeb) {
    globalThis.localStorage?.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}

function isTokenFederated(idToken: string): boolean {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return false;
    const payload = parts[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded)) as Record<string, unknown>;

    if (Array.isArray(decoded.identities) && decoded.identities.length > 0) {
      return true;
    }
    const username = decoded["cognito:username"];
    if (
      typeof username === "string" &&
      username.toLowerCase().startsWith("google_")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isFederatedUser: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<RegisterResponse>;
  signInWithTokens: (session: StoredSession) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const bootstrapGarage = useCallback(
    async (accessToken: string, nextUser: AuthUser | null) => {
      if (!hasCompleteProfile(nextUser)) {
        return;
      }
      try {
        await fetchGarageCurrent(accessToken);
      } catch (error) {
        if (__DEV__) {
          console.warn("[GARAGE] Failed to initialize garage", error);
        }
      }
    },
    []
  );

  const clearSession = useCallback(async () => {
    await deleteStoredSession();
    setSession(null);
    setUser(null);
  }, []);

  const hydrateSession = useCallback(async () => {
    setIsLoadingSession(true);
    try {
      const storedSession = await getStoredSession();
      if (!storedSession) {
        setSession(null);
        setUser(null);
        return;
      }

      const meResult = await fetchMe(storedSession.accessToken, {
        suppressErrorLog: true,
      });
      setSession(storedSession);
      setUser(meResult.user);
      await bootstrapGarage(storedSession.accessToken, meResult.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          const storedSession = await getStoredSession();
          if (!storedSession) {
            await clearSession();
            return;
          }

          const refreshed = await refreshSession(
            { refreshToken: storedSession.refreshToken },
            { suppressErrorLog: true }
          );
          const refreshedSession: StoredSession = {
            accessToken: refreshed.accessToken,
            idToken: refreshed.idToken,
            refreshToken: storedSession.refreshToken,
            expiresAt: refreshed.expiresAt,
          };
          const meResult = await fetchMe(refreshedSession.accessToken, {
            suppressErrorLog: true,
          });
          await setStoredSession(refreshedSession);
          setSession(refreshedSession);
          setUser(meResult.user);
          await bootstrapGarage(refreshedSession.accessToken, meResult.user);
        } catch {
          if (__DEV__) {
            console.warn(
              "[Auth] Stored session expired. Clearing local login."
            );
          }
          await clearSession();
        }
      } else {
        console.error("Failed to restore session:", error);
        await clearSession();
      }
    } finally {
      setIsLoadingSession(false);
    }
  }, [bootstrapGarage, clearSession]);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const applySession = useCallback(
    async (nextSession: StoredSession) => {
      await setStoredSession(nextSession);
      setSession(nextSession);
      try {
        const meResult = await fetchMe(nextSession.accessToken);
        setUser(meResult.user);
        await bootstrapGarage(nextSession.accessToken, meResult.user);
      } catch (error) {
        await clearSession();
        throw error;
      }
    },
    [bootstrapGarage, clearSession]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await login({ email, password });
      const nextSession: StoredSession = {
        accessToken: result.accessToken,
        idToken: result.idToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      };
      await applySession(nextSession);
    },
    [applySession]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      return register({ email, password, name });
    },
    []
  );

  const signInWithTokens = useCallback(
    async (nextSession: StoredSession) => {
      await applySession(nextSession);
    },
    [applySession]
  );

  const setPassword = useCallback(
    async (password: string) => {
      if (!session?.accessToken) {
        throw new Error("Invalid session. Sign in again.");
      }
      await setPasswordService(session.accessToken, { password });
    },
    [session?.accessToken]
  );

  const refreshUser = useCallback(async () => {
    if (!session?.accessToken) {
      setUser(null);
      return;
    }
    try {
      const meResult = await fetchMe(session.accessToken);
      setUser(meResult.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearSession();
      }
      throw error;
    }
  }, [clearSession, session?.accessToken]);

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const isFederatedUser = useMemo(() => {
    if (!session?.idToken) return false;
    return isTokenFederated(session.idToken);
  }, [session?.idToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: session?.accessToken ?? null,
      isAuthenticated: Boolean(session && user),
      isLoadingSession,
      isFederatedUser,
      signIn,
      signUp,
      signInWithTokens,
      setPassword,
      refreshUser,
      signOut,
    }),
    [
      isFederatedUser,
      isLoadingSession,
      refreshUser,
      session,
      setPassword,
      signIn,
      signInWithTokens,
      signOut,
      signUp,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
