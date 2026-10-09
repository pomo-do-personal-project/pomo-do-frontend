import { useAuthStore } from "../stores/useAuthStore";
import { useTaskStore } from "../stores/useTaskStore";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useSettingsStore } from "../stores/useSettingsStore";

/**
 * Dọn dẹp toàn bộ dữ liệu cá nhân (Zustand state & LocalStorage cache)
 * Được gọi khi:
 * 1. Người dùng chủ động Logout.
 * 2. Gặp lỗi 401 Unauthorized / Token Expired mà refresh token thất bại.
 */
export function clearAllUserData(): void {
  // 1. Reset Auth Store & Xóa storage auth
  useAuthStore.getState().setUser(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("pomo-auth-storage");
  }

  // 2. Reset Task Store & Xóa cache task
  useTaskStore.getState().resetTaskStore();
  if (typeof window !== "undefined") {
    localStorage.removeItem("pomo-tasks-cache");
  }

  // 3. Reset Pomodoro Store & Xóa cache pomodoro
  usePomodoroStore.getState().resetPomodoroStore();
  if (typeof window !== "undefined") {
    localStorage.removeItem("pomo-pomodoro-cache");
  }

  // 4. Reset Settings Store & Xóa cache settings
  useSettingsStore.getState().resetSettingsStore();
  if (typeof window !== "undefined") {
    localStorage.removeItem("pomo-settings-cache");
  }
}
