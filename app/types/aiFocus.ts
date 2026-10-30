export type AiFocusStatus = "FOCUSED" | "DISTRACTED" | "AFK" | "DISCONNECTED";
export type AiEventCode = "NORMAL" | "PHONE_DETECTED" | "SLEEPING" | "LOOK_AWAY" | "AFK";
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
  eventCode: AiEventCode;
  detail: string;
  isFocused: boolean;
  activeScreen: number | null;
  totalScreens: number;
  image: string | null;
  showCameraPreview: boolean;
  sensitivity: "relaxed" | "standard" | "strict";
  deskReadingMode: boolean;
  blurBackground: boolean;
  blurredImage: string | null;

  distractionCount: number;
  phoneCount: number;
  phoneSeconds: number;
  sleepCount: number;
  lookAwayCount: number;
  focusedSeconds: number;
  distractedSeconds: number;
  totalSessionSeconds: number;
  previousStatus: AiFocusStatus;
  previousEventCode: AiEventCode;
  previousDetail: string;

  toggleAiEnabled: () => void;
  toggleCameraPreview: () => void;
  setSensitivity: (level: "relaxed" | "standard" | "strict") => void;
  setDeskReadingMode: (enabled: boolean) => void;
  setBlurBackground: (enabled: boolean) => void;
  connect: () => void;
  disconnect: () => void;
  addScreen: () => Promise<boolean>;
  resetScreens: () => Promise<boolean>;
  onTimerTick: (isWorkTimerRunning: boolean) => void;
  resetSessionStats: () => void;
  getFocusScore: () => number;
  analyzeAndFinalizeSession: (taskName?: string) => Promise<AiSessionAnalysis>;
}
