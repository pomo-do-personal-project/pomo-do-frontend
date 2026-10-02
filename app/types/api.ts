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
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
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

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros?: number;
  priority?: "Low" | "Medium" | "High";
  isCompleted?: boolean;
  dueDate?: string;
  tags?: string[];
  createdAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  estimatedPomodoros: number;
  priority?: "Low" | "Medium" | "High";
  dueDate?: string;
  tags?: string[];
}
