import { apiClient } from "../lib/apiClient";
import { UserSettingsDto, UpdateUserSettingsRequest } from "../types/api";

export const settingsService = {
  /**
   * Lấy cấu hình thời lượng Pomodoro và preferences của người dùng hiện tại
   */
  async getSettings(): Promise<UserSettingsDto | null> {
    const res = await apiClient<UserSettingsDto>("/api/settings", {
      method: "GET",
    });
    return res.data;
  },

  /**
   * Cập nhật thời lượng Pomodoro (Focus, Short Break, Long Break) và preferences
   */
  async updateSettings(data: UpdateUserSettingsRequest): Promise<UserSettingsDto | null> {
    const res = await apiClient<UserSettingsDto>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Gửi thử nghiệm email báo cáo (Weekly hoặc Daily)
   */
  async sendTestEmailReport(reportType: "weekly" | "daily", targetEmail?: string): Promise<boolean> {
    const res = await apiClient<boolean>("/api/settings/email-report/test", {
      method: "POST",
      body: JSON.stringify({ reportType, targetEmail }),
    });
    return res.success;
  },
};

