"use client";

import React from "react";
import { AlertTriangle, X, Send } from "lucide-react";

interface NotificationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSending: boolean;
  title: string;
  categoryLabel: string;
  totalUsers: number;
}

export function NotificationConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  title,
  categoryLabel,
  totalUsers,
}: NotificationConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#16171A] rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white">
              Xác Nhận An Toàn
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-neutral-600 dark:text-neutral-300">
            Thông báo này sẽ được phát sóng tới{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {totalUsers > 0 ? totalUsers.toLocaleString() : "tất cả"} thành viên
            </strong>{" "}
            đang hoạt động trong hệ thống.
          </p>

          <div className="p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-[#1F2025] space-y-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Phân loại:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{categoryLabel}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>Tiêu đề:</span>
              <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">
                {title || "Không có tiêu đề"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Hãy kiểm tra kỹ lỗi chính tả và đường dẫn trước khi tiến hành gửi.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            HỦY BỎ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Send size={14} />
            <span>{isSending ? "ĐANG XỬ LÝ..." : "VẪN GỬI NGAY"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
