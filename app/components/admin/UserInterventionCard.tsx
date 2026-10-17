"use client";

import React, { useState } from "react";
import { AlertTriangle, UserCheck, UserX } from "lucide-react";
import { AdminUserSummary } from "../../types/admin";

interface UserInterventionCardProps {
  user: AdminUserSummary;
  isSelf: boolean;
  isSubmitting: boolean;
  onUpdateStatus: (isSuspended: boolean, reason?: string) => Promise<void>;
}

export function UserInterventionCard({
  user,
  isSelf,
  isSubmitting,
  onUpdateStatus,
}: UserInterventionCardProps) {
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirmSuspend = async () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản.");
      return;
    }
    await onUpdateStatus(true, reason.trim());
    setShowReasonBox(false);
    setReason("");
  };

  const handleConfirmUnsuspend = async () => {
    await onUpdateStatus(false);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa có";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#151619] shadow-xs space-y-5">
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
        Trạng thái & Can thiệp bảo mật
      </h3>

      {user.isSuspended ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle size={16} />
            <span>Tài khoản đang bị tạm khóa hoạt động</span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300">
            Lý do: <span className="font-semibold">{user.suspendedReason || "Vi phạm chính sách sử dụng"}</span>
          </p>
          {user.suspendedAt && (
            <p className="text-[11px] text-neutral-400">Thời điểm khóa: {formatDate(user.suspendedAt)}</p>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Tài khoản hoạt động bình thường, không có ghi nhận vi phạm hay cảnh báo bảo mật.</span>
        </div>
      )}

      {/* Reason Box when suspending */}
      {showReasonBox && !user.isSuspended && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#1C1D21] space-y-3">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Nhập lý do khóa tài khoản:
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ghi rõ lý do khóa (ví dụ: Spam, hành vi bất thường, yêu cầu người dùng...)"
            className="w-full p-3 bg-white dark:bg-[#151619] border-0 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
          />
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowReasonBox(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirmSuspend}
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận khóa tài khoản"}
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!showReasonBox && (
        <div className="pt-2 flex justify-end">
          {isSelf ? (
            <p className="text-xs text-neutral-400 italic">
              Bạn không thể tự can thiệp khóa tài khoản quản trị của chính mình.
            </p>
          ) : user.isSuspended ? (
            <button
              type="button"
              onClick={handleConfirmUnsuspend}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0e3b2e] hover:bg-[#134e4a] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <UserCheck size={16} className="text-emerald-400" />
              <span>{isSubmitting ? "Đang mở..." : "MỞ KHÓA TÀI KHOẢN"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowReasonBox(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer"
            >
              <UserX size={15} />
              <span>Khóa tài khoản này</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
