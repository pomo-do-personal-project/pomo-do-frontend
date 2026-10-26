"use client";

import React from "react";
import { Timer, Play, Pause } from "lucide-react";
import { usePomodoroStore } from "../../stores/usePomodoroStore";
import { useTranslation } from "../../stores/useLanguageStore";

interface MiniTimerWidgetProps {
  onNavigateToDashboard: () => void;
}

export function MiniTimerWidget({ onNavigateToDashboard }: MiniTimerWidgetProps) {
  const { t } = useTranslation();
  const isTimerRunning = usePomodoroStore((s) => s.isRunning);
  const timerSeconds = usePomodoroStore((s) => s.seconds);
  const isOvertime = usePomodoroStore((s) => s.isOvertime);
  const overtimeSeconds = usePomodoroStore((s) => s.overtimeSeconds);
  const timerFocusMode = usePomodoroStore((s) => s.focusMode);
  const timerType = usePomodoroStore((s) => s.timerType);
  const setIsRunning = usePomodoroStore((s) => s.setIsRunning);

  const formatMiniTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={onNavigateToDashboard}
      title={t.nav.dashboard}
      className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs group ${
        isOvertime
          ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
          : isTimerRunning
          ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
          : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      }`}
    >
      <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
        <Timer
          size={14}
          strokeWidth={2}
          className={isTimerRunning ? "text-emerald-500 animate-spin-slow" : "text-neutral-400"}
        />
        <span>
          {timerType === "pomo"
            ? timerFocusMode === "W"
              ? t.timer.focus
              : t.timer.break
            : t.timer.stopwatch}
          :
        </span>
      </span>
      <span className="font-mono text-xs font-semibold">
        {isOvertime ? `+${formatMiniTime(overtimeSeconds)} OT` : formatMiniTime(timerSeconds)}
      </span>
      {isTimerRunning ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRunning(false);
          }}
          title={t.timer.pause}
          aria-label={t.timer.pause}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
        >
          <Pause size={12} strokeWidth={2.5} />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRunning(true);
          }}
          title={t.timer.start}
          aria-label={t.timer.start}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
        >
          <Play size={12} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
