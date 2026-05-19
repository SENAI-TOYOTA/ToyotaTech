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
import * as SecureStore from "expo-secure-store";

import { ApiError } from "@/services/api";
import { fetchMe, login, refreshSession, register } from "@/services/auth";
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
    return parseSession(globalThis.localStorage?.getItem(SESSION_STORAGE_KEY) ?? null);
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

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<RegisterResponse>;
  signInWithTokens: (session: StoredSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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

      const meResult = await fetchMe(storedSession.accessToken);
      setSession(storedSession);
      setUser(meResult.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          const storedSession = await getStoredSession();
          if (!storedSession) {
            await clearSession();
            return;
          }

          const refreshed = await refreshSession({ refreshToken: storedSession.refreshToken });
          const refreshedSession: StoredSession = {
            accessToken: refreshed.accessToken,
            idToken: refreshed.idToken,
            refreshToken: storedSession.refreshToken,
            expiresAt: refreshed.expiresAt,
          };
          const meResult = await fetchMe(refreshedSession.accessToken);
          await setStoredSession(refreshedSession);
          setSession(refreshedSession);
          setUser(meResult.user);
        } catch (refreshError) {
          console.error("Falha ao renovar sessao:", refreshError);
          await clearSession();
        }
      } else {
        console.error("Falha ao restaurar sessao:", error);
        await clearSession();
      }
    } finally {
      setIsLoadingSession(false);
    }
  }, [clearSession]);

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
      } catch (error) {
        await clearSession();
        throw error;
      }
    },
    [clearSession]
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

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    return register({ email, password, name });
  }, []);

  const signInWithTokens = useCallback(
    async (nextSession: StoredSession) => {
      await applySession(nextSession);
    },
    [applySession]
  );

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: session?.accessToken ?? null,
      isAuthenticated: Boolean(session && user),
      isLoadingSession,
      signIn,
      signUp,
      signInWithTokens,
      signOut,
    }),
    [isLoadingSession, session, signIn, signInWithTokens, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
