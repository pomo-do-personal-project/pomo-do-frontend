"use client";

import React from "react";
import { Palette, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { ThemePalette } from "../../../types/theme";

interface PaletteStatsBarProps {
  palettes: ThemePalette[];
}

export function PaletteStatsBar({ palettes }: PaletteStatsBarProps) {
  const total = palettes.length;
  const activeCount = palettes.filter((p) => p.isActive !== false).length;
  const customCount = palettes.filter((p) => p.isCustom).length;
  const systemCount = total - customCount;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Palette size={20} />
        </div>
        <div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
            {total}
          </div>
          <div className="text-[11px] font-medium text-neutral-500 mt-1">
            Tổng Color Series
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
            {activeCount}
          </div>
          <div className="text-[11px] font-medium text-neutral-500 mt-1">
            Đang hoạt động (Khả dụng)
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
            {customCount}
          </div>
          <div className="text-[11px] font-medium text-neutral-500 mt-1">
            Bảng màu Tự tạo (Admin)
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Layers size={20} />
        </div>
        <div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
            {systemCount}
          </div>
          <div className="text-[11px] font-medium text-neutral-500 mt-1">
            Mẫu chuẩn TickTick
          </div>
        </div>
      </div>
    </div>
  );
}
