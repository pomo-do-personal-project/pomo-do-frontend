export interface NotificationTemplate {
  id: string;
  category: "info" | "warning" | "maintenance";
  title: string;
  content: string;
  scope: "broadcast" | "direct";
  description: string;
  scheduleTime: string;
  isAutomated?: boolean;
}

export const PRESET_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [];
