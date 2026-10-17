"use client";

import React, { useState, useEffect } from "react";
import { AdminUserSummary } from "../../types/admin";
import { adminService } from "../../services/adminService";
import { GmailComposeCard } from "./GmailComposeCard";
import { GmailComposeHeader } from "./GmailComposeHeader";
import { EmailRecipient } from "./GmailRecipientsRow";
import { scheduledNotificationStorage } from "./scheduledNotificationStorage";

const EMPTY_USERS: AdminUserSummary[] = [];

interface UserEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers?: AdminUserSummary[];
  availableUsers?: AdminUserSummary[];
  onSendSuccess?: (msg: string) => void;
  allowBroadcast?: boolean;
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: "info" | "warning" | "maintenance";
  initialScheduleOption?: "immediate" | "scheduled";
  initialScheduledTime?: string;
  onSaveSchedule?: (item: {
    title: string; content: string; category: "info" | "warning" | "maintenance"; scheduledTime: string; scope: "broadcast" | "direct"; recipients?: string[];
  }) => void;
}

export function UserEmailModal({
  isOpen, onClose, selectedUsers = EMPTY_USERS, availableUsers = EMPTY_USERS,
  onSendSuccess, allowBroadcast = false, initialTitle = "", initialContent = "",
  initialCategory = "info", initialScheduleOption = "immediate", initialScheduledTime = "",
  onSaveSchedule,
}: UserEmailModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [category, setCategory] = useState<"info" | "warning" | "maintenance">(initialCategory);
  const [url, setUrl] = useState("");
  const [scheduleOption, setScheduleOption] = useState<"immediate" | "scheduled">(initialScheduleOption);
  const [scheduledTime, setScheduledTime] = useState(initialScheduledTime);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);

  const selectedUserIds = selectedUsers.map((u) => u.id).join(",");

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialTitle || "");
    setContent(initialContent || "");
    setCategory(initialCategory || "info");
    setScheduleOption(initialScheduleOption || "immediate");
    setScheduledTime(initialScheduledTime || "");
    setRecipients(selectedUsers.map((u) => ({
      id: u.id, email: u.email, name: u.displayName, avatarUrl: u.avatarUrl
    })));
  }, [isOpen, selectedUserIds, initialTitle, initialContent, initialCategory, initialScheduleOption, initialScheduledTime]);

  if (!isOpen) return null;

  const handleAddRecipient = (newRec: EmailRecipient) => {
    setRecipients((prev) => prev.some((r) => r.email.toLowerCase() === newRec.email.toLowerCase()) ? prev : [...prev, newRec]);
  };

  const handleRemoveRecipient = (idx: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      setIsSubmitting(true);
      const fullContent = url.trim() ? `${content.trim()}\n\nLiên kết: ${url.trim()}` : content.trim();

      if (scheduleOption === "scheduled") {
        if (!scheduledTime.trim()) {
          alert("Vui lòng chọn thời gian lên lịch gửi tự động.");
          return;
        }

        const scope = recipients.length === 0 ? "broadcast" : "direct";
        const emailList = recipients.map((r) => r.email);
        const scheduledUtc = new Date(scheduledTime.trim()).toISOString();

        try {
          await adminService.createScheduledNotification({
            title: title.trim(), content: fullContent, category, scope,
            recipientEmails: emailList.length > 0 ? emailList : undefined,
            scheduledAtUtc: scheduledUtc,
          });
        } catch { }

        scheduledNotificationStorage.saveScheduled({
          title: title.trim(), content: fullContent, category, scheduledTime: scheduledTime.trim(),
          scope, recipients: emailList,
        });

        onSaveSchedule?.({
          title: title.trim(), content: fullContent, category, scheduledTime: scheduledTime.trim(),
          scope, recipients: emailList,
        });

        onSendSuccess?.(`Đã lên lịch gửi tự động lúc ${new Date(scheduledTime).toLocaleString("vi-VN")}!`);
        handleReset();
        onClose();
        return;
      }

      if (recipients.length === 0) {
        if (allowBroadcast) {
          const formatted = title.trim() ? `${title.trim()} - ${fullContent}` : fullContent;
          await adminService.updateBroadcast({ message: formatted, type: category, isActive: true });
          onSendSuccess?.("Đã phát sóng thông báo hệ thống thành công!");
          handleReset();
          onClose();
          return;
        }
        alert("Vui lòng nhập hoặc chọn ít nhất 1 người nhận.");
        return;
      }

      const userIds = recipients.filter((r) => r.id).map((r) => r.id!);
      const emails = recipients.map((r) => r.email);

      const resMsg = await adminService.sendEmail({
        userIds: userIds.length > 0 ? userIds : undefined,
        emails: emails.length > 0 ? emails : undefined,
        subject: title.trim(),
        content: fullContent,
      });

      onSendSuccess?.(resMsg || `Đã gửi email thành công tới ${recipients.length} người nhận.`);
      handleReset();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể gửi. Vui lòng thử lại sau.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle(""); setContent(""); setUrl(""); setScheduleOption("immediate");
    setScheduledTime(""); setRecipients([]);
  };

  const modalClass = isMaximized
    ? "fixed inset-4 sm:inset-8 max-w-5xl mx-auto rounded-2xl"
    : isMinimized
    ? "fixed bottom-0 right-4 sm:right-8 w-[280px] sm:w-[320px] h-[40px] rounded-t-xl"
    : "fixed bottom-0 right-4 sm:right-8 w-[580px] max-w-[96vw] h-[640px] sm:h-[660px] max-h-[92vh] rounded-t-2xl";

  return (
    <>
      {isMaximized && <div onClick={() => setIsMaximized(false)} className="fixed inset-0 bg-black/40 z-40 transition-opacity" />}
      <div className={`bg-white dark:bg-[#151619] border border-neutral-300 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 z-50 ${modalClass}`}>
        <div className="shrink-0">
          <GmailComposeHeader
            title={title.trim() ? title : "Thư mới"}
            onClose={onClose}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized((prev) => !prev)}
            isMaximized={isMaximized}
            onToggleMaximize={() => { setIsMaximized((prev) => !prev); setIsMinimized(false); }}
          />
        </div>
        {!isMinimized && (
          <GmailComposeCard
            className="w-full flex-1 min-h-0 flex flex-col bg-white dark:bg-[#151619] border-0 rounded-none shadow-none overflow-hidden"
            category={category} setCategory={setCategory}
            scheduleOption={scheduleOption} setScheduleOption={setScheduleOption}
            scheduledTime={scheduledTime} setScheduledTime={setScheduledTime}
            title={title} setTitle={setTitle} content={content} setContent={setContent}
            url={url} setUrl={setUrl} onSubmit={handleSend} onReset={handleReset}
            recipients={recipients} onAddRecipient={handleAddRecipient}
            onRemoveRecipient={handleRemoveRecipient} availableUsers={availableUsers}
          />
        )}
      </div>
    </>
  );
}
