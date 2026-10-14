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

export interface CreateTagRequest {
  name: string;
  colorHex?: string;
}

export interface UpdateTagRequest {
  name: string;
  colorHex?: string;
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
  isQuickAdd?: boolean;
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
  isQuickAdd?: boolean;
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

// ==========================================
// Pomodoro Focus Sessions & Summary Types
// ==========================================

export enum FocusSessionMode {
  Pomo = 1,
  Stopwatch = 2,
}

export interface FocusSessionDto {
  id: string;
  userId: string;
  taskId?: string | null;
  taskTitle?: string | null;
  mode: FocusSessionMode;
  durationMinutes: number;
  actualSeconds: number;
  actualMinutes: number;
  overtimeSeconds: number;
  overtimeMinutes: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string | null;
  note?: string | null;
}

export interface PomodoroSummaryDto {
  totalPomosToday: number;
  totalFocusMinutesToday: number;
  totalOvertimeMinutesToday: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string | null;
}

export interface StartSessionRequest {
  taskId?: string | null;
  mode: FocusSessionMode;
  durationMinutes: number;
}

export interface CompleteSessionRequest {
  actualSeconds: number;
  overtimeSeconds?: number;
  note?: string | null;
}

export interface CancelSessionRequest {
  actualSeconds: number;
}

export interface FastForwardSessionRequest {
  taskId?: string | null;
  mode: FocusSessionMode;
  durationMinutes: number;
  overtimeMinutes?: number;
  note?: string | null;
}

// ==========================================
// User Settings Preferences Types
// ==========================================

export interface UserSettingsDto {
  id: string;
  userId: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  themeMode: "light" | "dark" | "system" | string;
}

export interface UpdateUserSettingsRequest {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  themeMode?: string;
}
