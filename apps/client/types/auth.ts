export interface UserProfile {
  fullName: string;
  birthDate: string;
  cpf: string;
}

export interface AuthUser {
  id?: string;
  sub?: string;
  email: string;
  name: string;
  isVerified?: boolean;
  profile?: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  /** Token JWT principal (compatível com API .NET e Cognito/Mobile). */
  token?: string;
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user: AuthUser;
}

export type LoginResponse = AuthResponse;

export interface RegisterResponse {
  message: string;
  requiresEmailVerification?: boolean;
}

