import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  api,
  clearAuthTokenCookie,
  resolveAuthToken,
  setAuthTokenCookie,
  USER_STORAGE_KEY,
} from "@/store/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
} from "@/types/auth";

export { USER_STORAGE_KEY };

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
  setAuthTokenCookie(token);

  if (typeof window === "undefined" || !user) {
    return;
  }

  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Ignora erros de armazenamento
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
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
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
      clearAuthTokenCookie();
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
