export interface AuthUser {
  email: string;
  name: string;
  isVerified?: boolean;
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

export interface LoginResponse {
  token: string;
  expiresAt: number;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  requiresEmailVerification: boolean;
  verificationCode?: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}
