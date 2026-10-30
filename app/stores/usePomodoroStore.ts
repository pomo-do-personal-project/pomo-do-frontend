import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  FocusSessionDto,
  PomodoroSummaryDto,
  FocusSessionMode,
  StartSessionRequest,
  CompleteSessionRequest,
} from "../types/api";
import { pomodoroService } from "../services/pomodoroService";

interface PomodoroState {
  currentSession: FocusSessionDto | null;
  summary: PomodoroSummaryDto | null;
  history: FocusSessionDto[];
  isLoading: boolean;
  error: string | null;

  // Global Timer Runtime State (duy trì liên tục khi chuyển tab/trang)
  timerType: "pomo" | "stopwatch";
  focusMode: "W" | "SB" | "LB";
  isRunning: boolean;
  seconds: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  elapsedSeconds: number;
  taskName: string;

  // Timer Actions
  setTimerType: (type: "pomo" | "stopwatch") => void;
  setFocusMode: (mode: "W" | "SB" | "LB") => void;
  setTaskName: (name: string) => void;
  setIsRunning: (running: boolean) => void;
  tickTimer: (focusDurationMinutes: number) => void;
  resetTimer: (defaultSeconds: number) => void;

  // Actions
  fetchSummary: () => Promise<void>;
  fetchHistory: (fromUtc?: string, toUtc?: string) => Promise<void>;
  startSession: (data: StartSessionRequest) => Promise<FocusSessionDto | null>;
  completeSession: (sessionId: string, data: CompleteSessionRequest) => Promise<FocusSessionDto | null>;
  cancelSession: (sessionId: string, actualSeconds: number) => Promise<void>;
  fastForwardSession: (data: {
    taskId?: string | null;
    mode?: number;
    durationMinutes?: number;
    overtimeMinutes?: number;
    note?: string | null;
  }) => Promise<FocusSessionDto | null>;
  clearCurrentSession: () => void;
  clearError: () => void;
  resetPomodoroStore: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      summary: null,
      history: [],
      isLoading: false,
      error: null,

      // Global Timer Runtime State Defaults
      timerType: "pomo",
      focusMode: "W",
      isRunning: false,
      seconds: 25 * 60,
      isOvertime: false,
      overtimeSeconds: 0,
      elapsedSeconds: 0,
      taskName: "",

      setTimerType: (timerType) => set({ timerType }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setTaskName: (taskName) => set({ taskName }),
      setIsRunning: (isRunning) => set({ isRunning }),

      tickTimer: () => {
        const { isRunning, timerType, isOvertime, seconds, overtimeSeconds, elapsedSeconds } = get();
        if (!isRunning) return;

        const nextElapsed = elapsedSeconds + 1;
        if (timerType === "stopwatch") {
          set({ seconds: seconds + 1, elapsedSeconds: nextElapsed });
          return;
        }

        if (!isOvertime) {
          if (seconds <= 1) {
            set({
              seconds: 0,
              isOvertime: true,
              overtimeSeconds: 1,
              elapsedSeconds: nextElapsed,
            });
          } else {
            set({
              seconds: seconds - 1,
              elapsedSeconds: nextElapsed,
            });
          }
        } else {
          set({
            overtimeSeconds: overtimeSeconds + 1,
            elapsedSeconds: nextElapsed,
          });
        }
      },

      resetTimer: (defaultSeconds: number) => {
        set({
          isRunning: false,
          isOvertime: false,
          seconds: defaultSeconds,
          overtimeSeconds: 0,
          elapsedSeconds: 0,
        });
      },

      clearError: () => set({ error: null }),
      clearCurrentSession: () => set({ currentSession: null }),

      resetPomodoroStore: () => {
        set({
          currentSession: null,
          summary: null,
          history: [],
          isLoading: false,
          error: null,
          taskName: "",
        });
      },

      fetchSummary: async () => {
        try {
          const summary = await pomodoroService.getSummary();
          if (summary) {
            set({ summary });
          }
        } catch (err: unknown) {
          const errObj = typeof err === "object" && err !== null ? (err as Record<string, unknown>) : null;
          const is401 = errObj?.statusCode === 401 || (err instanceof Error ? err.message : String(err)).toLowerCase().includes("unauthorized");
          if (is401) {
            set({ summary: null, history: [] });
            if (typeof window !== "undefined") {
              localStorage.removeItem("pomo-pomodoro-cache");
            }
          } else {
            console.warn("Fetch summary error:", (err instanceof Error ? err.message : String(err)));
          }
        }
      },

      fetchHistory: async (fromUtc?: string, toUtc?: string) => {
        set({ isLoading: true, error: null });
        try {
          const history = await pomodoroService.getHistory(fromUtc, toUtc);
          set({ history, isLoading: false });
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: (err instanceof Error ? err.message : String(err)) || "Không thể tải lịch sử tập trung",
          });
        }
      },

      startSession: async (data: StartSessionRequest) => {
        set({ error: null });
        try {
          const session = await pomodoroService.startSession(data);
          if (session) {
            set({ currentSession: session });
            return session;
          }
          return null;
        } catch (err: unknown) {
          set({ error: (err instanceof Error ? err.message : String(err)) || "Không thể khởi tạo phiên tập trung" });
          return null;
        }
      },

      completeSession: async (sessionId: string, data: CompleteSessionRequest) => {
        try {
          const completed = await pomodoroService.completeSession(sessionId, data);
          if (completed) {
            set((state) => ({
              currentSession: null,
              history: [completed, ...state.history],
            }));
            // Cập nhật lại summary metrics sau khi hoàn thành
            get().fetchSummary();
            return completed;
          }
          return null;
        } catch (err: unknown) {
          set({ error: (err instanceof Error ? err.message : String(err)) || "Không thể lưu phiên tập trung" });
          return null;
        }
      },

      cancelSession: async (sessionId: string, actualSeconds: number) => {
        try {
          await pomodoroService.cancelSession(sessionId, { actualSeconds });
          set({ currentSession: null });
        } catch (err: unknown) {
          console.warn("Cancel session error:", (err instanceof Error ? err.message : String(err)));
          set({ currentSession: null });
        }
      },

      fastForwardSession: async (data) => {
        set({ error: null });
        try {
          const session = await pomodoroService.fastForwardSession(data);
          if (session) {
            set((state) => ({
              currentSession: null,
              history: [session, ...state.history],
            }));
            // Cập nhật lại summary metrics sau khi tạo phiên thành công
            get().fetchSummary();
            return session;
          }
          return null;
        } catch (err: unknown) {
          set({ error: (err instanceof Error ? err.message : String(err)) || "Không thể thực hiện tua nhanh phiên tập trung" });
          return null;
        }
      },
    }),
    {
      name: "pomo-pomodoro-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        summary: state.summary,
        history: state.history,
        currentSession: state.currentSession,
        taskName: state.taskName,
        focusMode: state.focusMode,
        timerType: state.timerType,
        seconds: state.seconds,
        elapsedSeconds: state.elapsedSeconds,
        isOvertime: state.isOvertime,
        overtimeSeconds: state.overtimeSeconds,
        isRunning: state.isRunning,
      }),
    }
  )
);
