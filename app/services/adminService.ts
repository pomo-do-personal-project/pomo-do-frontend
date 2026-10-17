import { apiClient } from "../lib/apiClient";
import {
  AdminMetrics,
  AdminUserSummary,
  AdminSystemHealth,
  SystemBroadcast,
  UpdateBroadcastPayload,
  UpdateUserStatusPayload,
  AdminAuditLog,
  PagedResult,
  AdminScheduledNotification,
  CreateScheduledNotificationPayload,
} from "../types/admin";

export const adminService = {
  async getMetrics(): Promise<AdminMetrics> {
    const res = await apiClient<AdminMetrics>("/api/admin/metrics");
    return res.data!;
  },

  async getSystemHealth(): Promise<AdminSystemHealth> {
    const res = await apiClient<AdminSystemHealth>("/api/admin/health");
    return res.data!;
  },

  async getBroadcast(): Promise<SystemBroadcast> {
    const res = await apiClient<SystemBroadcast>("/api/admin/broadcast");
    return res.data!;
  },

  async updateBroadcast(payload: UpdateBroadcastPayload): Promise<SystemBroadcast> {
    const res = await apiClient<SystemBroadcast>("/api/admin/broadcast", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async getActiveBroadcast(): Promise<SystemBroadcast> {
    const res = await apiClient<SystemBroadcast>("/api/system/broadcast");
    return res.data!;
  },

  async getUsers(params?: {
    search?: string;
    isSuspended?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<AdminUserSummary>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      search: params?.search || undefined,
      isSuspended: params?.isSuspended !== undefined ? params.isSuspended : undefined,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 15,
    };

    const res = await apiClient<PagedResult<AdminUserSummary>>("/api/admin/users", {
      params: queryParams,
    });
    return res.data!;
  },

  async getUserById(id: string): Promise<AdminUserSummary> {
    try {
      const res = await apiClient<AdminUserSummary>(`/api/admin/users/${id}`);
      if (res.data) return res.data;
    } catch {
      // Fallback: tìm trong danh sách users nếu backend chưa reload
    }
    const listRes = await this.getUsers({ page: 1, pageSize: 50 });
    const user = listRes.items.find((u) => u.id === id);
    if (!user) throw new Error("Không tìm thấy thông tin người dùng.");
    return user;
  },

  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload
  ): Promise<string> {
    const res = await apiClient<string>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.message;
  },

  async getAuditLogs(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<AdminAuditLog>> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };

    const res = await apiClient<PagedResult<AdminAuditLog>>("/api/admin/audit-logs", {
      params: queryParams,
    });
    return res.data!;
  },

  async sendEmail(payload: {
    userIds?: string[];
    emails?: string[];
    subject: string;
    content: string;
  }): Promise<string> {
    const res = await apiClient<string>("/api/admin/send-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.message;
  },

  async getScheduledNotifications(): Promise<AdminScheduledNotification[]> {
    const res = await apiClient<AdminScheduledNotification[]>("/api/admin/scheduled");
    return res.data || [];
  },

  async createScheduledNotification(
    payload: CreateScheduledNotificationPayload
  ): Promise<AdminScheduledNotification> {
    const res = await apiClient<AdminScheduledNotification>("/api/admin/scheduled", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async deleteScheduledNotification(id: string): Promise<boolean> {
    const res = await apiClient<boolean>(`/api/admin/scheduled/${id}`, {
      method: "DELETE",
    });
    return res.data ?? true;
  },
};

