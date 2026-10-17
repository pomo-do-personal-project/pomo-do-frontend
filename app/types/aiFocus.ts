export type AiFocusStatus = "FOCUSED" | "DISTRACTED" | "AFK" | "DISCONNECTED";
export type AiSensitivity = "standard" | "relaxed" | "strict";

export interface AiSessionAnalysis {
  score: number;
  grade: "S" | "A" | "B" | "C" | "D";
  conclusion: string;
  advice: string;
  phoneCount: number;
  phoneSeconds: number;
  sleepCount: number;
  lookAwayCount: number;
  focusedSeconds: number;
  distractedSeconds: number;
  totalSeconds: number;
}

export interface AiSessionDetailData {
  score?: number;
  grade?: string;
  phoneCount?: number;
  ph?: number;
  sleepCount?: number;
  sl?: number;
  lookAwayCount?: number;
  lk?: number;
  conclusion?: string;
  fb?: string;
  advice?: string;
  [key: string]: unknown;
}

export interface AiFocusState {
  isConnected: boolean;
  isAiEnabled: boolean;
  isConnecting: boolean;
  error: string | null;

  status: AiFocusStatus;
  detail: string;
  isFocused: boolean;
  activeScreen: number | null;
  totalScreens: number;
  image: string | null;
  showCameraPreview: boolean;

  distractionCount: number;
  phoneCount: number;
  phoneSeconds: number;
  sleepCount: number;
  lookAwayCount: number;
  focusedSeconds: number;
  distractedSeconds: number;
  totalSessionSeconds: number;
  previousStatus: AiFocusStatus;
  previousDetail: string;

  toggleAiEnabled: () => void;
  toggleCameraPreview: () => void;
  connect: () => void;
  disconnect: () => void;
  addScreen: () => Promise<boolean>;
  resetScreens: () => Promise<boolean>;
  onTimerTick: (isWorkTimerRunning: boolean) => void;
  resetSessionStats: () => void;
  getFocusScore: () => number;
  analyzeAndFinalizeSession: (taskName?: string) => Promise<AiSessionAnalysis>;
}
