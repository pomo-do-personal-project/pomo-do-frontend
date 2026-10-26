// ==========================================
// User Settings & Productivity Analytics Types
// ==========================================

export interface UserSettingsDto {
  id: string;
  userId: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  themeMode: "light" | "dark" | "system" | string;
  emailWeeklyReport?: boolean;
  emailDailyDigest?: boolean;
  dailyDigestTime?: string;
  weeklyReportTime?: string;
  reportEmail?: string | null;
  wallpaperUrl?: string | null;
  alarmSoundUrl?: string | null;
  ambientSoundUrl?: string | null;
}

export interface UpdateUserSettingsRequest {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  themeMode?: string;
  emailWeeklyReport?: boolean;
  emailDailyDigest?: boolean;
  dailyDigestTime?: string;
  weeklyReportTime?: string;
  reportEmail?: string | null;
  wallpaperUrl?: string | null;
  alarmSoundUrl?: string | null;
  ambientSoundUrl?: string | null;
}

export interface TestEmailReportRequest {
  reportType: "weekly" | "daily";
  targetEmail?: string;
}

export interface HeatmapCellDto {
  dayOfWeek: number;
  dayName: string;
  hour: number;
  hourLabel: string;
  totalMinutes: number;
  completedCount: number;
  cancelledCount: number;
  averageAiScore: number;
  level: number;
}

export interface AiProductivityInsightDto {
  goldenHourWindow: string;
  goldenHourScore: number;
  vulnerableWindow: string;
  vulnerableReason: string;
  circadianProfile: string;
  totalSessionsAnalyzed: number;
  deepFlowPercentage: number;
  actionableTip: string;
}

export interface FocusHeatmapResponse {
  cells: HeatmapCellDto[];
  insight: AiProductivityInsightDto;
  fromUtc: string;
  toUtc: string;
  totalFocusMinutes: number;
  totalCompletedSessions: number;
}
