import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserSettingsDto, UpdateUserSettingsRequest } from "../types/api";
import { settingsService } from "../services/settingsService";

interface SettingsState {
  settings: UserSettingsDto;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<UpdateUserSettingsRequest>) => Promise<boolean>;
  setLocalSettings: (partial: Partial<UserSettingsDto>) => void;
  clearError: () => void;
  resetSettingsStore: () => void;
}

const DEFAULT_SETTINGS: UserSettingsDto = {
  id: "",
  userId: "",
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  themeMode: "light",
  emailWeeklyReport: false,
  emailDailyDigest: false,
  dailyDigestTime: "07:00",
  weeklyReportTime: "08:00",
  reportEmail: null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      isSaving: false,
      error: null,

      clearError: () => set({ error: null }),

      resetSettingsStore: () => {
        set({
          settings: DEFAULT_SETTINGS,
          isLoading: false,
          isSaving: false,
          error: null,
        });
      },

      setLocalSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await settingsService.getSettings();
          if (res) {
            set({ settings: res, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err: any) {
          // Khi offline hoặc chưa đăng nhập, tiếp tục dùng local cache
          set({ isLoading: false, error: err?.message || null });
        }
      },

      updateSettings: async (data: Partial<UpdateUserSettingsRequest>) => {
        const current = get().settings;
        const newPayload: UpdateUserSettingsRequest = {
          focusDuration: data.focusDuration ?? current.focusDuration,
          shortBreakDuration: data.shortBreakDuration ?? current.shortBreakDuration,
          longBreakDuration: data.longBreakDuration ?? current.longBreakDuration,
          autoStartBreaks: data.autoStartBreaks ?? current.autoStartBreaks,
          themeMode: data.themeMode ?? current.themeMode,
          emailWeeklyReport: data.emailWeeklyReport ?? current.emailWeeklyReport,
          emailDailyDigest: data.emailDailyDigest ?? current.emailDailyDigest,
          dailyDigestTime: data.dailyDigestTime ?? current.dailyDigestTime ?? "07:00",
          weeklyReportTime: data.weeklyReportTime ?? current.weeklyReportTime ?? "08:00",
          reportEmail: data.reportEmail !== undefined ? data.reportEmail : current.reportEmail,
        };

        // Optimistic update
        set((state) => ({
          settings: { ...state.settings, ...newPayload },
          isSaving: true,
          error: null,
        }));

        try {
          const res = await settingsService.updateSettings(newPayload);
          if (res) {
            set({ settings: res, isSaving: false });
            return true;
          }
          set({ isSaving: false });
          return true;
        } catch (err: any) {
          set({ isSaving: false, error: err?.message || "Không thể lưu cài đặt lên máy chủ." });
          return false;
        }
      },
    }),
    {
      name: "pomo-settings-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
