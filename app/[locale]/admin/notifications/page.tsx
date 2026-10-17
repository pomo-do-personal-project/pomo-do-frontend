"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslation } from "../../../stores/useLanguageStore";
import { adminService } from "../../../services/adminService";
import { SystemBroadcast, AdminUserSummary } from "../../../types/admin";
import { PRESET_NOTIFICATION_TEMPLATES, NotificationTemplate } from "../../../components/admin/notificationTemplates";
import { NotificationTemplatesList } from "../../../components/admin/NotificationTemplatesList";
import { NotificationSentList, SentNotificationItem } from "../../../components/admin/NotificationSentList";
import { UserEmailModal } from "../../../components/admin/UserEmailModal";
import { scheduledNotificationStorage } from "../../../components/admin/scheduledNotificationStorage";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { language } = useTranslation();

  const [activeTab, setActiveTab] = useState<"sent" | "templates">("sent");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBroadcast, setActiveBroadcast] = useState<SystemBroadcast | null>(null);
  const [sentItems, setSentItems] = useState<SentNotificationItem[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(PRESET_NOTIFICATION_TEMPLATES);
  const [availableUsers, setAvailableUsers] = useState<AdminUserSummary[]>([]);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [compose, setCompose] = useState({
    isOpen: false, title: "", content: "", category: "info" as "info" | "warning" | "maintenance",
    scheduleOption: "immediate" as "immediate" | "scheduled", scheduledTime: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [bData, auditData, usersData, schedData] = await Promise.allSettled([
        adminService.getBroadcast(),
        adminService.getAuditLogs({ page: 1, pageSize: 50 }),
        adminService.getUsers({ page: 1, pageSize: 50 }),
        adminService.getScheduledNotifications(),
      ]);

      const items: SentNotificationItem[] = [];

      if (bData.status === "fulfilled" && bData.value?.isActive && bData.value?.message?.trim()) {
        setActiveBroadcast(bData.value);
        const parts = bData.value.message.split(" - ");
        items.push({
          id: "broadcast-active", title: parts[0] || "Thông báo hệ thống",
          content: parts.slice(1).join(" - ") || bData.value.message,
          category: bData.value.type || "info", scope: "broadcast",
          targetText: "Toàn bộ người dùng", sentAt: new Date(bData.value.updatedAt).toLocaleDateString("vi-VN"),
          isActive: true,
        });
      } else {
        setActiveBroadcast(null);
      }

      if (auditData.status === "fulfilled" && auditData.value?.items) {
        auditData.value.items.forEach((a) => {
          const isEmail = a.action === "SEND_EMAIL" || a.action === "SCHEDULED_EMAIL";
          const isBroadcast = a.action === "UPDATE_BROADCAST" || a.action === "SCHEDULED_BROADCAST";
          if (isEmail || isBroadcast) {
            const raw = a.details?.replace(/^(Gửi email cho [^:]+:\s*|Cập nhật thông báo hệ thống:\s*|Tự động gửi theo lịch hẹn:\s*)/, "") || "";
            const parts = raw.split(" - ");
            const emailMatch = a.details?.match(/Gửi email cho ([^:]+):/);
            const targetText = isEmail ? (emailMatch ? emailMatch[1].trim() : a.targetUserEmail || "Người dùng") : "Toàn bộ người dùng";
            const cat = (a.reason === "warning" || a.reason === "maintenance") ? a.reason : "info";
            items.push({
              id: a.id, title: isEmail ? a.reason || "Email" : parts[0] || "Thông báo",
              content: parts.slice(1).join(" - ") || raw || a.reason || "",
              category: cat, scope: isEmail ? "direct" : "broadcast",
              targetText,
              sentAt: new Date(a.createdAt).toLocaleDateString("vi-VN"),
            });
          }
        });
      }

      setSentItems(items);

      if (schedData.status === "fulfilled" && schedData.value) {
        const pending = schedData.value.filter((s) => !s.isSent);
        const serverTemplates: NotificationTemplate[] = pending.map((s) => ({
          id: s.id, title: s.title, content: s.content, category: s.category, scope: s.scope,
          description: s.recipientEmails ? `Gửi tới ${s.recipientEmails.split(",").length} người nhận: ${s.recipientEmails}` : "Thông báo phát sóng toàn hệ thống",
          scheduleTime: new Date(s.scheduledAt).toLocaleString("vi-VN", {
            hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
          }),
          isAutomated: true,
        }));
        setTemplates(serverTemplates);
      }

      if (usersData.status === "fulfilled" && usersData.value?.items) {
        setAvailableUsers(usersData.value.items);
      }
    } catch (err) {
      console.error("Failed to load notifications data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleDeactivate = async () => {
    if (!confirm("Bạn có chắc chắn muốn gỡ ghim thông báo này?")) return;
    try {
      setIsDeactivating(true);
      await adminService.updateBroadcast({ message: activeBroadcast?.message || "", type: activeBroadcast?.type || "info", isActive: false });
      setSuccessToast("Đã gỡ ghim thông báo thành công!");
      await loadData();
      setTimeout(() => setSuccessToast(null), 3500);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleViewItem = (item: SentNotificationItem) => {
    try { sessionStorage.setItem(`notif_${item.id}`, JSON.stringify(item)); } catch {}
    router.push(`/${language}/admin/notifications/${item.id}`);
  };

  const handleOpenCompose = (initial?: Partial<typeof compose>) => {
    setCompose({
      isOpen: true, title: initial?.title || "", content: initial?.content || "",
      category: initial?.category || "info", scheduleOption: initial?.scheduleOption || "immediate",
      scheduledTime: initial?.scheduledTime || "",
    });
  };

  const handleSaveSchedule = (item: {
    title: string; content: string; category: "info" | "warning" | "maintenance";
    scheduledTime: string; scope: "broadcast" | "direct"; recipients?: string[];
  }) => {
    scheduledNotificationStorage.saveScheduled(item);
    loadData();
  };

  const handleDeleteTemplate = async (id: string) => {
    try { await adminService.deleteScheduledNotification(id); } catch {}
    scheduledNotificationStorage.removeScheduled(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 bg-white dark:bg-[#151619] rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <Search size={16} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc nội dung thông báo..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-[#1C1D21] border-0 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#1C1D21] p-1 rounded-xl">
            <button
              type="button" onClick={() => setActiveTab("sent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "sent" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Thông báo đã gửi ({sentItems.length})
            </button>
            <button
              type="button" onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "templates" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Thông báo cài sẵn ({templates.length})
            </button>
          </div>

          <button
            type="button" onClick={() => handleOpenCompose()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-xs transition-all cursor-pointer"
          >
            Soạn thông báo
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {successToast}
        </div>
      )}

      {activeTab === "sent" ? (
        <NotificationSentList
          activeBroadcast={activeBroadcast} sentItems={sentItems} onDeactivateActive={handleDeactivate}
          onViewItem={handleViewItem} isDeactivating={isDeactivating} searchQuery={searchQuery}
        />
      ) : (
        <NotificationTemplatesList
          templates={templates}
          onUseTemplate={(tpl) => handleOpenCompose({
            title: tpl.title, content: tpl.content, category: tpl.category, scheduleOption: "scheduled",
          })}
          onDeleteTemplate={handleDeleteTemplate} searchQuery={searchQuery}
        />
      )}

      <UserEmailModal
        isOpen={compose.isOpen} onClose={() => setCompose((prev) => ({ ...prev, isOpen: false }))}
        allowBroadcast={true} initialTitle={compose.title} initialContent={compose.content}
        initialCategory={compose.category} initialScheduleOption={compose.scheduleOption}
        initialScheduledTime={compose.scheduledTime} availableUsers={availableUsers}
        onSaveSchedule={handleSaveSchedule}
        onSendSuccess={(msg) => {
          setSuccessToast(msg);
          loadData();
          setTimeout(() => setSuccessToast(null), 4000);
        }}
      />
    </div>
  );
}
