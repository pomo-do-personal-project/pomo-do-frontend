"use client";

import React from "react";
import { Timer, Coffee } from "lucide-react";
import { TimerType, FocusMode, ModeDurationInfo } from "./types";

interface TimerModeSelectorProps {
  timerType: TimerType;
  focusMode: FocusMode;
  modeDurations: Record<FocusMode, ModeDurationInfo>;
  onSelectTimerType: (type: TimerType) => void;
  onSelectFocusMode: (mode: FocusMode) => void;
}

export function TimerModeSelector({
  timerType,
  focusMode,
  modeDurations,
  onSelectTimerType,
  onSelectFocusMode,
}: TimerModeSelectorProps) {
  const isFocus = focusMode === "W";

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mb-6">
      {/* 1. Timer Type Selector (Pomo vs Stopwatch) */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs">
        <button
          type="button"
          onClick={() => onSelectTimerType("pomo")}
          className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            timerType === "pomo"
              ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Pomo
        </button>
        <button
          type="button"
          onClick={() => onSelectTimerType("stopwatch")}
          className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            timerType === "stopwatch"
              ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Stopwatch
        </button>
      </div>

      {/* 2. Direct Focus / Break Segmented Switch (chỉ hiện khi ở chế độ Pomo) */}
      {timerType === "pomo" && (
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs animate-in fade-in duration-150">
          <button
            type="button"
            onClick={() => onSelectFocusMode("W")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isFocus
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Timer
              size={13}
              className={isFocus ? "text-rose-500" : "text-neutral-400"}
            />
            <span>Focus ({modeDurations.W.minutes}m)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectFocusMode("SB")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              !isFocus
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Coffee
              size={13}
              className={!isFocus ? "text-teal-500" : "text-neutral-400"}
            />
            <span>Break ({modeDurations.SB.minutes}m)</span>
          </button>
        </div>
      )}
    </div>
  );
}
