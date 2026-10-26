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
          onClick={() => onSelectTab("focus")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            isFocus
              ? "bg-white text-neutral-900 shadow-sm"
              : wallpaperUrl
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
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
        </button>

        {/* Tab 2: Break */}
        <button
          type="button"
          onClick={() => onSelectTab("break")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            !isFocus
              ? "bg-white text-neutral-900 shadow-sm"
              : wallpaperUrl
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
          }`}
        >
          <Coffee
            size={13}
            className={
              !isFocus
                ? "text-teal-600"
                : wallpaperUrl
                ? "text-white/60"
                : "text-neutral-400"
            }
          />
          <span>Break ({modeDurations.SB.minutes}m)</span>
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
          onClick={() => onSelectTab("stopwatch")}
          title={isStopwatch ? "Đang bật Stopwatch" : "Bật chế độ Stopwatch"}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            isStopwatch
              ? "bg-white text-neutral-900 shadow-sm"
              : wallpaperUrl
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
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
        </button>
      </div>
    </div>
  );
}
