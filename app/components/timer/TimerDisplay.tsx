"use client";

import React from "react";
import { StopwatchDial } from "../StopwatchDial";
import { TimerType } from "./types";

interface TimerDisplayProps {
  timerType: TimerType;
  seconds: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  isRunning: boolean;
  formatTime: (totalSeconds: number) => string;
}

export function TimerDisplay({
  timerType,
  seconds,
  isOvertime,
  overtimeSeconds,
  isRunning,
  formatTime,
}: TimerDisplayProps) {
  return (
    <div
      className={`w-full py-6 sm:py-8 px-6 bg-white/60 dark:bg-neutral-800/40 backdrop-blur-sm border rounded-3xl shadow-sm flex flex-col items-center justify-center mb-8 relative transition-colors ${
        isOvertime
          ? "border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20 shadow-rose-500/10"
          : "border-neutral-200/80 dark:border-neutral-800"
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
          label={isOvertime ? "OVERTIME" : isRunning ? "FOCUSING..." : "FOCUS TIME"}
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
