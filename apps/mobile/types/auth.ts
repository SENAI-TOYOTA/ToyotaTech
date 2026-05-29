import type { UserProfile } from "@/types/profile";

export interface AuthUser {
  email: string;
  name: string;
  isVerified: boolean;
  sub?: string;
  profile?: UserProfile;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  nextRoute: "/login" | "/register";
  isFederated?: boolean;
}

export interface SetPasswordPayload {
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  requiresEmailVerification: boolean;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface RefreshSessionPayload {
  refreshToken: string;
}

export interface RefreshSessionResponse {
  accessToken: string;
  idToken: string;
  expiresAt: number;
}
