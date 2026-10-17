export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt: string;
  isAdmin: boolean;
  isSuspended: boolean;
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  lastActiveAt?: string | null;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsersToday: number;
  suspendedUsers: number;
  activeRatePercentage: number;
  googleUsersCount: number;
  localUsersCount: number;
}

export interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "offline";
  latencyMs: number;
  details: string;
}

export interface AdminSystemHealth {
  apiBackend: ServiceStatus;
  database: ServiceStatus;
  redisCache: ServiceStatus;
  aiVision: ServiceStatus;
}

export interface SystemBroadcast {
  message: string;
  type: "info" | "warning" | "maintenance";
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateBroadcastPayload {
  message: string;
  type: "info" | "warning" | "maintenance";
  isActive: boolean;
}

export interface UpdateUserStatusPayload {
  isSuspended: boolean;
  reason?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminDisplayName: string;
  targetUserId: string;
  targetUserEmail: string;
  targetUserDisplayName: string;
  action: string;
  reason?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminScheduledNotification {
  id: string;
  adminId: string;
  title: string;
  content: string;
  category: "info" | "warning" | "maintenance";
  scope: "direct" | "broadcast";
  recipientEmails?: string | null;
  scheduledAt: string;
  isSent: boolean;
  sentAt?: string | null;
  createdAt: string;
}

export interface CreateScheduledNotificationPayload {
  title: string;
  content: string;
  category?: "info" | "warning" | "maintenance";
  scope?: "direct" | "broadcast";
  recipientEmails?: string[];
  scheduledAtUtc: string;
}

