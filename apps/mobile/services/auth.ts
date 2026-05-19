import { apiRequest } from "@/services/api";
import {
  AuthUser,
  CheckEmailResponse,
  LoginPayload,
  LoginResponse,
  RefreshSessionPayload,
  RefreshSessionResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
} from "@/types/auth";

export async function checkEmail(email: string) {
  return apiRequest<CheckEmailResponse>("/auth/check-email", {
    method: "POST",
    body: { email },
  });
}

export async function register(payload: RegisterPayload) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function fetchMe(token: string) {
  return apiRequest<{ user: AuthUser }>("/me", {
    method: "GET",
    token,
  });
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  return apiRequest<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

export async function resendVerification(email: string) {
  return apiRequest<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
}

export async function refreshSession(payload: RefreshSessionPayload) {
  return apiRequest<RefreshSessionResponse>("/auth/refresh", {
    method: "POST",
    body: payload,
  });
}
