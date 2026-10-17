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
  isTaskCompleted?: boolean;
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
