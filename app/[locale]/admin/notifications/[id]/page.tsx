"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "../../../../stores/useLanguageStore";
import { adminService } from "../../../../services/adminService";
import { GmailSentEmailDetail } from "../../../../components/admin/GmailSentEmailDetail";
import { SentNotificationItem } from "../../../../components/admin/NotificationSentList";

export default function AdminNotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useTranslation();

  const notifId = params?.id as string;
  const [item, setItem] = useState<SentNotificationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadItem = useCallback(async () => {
    if (!notifId) return;
    try {
      // 1. Try reading from sessionStorage cache for instant load
      const cached = sessionStorage.getItem(`notif_${notifId}`);
      if (cached) {
        setItem(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      // 2. Fallback: Fetch broadcast & audit logs
      setIsLoading(true);
      const [bData, auditData] = await Promise.allSettled([
        adminService.getBroadcast(),
        adminService.getAuditLogs({ page: 1, pageSize: 50 }),
      ]);

      if (notifId === "broadcast-active" && bData.status === "fulfilled" && bData.value) {
        const parts = bData.value.message.split(" - ");
        setItem({
          id: "broadcast-active",
          title: parts[0] || "Thông báo hệ thống",
          content: parts.slice(1).join(" - ") || bData.value.message,
          category: bData.value.type || "info",
          scope: "broadcast",
          targetText: "Toàn bộ người dùng",
          sentAt: new Date(bData.value.updatedAt).toLocaleDateString("vi-VN"),
          isActive: bData.value.isActive,
        });
        return;
      }

      if (auditData.status === "fulfilled" && auditData.value?.items) {
        const found = auditData.value.items.find((a) => a.id === notifId);
        if (found) {
          const isEmail = found.action === "SEND_EMAIL";
          const raw = found.details?.replace(/^(Gửi email cho [^:]+:\s*|Cập nhật thông báo hệ thống:\s*)/, "") || "";
          const parts = raw.split(" - ");
          setItem({
            id: found.id,
            title: isEmail ? found.reason || "Email" : parts[0] || "Thông báo",
            content: parts.slice(1).join(" - ") || raw || found.reason || "",
            category: found.reason === "warning" || found.reason === "maintenance" ? found.reason : "info",
            scope: isEmail ? "direct" : "broadcast",
            targetText: isEmail ? found.targetUserEmail || "Người dùng" : "Toàn bộ người dùng",
            sentAt: new Date(found.createdAt).toLocaleDateString("vi-VN"),
          });
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load notification detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [notifId]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleBack = () => {
    router.push(`/${language}/admin/notifications`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-400 gap-2 text-xs">
        <Loader2 size={18} className="animate-spin" />
        <span>Đang tải nội dung thông báo...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white dark:bg-[#151619] rounded-3xl p-12 text-center space-y-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Không tìm thấy thông báo hoặc thông báo đã bị xóa.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Quay lại danh sách</span>
        </button>
      </div>
    );
  }

  return <GmailSentEmailDetail item={item} onBack={handleBack} />;
}
