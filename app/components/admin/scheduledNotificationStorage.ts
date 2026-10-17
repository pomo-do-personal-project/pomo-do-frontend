import { NotificationTemplate } from "./notificationTemplates";

const STORAGE_KEY = "pomodo_scheduled_notifications";

export const scheduledNotificationStorage = {
  // Lấy toàn bộ danh sách thông báo cài sẵn / lên lịch đã lưu
  getScheduled(): NotificationTemplate[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Lưu thông báo lên lịch mới vào bộ nhớ cục bộ
  saveScheduled(item: {
    title: string;
    content: string;
    category: "info" | "warning" | "maintenance";
    scheduledTime: string;
    scope: "broadcast" | "direct";
    recipients?: string[];
  }): NotificationTemplate {
    const list = this.getScheduled();
    const formattedDate = new Date(item.scheduledTime).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const newTemplate: NotificationTemplate = {
      id: `sched-${Date.now()}`,
      title: item.title,
      content: item.content,
      category: item.category,
      scope: item.scope,
      description: item.recipients && item.recipients.length > 0
        ? `Gửi tới ${item.recipients.length} người nhận: ${item.recipients.slice(0, 2).join(", ")}${item.recipients.length > 2 ? "..." : ""}`
        : "Thông báo phát sóng tự động toàn hệ thống",
      scheduleTime: formattedDate,
      isAutomated: true,
    };

    const updated = [newTemplate, ...list];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return newTemplate;
  },

  // Xóa một thông báo cài sẵn theo ID
  removeScheduled(id: string): NotificationTemplate[] {
    const list = this.getScheduled().filter((t) => t.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
    return list;
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
