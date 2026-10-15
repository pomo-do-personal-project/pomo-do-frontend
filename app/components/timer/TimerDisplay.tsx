"use client";

import React from "react";
import { StopwatchDial } from "../StopwatchDial";
import { TimerType, FocusMode } from "./types";

interface TimerDisplayProps {
  timerType: TimerType;
  focusMode: FocusMode;
  seconds: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  isRunning: boolean;
  formatTime: (totalSeconds: number) => string;
}

export function TimerDisplay({
  timerType,
  focusMode,
  seconds,
  isOvertime,
  overtimeSeconds,
  isRunning,
  formatTime,
}: TimerDisplayProps) {
  const isFocus = focusMode === "W";
  const dialLabel = isOvertime
    ? "OVERTIME"
    : isRunning
    ? isFocus
      ? "FOCUSING..."
      : "RESTING..."
    : isFocus
    ? "FOCUS TIME"
    : "BREAK TIME";

  return (
    <div
      className={`w-full py-0 sm:py-1 px-4 bg-transparent dark:bg-transparent border border-transparent rounded-3xl flex flex-col items-center justify-center mb-2 sm:mb-3 relative transition-colors ${
        isOvertime
          ? "border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20 shadow-rose-500/10"
          : ""
      }`}
    >
      {/* Overtime Pulsing Indicator */}
      {isOvertime && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Đang tính Overtime: +{formatTime(overtimeSeconds)}</span>
        </div>
      )}

      {timerType === "stopwatch" ? (
        <StopwatchDial
          seconds={seconds}
          isOvertime={isOvertime}
          overtimeSeconds={overtimeSeconds}
          label={dialLabel}
        />
      ) : (
        <span
          className={`font-mono text-7xl sm:text-8xl font-light tracking-tighter select-none ${
            isOvertime
              ? "text-rose-600 dark:text-rose-400 font-normal"
              : "text-neutral-900 dark:text-white"
          }`}
        >
          {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(seconds)}
        </span>
      )}
    </div>
  );
}
