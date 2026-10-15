"use client";

import React from "react";
import { Monitor, RotateCcw, Plus } from "lucide-react";

interface AiFocusControlsProps {
  isConnected: boolean;
  countdown: number | null;
  totalScreens: number;
  distractionCount?: number;
  onAddScreen: () => void;
  onReset: () => void;
}

export function AiFocusControls({
  isConnected,
  countdown,
  totalScreens,
  distractionCount = 0,
  onAddScreen,
  onReset,
}: AiFocusControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1">
          <Monitor size={13} />
          <span>
            Đã lưu: <strong>{totalScreens}</strong> màn hình
          </span>
        </span>
        {distractionCount > 0 && (
          <span className="text-rose-500 font-semibold">
            {distractionCount} lần xao nhãng
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAddScreen}
          disabled={!isConnected || countdown !== null}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            countdown !== null
              ? "bg-amber-500 text-white animate-pulse"
              : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 cursor-pointer"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {countdown !== null ? (
            <span>Đang đếm {countdown}s...</span>
          ) : (
            <>
              <Plus size={13} strokeWidth={2.5} />
              <span>+ Thêm màn hình này</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!isConnected || countdown !== null}
          title="Đặt lại màn hình"
          className="py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
