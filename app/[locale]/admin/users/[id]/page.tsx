"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Activity, RefreshCw, Check, AlertCircle } from "lucide-react";
import { AdminUserSummary } from "../../../../types/admin";
import { adminService } from "../../../../services/adminService";
import { useTranslation } from "../../../../stores/useLanguageStore";
import { useAuthStore } from "../../../../stores/useAuthStore";
import { UserInterventionCard } from "../../../../components/admin/UserInterventionCard";

export default function AdminUserDetailPage() {
  const params = useParams();
  const { language } = useTranslation();
  const currentAdmin = useAuthStore((s) => s.user);

  const userId = params?.id as string;

  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const data = await adminService.getUserById(userId);
      setUser(data);
    } catch (err: unknown) {
      console.error("Failed to load user detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const isSelf = currentAdmin?.id === user?.id;

  const handleUpdateStatus = async (isSuspended: boolean, reason?: string) => {
    if (!user) return;
    try {
      setIsSubmitting(true);
      await adminService.updateUserStatus(user.id, {
        isSuspended,
        reason: isSuspended ? reason?.trim() : undefined,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              isSuspended,
              suspendedReason: isSuspended ? reason?.trim() || null : null,
              suspendedAt: isSuspended ? new Date().toISOString() : null,
            }
          : prev
      );

      setToast({
        message: isSuspended ? "Đã khóa tài khoản thành công." : "Đã mở khóa tài khoản thành công.",
        type: "success",
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể cập nhật trạng thái người dùng.";
      setToast({ message: msg, type: "error" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa có";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-neutral-400">
        <RefreshCw size={20} className="animate-spin mx-auto mb-3 text-emerald-500" />
        <span>Đang tải thông tin thành viên...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm text-neutral-400">Không tìm thấy thông tin người dùng này.</p>
        <Link
          href={`/${language}/admin/users`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#151619] text-xs font-semibold text-neutral-700 dark:text-neutral-300"
        >
          <ArrowLeft size={14} />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/${language}/admin/users`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Quay lại danh sách Người dùng</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Chi tiết Người dùng
          </h1>
        </div>

        <button
          onClick={loadUser}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#151619] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {toast && (
        <div
          role="alert"
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            toast.type === "error"
              ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 2. Identity Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#151619] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-16 h-16 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xl shrink-0">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : "U"}
              </div>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white">
                {user.displayName || "Chưa đặt tên"}
              </h2>
              <p className="text-xs text-neutral-400">{user.email}</p>
              <p className="text-[11px] font-mono text-neutral-500 mt-1">ID: {user.id}</p>
            </div>
          </div>

          <div>
            {user.isSuspended ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Đang bị khóa</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Đang hoạt động</span>
              </span>
            )}
          </div>
        </div>

        {/* Timestamps & Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#1C1D21] space-y-1">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <Calendar size={15} />
              <span>Thời gian đăng ký tham gia</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#1C1D21] space-y-1">
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <Activity size={15} />
              <span>Phiên làm việc gần nhất</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatDate(user.lastActiveAt)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Status & Intervention Section */}
      <UserInterventionCard
        user={user}
        isSelf={isSelf}
        isSubmitting={isSubmitting}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
