import { apiClient } from "../lib/apiClient";
import {
  FocusSessionDto,
  PomodoroSummaryDto,
  StartSessionRequest,
  CompleteSessionRequest,
  CancelSessionRequest,
} from "../types/api";

export const pomodoroService = {
  /**
   * Bắt đầu phiên tập trung Pomodoro hoặc Stopwatch
   */
  async startSession(data: StartSessionRequest): Promise<FocusSessionDto | null> {
    const res = await apiClient<FocusSessionDto>("/api/pomodoro/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Hoàn thành phiên tập trung, ghi nhận thời gian thực tế, overtime và cập nhật chuỗi streak
   */
  async completeSession(
    sessionId: string,
    data: CompleteSessionRequest
  ): Promise<FocusSessionDto | null> {
    const res = await apiClient<FocusSessionDto>(`/api/pomodoro/${sessionId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Hủy phiên tập trung đang chạy
   */
  async cancelSession(
    sessionId: string,
    data: CancelSessionRequest
  ): Promise<FocusSessionDto | null> {
    const res = await apiClient<FocusSessionDto>(`/api/pomodoro/${sessionId}/cancel`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Tua nhanh và hoàn thành phiên Pomodoro ngay lập tức kèm thời gian Overtime lên backend (dùng cho test/nhanh)
   */
  async fastForwardSession(data: {
    taskId?: string | null;
    mode?: number;
    durationMinutes?: number;
    overtimeMinutes?: number;
    note?: string | null;
  }): Promise<FocusSessionDto | null> {
    const res = await apiClient<FocusSessionDto>("/api/pomodoro/fast-forward", {
      method: "POST",
      body: JSON.stringify({
        taskId: data.taskId || null,
        mode: data.mode ?? 1,
        durationMinutes: data.durationMinutes ?? 25,
        overtimeMinutes: data.overtimeMinutes ?? 0,
        note: data.note || null,
      }),
    });
    return res.data;
  },

  /**
   * Lấy lịch sử các phiên tập trung trong khoảng thời gian
   */
  async getHistory(fromUtc?: string, toUtc?: string): Promise<FocusSessionDto[]> {
    const res = await apiClient<FocusSessionDto[]>("/api/pomodoro/history", {
      method: "GET",
      params: {
        fromUtc,
        toUtc,
      },
    });
    return res.data || [];
  },

  /**
   * Lấy tổng hợp chỉ số thống kê (Pomos hôm nay, thời gian tập trung, overtime, chuỗi streak)
   */
  async getSummary(): Promise<PomodoroSummaryDto | null> {
    const res = await apiClient<PomodoroSummaryDto>("/api/pomodoro/summary", {
      method: "GET",
    });
    return res.data;
  },
};
