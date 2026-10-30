"use client";

import React, { useState } from "react";
import { Trash2, CalendarClock } from "lucide-react";
import { NotificationTemplate } from "./notificationTemplates";
import { ConfirmModal } from "../ui/ConfirmModal";

interface NotificationTemplatesListProps {
  templates: NotificationTemplate[];
  onUseTemplate: (tpl: NotificationTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
  searchQuery?: string;
}

export function NotificationTemplatesList({
  templates,
  onUseTemplate,
  onDeleteTemplate,
  searchQuery = "",
}: NotificationTemplatesListProps) {
  const [templateToDelete, setTemplateToDelete] = useState<NotificationTemplate | null>(null);
  const filtered = templates.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.scheduleTime.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white dark:bg-[#151619] rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
              <th className="py-3.5 px-5">Tiêu đề thông báo</th>
              <th className="py-3.5 px-4">Mô tả & Nội dung</th>
              <th className="py-3.5 px-4">Thời gian gửi tự động</th>
              <th className="py-3.5 px-4 text-center">Phạm vi</th>
              <th className="py-3.5 px-5 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40 text-neutral-900 dark:text-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-400">
                  Chưa có thông báo cài sẵn nào. Nhấn "Soạn thông báo" để tạo mới.
                </td>
              </tr>
            ) : (
              filtered.map((tpl) => (
                <tr
                  key={tpl.id}
                  onClick={() => onUseTemplate(tpl)}
                  className="hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer select-none group"
                  title="Nhấn để xem hoặc điều chỉnh thông báo này"
                >
                  {/* Title */}
                  <td className="py-3.5 px-5 font-semibold text-neutral-900 dark:text-white max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate" title={tpl.title}>{tpl.title}</span>
                      {tpl.isAutomated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                          Tự động
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Description & Preview */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="text-neutral-600 dark:text-neutral-300 line-clamp-1 mb-0.5">
                      {tpl.content}
                    </p>
                    <span className="text-[11px] text-neutral-400">
                      {tpl.description}
                    </span>
                  </td>

                  {/* Schedule Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-neutral-700 dark:text-neutral-300 font-medium">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#1C1D21] border border-neutral-200/60 dark:border-neutral-800 text-[11px]">
                      <CalendarClock size={12} className="text-amber-500" />
                      <span>{tpl.scheduleTime}</span>
                    </span>
                  </td>

                  {/* Scope */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                    {tpl.scope === "broadcast" ? "Toàn bộ web" : "Cá nhân / Nhóm"}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    {onDeleteTemplate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateToDelete(tpl);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Xóa lịch gửi tự động này"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!templateToDelete}
        title="Xóa lịch gửi thông báo"
        message={`Bạn có chắc muốn xóa lịch gửi "${templateToDelete?.title}"? Lịch gửi tự động này sẽ không còn được thực thi.`}
        confirmText="Xóa lịch gửi"
        cancelText="Giữ lại"
        danger={true}
        onConfirm={() => {
          if (templateToDelete && onDeleteTemplate) {
            onDeleteTemplate(templateToDelete.id);
            setTemplateToDelete(null);
          }
        }}
        onCancel={() => setTemplateToDelete(null)}
      />
    </div>
  );
}
