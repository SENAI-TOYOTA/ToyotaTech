import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  api,
  LEGACY_SESSION_STORAGE_KEY,
  resolveAuthToken,
  TOKEN_COOKIE_KEY,
  TOKEN_STORAGE_KEY,
} from "@/store/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth";

export const USER_STORAGE_KEY = "toyotatech.user";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

function persistAuthSession(token: string, user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignora erros de armazenamento
  }

  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 8; // 8h
    document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

function clearAuthSessionStorage() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_STORAGE_KEY);
  } catch {
    // Ignora erros de armazenamento
  }

  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "Garage", "ProductionTracking"],
    }),
    register: builder.mutation<RegisterResponse, RegisterPayload>({
      query: (payload) => ({
        url: "/api/auth/register",
        method: "POST",
        body: payload,
      }),
    }),
    getMe: builder.query<{ user: AuthUser }, void>({
      query: () => ({
        url: "/api/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser | null; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = Boolean(action.payload.token);
      persistAuthSession(action.payload.token, action.payload.user);
    },
    hydrateAuth: (state) => {
      const token = resolveAuthToken();
      if (!token) {
        return;
      }

      let storedUser: AuthUser | null = null;
      if (typeof window !== "undefined") {
        try {
          const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
          if (rawUser) {
            storedUser = JSON.parse(rawUser) as AuthUser;
          }
        } catch {
          storedUser = null;
        }
      }

      state.token = token;
      state.user = storedUser ?? state.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthSessionStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        const resolvedToken = payload.token ?? payload.accessToken;
        state.token = resolvedToken;
        state.user = payload.user;
        state.isAuthenticated = Boolean(resolvedToken);
        if (resolvedToken) {
          persistAuthSession(resolvedToken, payload.user);
        }
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.isAuthenticated = true;
      });
  },
});

export const { setCredentials, hydrateAuth, logout } = authSlice.actions;

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;

export default authSlice.reducer;

