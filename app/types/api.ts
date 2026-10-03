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

// ==========================================
// Tasks & Subtasks Domain Types
// ==========================================

export enum Priority {
  ImportantUrgent = 1, // Do first (Khẩn cấp & Quan trọng)
  ImportantNotUrgent = 2, // Schedule (Không khẩn & Quan trọng)
  NotImportantUrgent = 3, // Delegate (Khẩn cấp & Không quan trọng)
  NotImportantNotUrgent = 4, // Don't do (Không khẩn & Không quan trọng)
}

export enum TaskStatus {
  Todo = 1,
  InProgress = 2,
  Completed = 3,
  Archived = 4,
}

export interface TagDto {
  id: string;
  name: string;
  colorHex: string;
}

export interface SubtaskDto {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface TaskDto {
  id: string;
  userId: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  estimatedPomodoros: number;
  estimatedMinutes: number;
  completedPomodoros: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  subtasks: SubtaskDto[];
  tags: TagDto[];
}

export interface CreateTaskRequest {
  title: string;
  priority?: Priority;
  estimatedPomodoros?: number;
  estimatedMinutes?: number;
  dueDate?: string | null;
  tagIds?: string[];
  initialSubtasks?: string[];
}

export interface UpdateTaskRequest {
  title: string;
  priority: Priority;
  status: TaskStatus;
  estimatedPomodoros: number;
  estimatedMinutes: number;
  dueDate?: string | null;
  tagIds?: string[];
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface CreateSubtaskRequest {
  title: string;
  orderIndex?: number;
}

export interface UpdateSubtaskRequest {
  title: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: Priority;
  tagId?: string;
  search?: string;
  inTrash?: boolean;
  sortBy?: "createdAt" | "dueDate" | "priority" | "title";
  isDescending?: boolean;
}
