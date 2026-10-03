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
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      summary: null,
      history: [],
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),
      clearCurrentSession: () => set({ currentSession: null }),

      fetchSummary: async () => {
        try {
          const summary = await pomodoroService.getSummary();
          if (summary) {
            set({ summary });
          }
        } catch (err: any) {
          // Lỗi mạng được apiClient xử lý chuyển sang offline mode
          console.warn("Fetch summary error:", err?.message);
        }
      },

      fetchHistory: async (fromUtc?: string, toUtc?: string) => {
        set({ isLoading: true, error: null });
        try {
          const history = await pomodoroService.getHistory(fromUtc, toUtc);
          set({ history, isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || "Không thể tải lịch sử tập trung",
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
        } catch (err: any) {
          set({ error: err?.message || "Không thể khởi tạo phiên tập trung" });
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
        } catch (err: any) {
          set({ error: err?.message || "Không thể lưu phiên tập trung" });
          return null;
        }
      },

      cancelSession: async (sessionId: string, actualSeconds: number) => {
        try {
          await pomodoroService.cancelSession(sessionId, { actualSeconds });
          set({ currentSession: null });
        } catch (err: any) {
          console.warn("Cancel session error:", err?.message);
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
        } catch (err: any) {
          set({ error: err?.message || "Không thể thực hiện tua nhanh phiên tập trung" });
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
      }),
    }
  )
);
