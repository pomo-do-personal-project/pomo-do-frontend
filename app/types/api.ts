// ==========================================
// Pomo-do API Types & Contracts
// Based on C# Backend Clean Architecture & API_SPEC.md
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errors: string[] | null;
}

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
  isAdmin?: boolean;
  isSuspended?: boolean;
  suspendedReason?: string | null;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export enum OtpPurpose {
  Register = 1,
}

export interface SendOtpRequest {
  email: string;
  purpose?: OtpPurpose;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  otpCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

// Re-export domain types for backward compatibility across all components
export * from "./task";
export * from "./pomodoro";
export * from "./analytics";
