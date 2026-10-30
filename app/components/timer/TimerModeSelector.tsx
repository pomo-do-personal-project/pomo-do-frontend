"use client";

import React from "react";
import { Timer, Coffee, Zap } from "lucide-react";
import { TimerType, FocusMode, ModeDurationInfo } from "./types";
import { useSettingsStore } from "../../stores/useSettingsStore";

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
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const isStopwatch = timerType === "stopwatch";
  const isFocus = !isStopwatch && focusMode === "W";
  const isBreak = !isStopwatch && focusMode !== "W";
  const breakMinutes = focusMode === "LB" ? modeDurations.LB.minutes : modeDurations.SB.minutes;

  const disabledTitle = "Đang có phiên chạy - vui lòng tạm dừng hoặc hoàn thành trước khi chuyển chế độ";

  return (
    <div
      className={`flex items-center justify-center w-full max-w-md mb-2 transition-all duration-300 ${
        isRunning ? "opacity-90" : "opacity-100"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 p-1 rounded-2xl transition-all duration-200 ${
          wallpaperUrl
            ? "bg-black/25 backdrop-blur-md border border-white/15 shadow-sm"
            : "bg-neutral-200/70 border border-neutral-300/60 shadow-xs"
        }`}
      >
        {/* Tab 1: Focus */}
        <button
          type="button"
          onClick={() => !isRunning && onSelectTab("focus")}
          disabled={isRunning && !isFocus}
          title={isRunning && !isFocus ? disabledTitle : isFocus ? "Đang ở chế độ Focus" : "Chuyển sang Focus"}
          aria-disabled={isRunning && !isFocus}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            isFocus
              ? "bg-white text-neutral-900 shadow-sm cursor-default"
              : isRunning
              ? "opacity-35 cursor-not-allowed text-neutral-400"
              : wallpaperUrl
              ? "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <Timer
            size={13}
            className={
              isFocus
                ? "text-rose-500"
                : wallpaperUrl
                ? "text-white/60"
                : "text-neutral-400"
            }
          />
          <span>Focus ({modeDurations.W.minutes}m)</span>
          {isRunning && isFocus && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-0.5" />
          )}
        </button>

        {/* Tab 2: Break */}
        <button
          type="button"
          onClick={() => !isRunning && onSelectTab("break")}
          disabled={isRunning && !isBreak}
          title={isRunning && !isBreak ? disabledTitle : isBreak ? "Đang ở chế độ Break" : "Chuyển sang Break"}
          aria-disabled={isRunning && !isBreak}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            isBreak
              ? "bg-white text-neutral-900 shadow-sm cursor-default"
              : isRunning
              ? "opacity-35 cursor-not-allowed text-neutral-400"
              : wallpaperUrl
              ? "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <Coffee
            size={13}
            className={
              isBreak
                ? "text-teal-600"
                : wallpaperUrl
                ? "text-white/60"
                : "text-neutral-400"
            }
          />
          <span>Break ({breakMinutes}m)</span>
          {isRunning && isBreak && (
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse ml-0.5" />
          )}
        </button>

        {/* Dấu phân cách */}
        <div
          className={`w-px h-4 mx-0.5 ${
            wallpaperUrl ? "bg-white/20" : "bg-neutral-300"
          }`}
        />

        {/* Tab 3: Stopwatch */}
        <button
          type="button"
          onClick={() => !isRunning && onSelectTab("stopwatch")}
          disabled={isRunning && !isStopwatch}
          title={
            isRunning && !isStopwatch
              ? disabledTitle
              : isStopwatch
              ? "Đang ở chế độ Stopwatch"
              : "Chuyển sang Stopwatch"
          }
          aria-disabled={isRunning && !isStopwatch}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            isStopwatch
              ? "bg-white text-neutral-900 shadow-sm cursor-default"
              : isRunning
              ? "opacity-35 cursor-not-allowed text-neutral-400"
              : wallpaperUrl
              ? "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50 cursor-pointer"
          }`}
        >
          <Zap
            size={13}
            className={
              isStopwatch
                ? "text-amber-500"
                : wallpaperUrl
                ? "text-white/60"
                : "text-neutral-400"
            }
          />
          <span>Stopwatch</span>
          {isRunning && isStopwatch && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
