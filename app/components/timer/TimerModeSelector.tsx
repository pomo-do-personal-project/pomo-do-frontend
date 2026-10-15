"use client";

import React from "react";
import { Timer, Coffee, Zap } from "lucide-react";
import { TimerType, FocusMode, ModeDurationInfo } from "./types";

interface TimerModeSelectorProps {
  timerType: TimerType;
  focusMode: FocusMode;
  modeDurations: Record<FocusMode, ModeDurationInfo>;
  onSelectTab: (tab: "focus" | "break" | "stopwatch") => void;
  isRunning?: boolean;
}

export function TimerModeSelector({
  timerType,
  focusMode,
  modeDurations,
  onSelectTab,
  isRunning = false,
}: TimerModeSelectorProps) {
  const isFocus = focusMode === "W";
  const isStopwatch = timerType === "stopwatch";

  return (
    <div
      className={`flex items-center justify-center w-full max-w-md mb-2 transition-all duration-300 ${
        isRunning
          ? "opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
          : "opacity-100 translate-y-0"
      }`}
    >
      <div className="flex items-center gap-1.5 p-1 bg-transparent dark:bg-transparent rounded-2xl">
        {/* Tab 1: Focus */}
        <button
          type="button"
          onClick={() => onSelectTab("focus")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            isFocus
              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
          }`}
        >
          <Timer
            size={13}
            className={isFocus ? "text-rose-500" : "text-neutral-400"}
          />
          <span>Focus ({modeDurations.W.minutes}m)</span>
        </button>

        {/* Tab 2: Break */}
        <button
          type="button"
          onClick={() => onSelectTab("break")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            !isFocus
              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
          }`}
        >
          <Coffee
            size={13}
            className={!isFocus ? "text-teal-500" : "text-neutral-400"}
          />
          <span>Break ({modeDurations.SB.minutes}m)</span>
        </button>

        {/* Dấu phân cách tinh tế */}
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

        {/* Tab 3: Stopwatch (Toggle bật/tắt đĩa quay) */}
        <button
          type="button"
          onClick={() => onSelectTab("stopwatch")}
          title={isStopwatch ? "Đang bật Stopwatch (Bấm để quay về Pomo số)" : "Bật chế độ Stopwatch"}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            isStopwatch
              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
          }`}
        >
          <Zap
            size={13}
            className={isStopwatch ? "text-amber-500" : "text-neutral-400"}
          />
          <span>Stopwatch</span>
        </button>
      </div>
    </div>
  );
}
