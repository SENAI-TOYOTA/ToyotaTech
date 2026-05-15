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

import { fetchMe, login, register } from "@/services/auth";
import { AuthUser, RegisterResponse } from "@/types/auth";

const TOKEN_STORAGE_KEY = "toyotatech.auth.token";
const isWeb = Platform.OS === "web";

async function getStoredToken() {
  if (isWeb) {
    return globalThis.localStorage?.getItem(TOKEN_STORAGE_KEY) ?? null;
  }
  return SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
}

async function setStoredToken(token: string) {
  if (isWeb) {
    globalThis.localStorage?.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
}

async function deleteStoredToken() {
  if (isWeb) {
    globalThis.localStorage?.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<RegisterResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const clearSession = useCallback(async () => {
    await deleteStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const hydrateSession = useCallback(async () => {
    setIsLoadingSession(true);
    try {
      const storedToken = await getStoredToken();
      if (!storedToken) {
        setToken(null);
        setUser(null);
        return;
      }

      const meResult = await fetchMe(storedToken);
      setToken(storedToken);
      setUser(meResult.user);
    } catch (error) {
      console.error("Falha ao restaurar sessao:", error);
      await clearSession();
    } finally {
      setIsLoadingSession(false);
    }
  }, [clearSession]);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await login({ email, password });
    await setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    return register({ email, password, name });
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoadingSession,
      signIn,
      signUp,
      signOut,
    }),
    [isLoadingSession, signIn, signOut, signUp, token, user]
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
