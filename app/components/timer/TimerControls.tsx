"use client";

import React from "react";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";

interface TimerControlsProps {
  isRunning: boolean;
  isOvertime: boolean;
  elapsedSeconds: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onManualComplete: () => void;
}

export function TimerControls({
  isRunning,
  isOvertime,
  elapsedSeconds,
  onTogglePlay,
  onReset,
  onManualComplete,
}: TimerControlsProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);

  return (
    <div className="flex items-center gap-6">
      {/* Reset / Cancel Button */}
      <button
        type="button"
        onClick={onReset}
        title="Reset Timer / Hủy phiên"
        aria-label="Đặt lại bộ đếm hoặc hủy phiên"
        className={`w-12 h-12 rounded-2xl hover:rotate-[-45deg] transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
          wallpaperUrl
            ? "text-white/80 hover:text-white bg-black/25 hover:bg-black/40 backdrop-blur-md border border-white/15 shadow-sm"
            : "text-neutral-700 hover:text-neutral-900 bg-neutral-200/80 hover:bg-neutral-300/80 border border-neutral-300/60 shadow-xs"
        }`}
      >
        <RotateCcw size={20} strokeWidth={1.75} />
      </button>

      {/* Main Play / Pause Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isRunning ? "Tạm dừng" : "Bắt đầu"}
        className={`w-20 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-black/20 ${
          isOvertime
            ? "bg-rose-600 hover:bg-rose-700"
            : "hover:brightness-110"
        }`}
        style={{
          backgroundColor: isOvertime ? undefined : "var(--accent-primary, #e26a45)",
        }}
      >
        {isRunning ? (
          <Pause size={22} strokeWidth={2} className="text-white" />
        ) : (
          <Play size={22} strokeWidth={2} className="translate-x-0.5 fill-white text-white" />
        )}
      </button>

      {/* Checkmark Complete Session Button */}
      {(isRunning || isOvertime || elapsedSeconds > 0) && (
        <button
          type="button"
          onClick={onManualComplete}
          title={
            isOvertime
              ? "Dừng & Lưu thời gian Overtime vào Backend"
              : "Hoàn thành & Lưu phiên vào Backend"
          }
          aria-label="Hoàn thành và lưu phiên làm việc"
          className={`w-12 h-12 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
            isOvertime
              ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-md scale-105 animate-bounce"
              : wallpaperUrl
              ? "bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/40 backdrop-blur-md"
              : "bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-300 shadow-xs"
          }`}
        >
          <Check size={22} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}

