"use client";

import React from "react";
import { Check, Edit2, Trash2 } from "lucide-react";

interface SidebarTagRowProps {
  tag: { id?: string; name: string; colorHex?: string };
  isSelected: boolean;
  wallpaperUrl?: string | null;
  onSelect: (tagName: string) => void;
  onEdit: (tag: { id: string; name: string; colorHex?: string }) => void;
  onDelete: (tag: { id: string; name: string }) => void;
}

export function SidebarTagRow({
  tag,
  isSelected,
  wallpaperUrl,
  onSelect,
  onEdit,
  onDelete,
}: SidebarTagRowProps) {
  const hasId = Boolean(tag.id);

  return (
    <div
      onClick={() => onSelect(tag.name)}
      className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer select-none ${
        isSelected
          ? wallpaperUrl
            ? "bg-white/20 text-white font-semibold backdrop-blur-md ring-1 ring-white/25 shadow-2xs"
            : "bg-white text-neutral-900 font-semibold border border-neutral-200/80 shadow-2xs"
          : wallpaperUrl
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
      }`}
    >
      <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
        <span
          style={{ backgroundColor: tag.colorHex || "#10B981" }}
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
        />
        <span className="truncate">{tag.name}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Nút Sửa & Xóa: hiển thị khi hover hoặc mờ mờ trên touch */}
        {hasId && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (tag.id) onEdit({ id: tag.id, name: tag.name, colorHex: tag.colorHex });
              }}
              title="Chỉnh sửa tên và màu thẻ"
              aria-label={`Chỉnh sửa thẻ ${tag.name}`}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                wallpaperUrl
                  ? "text-white/70 hover:text-white hover:bg-white/20"
                  : "text-neutral-400 hover:text-blue-600 hover:bg-neutral-200"
              }`}
            >
              <Edit2 size={12} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (tag.id) onDelete({ id: tag.id, name: tag.name });
              }}
              title="Xóa thẻ phân loại"
              aria-label={`Xóa thẻ ${tag.name}`}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                wallpaperUrl
                  ? "text-white/70 hover:text-rose-400 hover:bg-rose-500/20"
                  : "text-neutral-400 hover:text-rose-600 hover:bg-neutral-200"
              }`}
            >
              <Trash2 size={12} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Dấu tích chọn */}
        {isSelected && (
          <span
            className="flex items-center justify-center p-0.5 ml-0.5 animate-in zoom-in-75 duration-150"
            title="Đang chọn thẻ này"
          >
            <Check
              size={14}
              strokeWidth={2.5}
              className={wallpaperUrl ? "text-emerald-400" : "text-emerald-600"}
            />
          </span>
        )}
      </div>
    </div>
  );
}

