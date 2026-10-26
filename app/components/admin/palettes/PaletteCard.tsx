"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Wand2,
  Sparkles,
} from "lucide-react";
import { ThemePalette } from "../../../types/theme";
import { applyThemePalette } from "../../../lib/themeManager";

interface PaletteCardProps {
  palette: ThemePalette;
  onEdit: (palette: ThemePalette) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onNotice?: (msg: string) => void;
}

export function PaletteCard({
  palette,
  onEdit,
  onToggleActive,
  onDelete,
  onNotice,
}: PaletteCardProps) {
  const isActive = palette.isActive !== false;
  const isCustom = Boolean(palette.isCustom);

  const handleApplyNow = () => {
    applyThemePalette(palette);
    onNotice?.(`Đã áp dụng thử bảng màu "${palette.nameVi || palette.name}"!`);
  };

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs group ${
        isActive
          ? "bg-white dark:bg-[#121316] border-neutral-200/80 dark:border-neutral-800 hover:shadow-md"
          : "bg-neutral-50/70 dark:bg-neutral-900/40 border-dashed border-neutral-300 dark:border-neutral-800 opacity-75"
      }`}
    >
      <div className="p-5 flex flex-col gap-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-full shrink-0 shadow-xs ring-2 ring-white dark:ring-neutral-900"
              style={{ backgroundColor: palette.swatchColor }}
            />
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                {palette.nameVi || palette.name}
              </h3>
              {palette.nameEn && palette.nameEn !== palette.nameVi && (
                <span className="text-[11px] text-neutral-400 font-medium">
                  {palette.nameEn}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isCustom && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Sparkles size={10} />
                <span>Custom</span>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-neutral-500/15 text-neutral-500 border border-neutral-500/20"
              }`}
            >
              {isActive ? "Khả dụng" : "Đã ẩn"}
            </span>
          </div>
        </div>

        {/* Live Miniature Mockup */}
        <div
          className="w-full h-24 rounded-2xl p-2.5 flex gap-2 border select-none transition-transform group-hover:scale-[1.01]"
          style={{
            backgroundColor: palette.colors.canvasBg,
            borderColor: palette.colors.borderSubtle,
          }}
        >
          {/* Mini Sidebar */}
          <div
            className="w-7 h-full rounded-xl flex flex-col items-center justify-between py-1.5 shadow-xs shrink-0"
            style={{ backgroundColor: palette.colors.surfaceBg }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
            <div className="flex flex-col gap-1 items-center">
              <span className="w-3.5 h-1 rounded-full bg-white/40" />
              <span className="w-3.5 h-1 rounded-full bg-white/40" />
            </div>
            <span className="w-3 h-3 rounded-md bg-white/20" />
          </div>

          {/* Mini Workspace Content */}
          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div
              className="rounded-xl p-2 border flex items-center justify-between shadow-2xs"
              style={{
                backgroundColor: palette.colors.surfaceElevated,
                borderColor: palette.colors.borderSubtle,
              }}
            >
              <div className="space-y-1">
                <div
                  className="w-16 h-1.5 rounded-full"
                  style={{ backgroundColor: palette.colors.textHighlight }}
                />
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ backgroundColor: palette.colors.textMuted }}
                />
              </div>
              <span
                className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-xs"
                style={{ backgroundColor: palette.colors.accentPrimary }}
              >
                25:00
              </span>
            </div>

            {/* Color Strip Bar */}
            <div className="flex items-center gap-1.5 px-1">
              {[
                { name: "Sidebar", hex: palette.colors.surfaceBg },
                { name: "Nền Canvas", hex: palette.colors.canvasBg },
                { name: "Thẻ Card", hex: palette.colors.surfaceElevated },
                { name: "Điểm nhấn", hex: palette.colors.accentPrimary },
                { name: "Đường viền", hex: palette.colors.borderSubtle },
              ].map((sw, i) => (
                <div
                  key={i}
                  title={`${sw.name}: ${sw.hex}`}
                  className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shrink-0"
                  style={{ backgroundColor: sw.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleApplyNow}
          className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold cursor-pointer transition-colors"
          title="Áp dụng thử bảng màu này lên trang"
        >
          <Wand2 size={13} />
          <span>Thử màu</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleActive(palette.id)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isActive
                ? "text-neutral-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                : "text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            }`}
            title={isActive ? "Tạm ẩn với người dùng" : "Bật hiển thị cho người dùng"}
          >
            {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          <button
            type="button"
            onClick={() => onEdit(palette)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition-colors"
            title="Chỉnh sửa thông số bảng màu"
          >
            <Pencil size={14} />
          </button>

          {isCustom && (
            <button
              type="button"
              onClick={() => onDelete(palette.id)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
              title="Xóa bảng màu này"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
