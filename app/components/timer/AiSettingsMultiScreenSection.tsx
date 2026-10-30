"use client";

import React from "react";
import { Monitor, RotateCcw, Plus } from "lucide-react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";

interface AiSettingsMultiScreenSectionProps {
  screenCountdown: number | null;
  onStartAddScreen: () => void;
}

export function AiSettingsMultiScreenSection({
  screenCountdown,
  onStartAddScreen,
}: AiSettingsMultiScreenSectionProps) {
  const { isConnected, totalScreens, resetScreens } = useAiFocusStore();

  return (
    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={15} className="text-emerald-500" />
          <span className="text-xs font-bold text-neutral-900 dark:text-white">
            Vùng làm việc (Đã lưu: {totalScreens} màn hình)
          </span>
        </div>
        <button
          type="button"
          onClick={resetScreens}
          disabled={!isConnected || totalScreens === 0}
          className="text-[11px] text-neutral-500 hover:text-rose-500 flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
        >
          <RotateCcw size={12} />
          <span>Đặt lại</span>
        </button>
      </div>

      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
        Bạn có thể dùng nhiều màn hình hoặc vừa nhìn laptop vừa đọc tài liệu trên bàn. Hãy nhìn vào góc làm việc đó và bấm nút thêm.
      </p>

      <button
        type="button"
        disabled={!isConnected || screenCountdown !== null}
        onClick={onStartAddScreen}
        className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
      >
        <Plus size={14} strokeWidth={2.5} />
        <span>{screenCountdown !== null ? `Nhìn vào màn hình mới (${screenCountdown}s)...` : "+ Thêm màn hình hiện tại (3s)"}</span>
      </button>
    </div>
  );
}

