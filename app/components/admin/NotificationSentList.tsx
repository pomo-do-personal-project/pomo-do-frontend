"use client";

import React from "react";
import { SystemBroadcast } from "../../types/admin";

export interface SentNotificationItem {
  id: string;
  title: string;
  content: string;
  category: "info" | "warning" | "maintenance";
  scope: "broadcast" | "direct";
  targetText: string;
  sentAt: string;
  isActive?: boolean;
}

interface NotificationSentListProps {
  activeBroadcast: SystemBroadcast | null;
  sentItems: SentNotificationItem[];
  onDeactivateActive: () => void;
  onViewItem: (item: SentNotificationItem) => void;
  isDeactivating?: boolean;
  searchQuery?: string;
}

export function NotificationSentList({
  activeBroadcast,
  sentItems,
  onDeactivateActive,
  onViewItem,
  isDeactivating = false,
  searchQuery = "",
}: NotificationSentListProps) {
  const filtered = sentItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.targetText.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      {/* 1. Active Broadcast Banner */}
      {activeBroadcast?.isActive && (
        <div
          onClick={() =>
            onViewItem({
              id: "broadcast-active",
              title: activeBroadcast.message.split(" - ")[0] || "Thông báo hệ thống",
              content: activeBroadcast.message,
              category: activeBroadcast.type || "info",
              scope: "broadcast",
              targetText: "Toàn bộ người dùng",
              sentAt: "Đang phát trực tiếp",
              isActive: true,
            })
          }
          className="p-3.5 px-5 rounded-2xl bg-neutral-100 dark:bg-[#1C1D21] flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors"
          title="Nhấn để xem nội dung thông báo đang phát"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0e3b2e] text-white shrink-0">
              Đang phát
            </span>
            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {activeBroadcast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeactivateActive();
            }}
            disabled={isDeactivating}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            Gỡ ghim
          </button>
        </div>
      )}

      {/* 2. Sent Notifications Table */}
      <div className="bg-white dark:bg-[#151619] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
                <th className="py-3.5 px-5">Thời gian</th>
                <th className="py-3.5 px-4">Tiêu đề & Nội dung</th>
                <th className="py-3.5 px-4">Người nhận</th>
                <th className="py-3.5 px-5 text-right">Hình thức</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40 text-neutral-900 dark:text-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-400">
                    Chưa có thông báo nào được gửi.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onViewItem(item)}
                    className="hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer select-none"
                    title="Nhấn để xem chi tiết email đã gửi"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-5 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {item.sentAt}
                    </td>

                    {/* Title & Preview */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-neutral-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {item.content}
                      </p>
                    </td>

                    {/* Recipient */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                      {item.targetText}
                    </td>

                    {/* Scope Badge */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {item.scope === "broadcast" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Phát sóng App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Hộp thư Gmail
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
