import { apiRequest } from "@/services/api";
import {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
} from "@/types/auth";

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
  return apiRequest<RegisterResponse>("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
}
