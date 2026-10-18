"use client";

import React from "react";
import { Timer, CheckSquare, Grid2X2, Flame, BarChart3 } from "lucide-react";
import { ScreenId } from "../types";

interface PreviewScreenSwitcherProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId, stepIdx: number) => void;
}

export const PreviewScreenSwitcher = React.memo(function PreviewScreenSwitcher({
  activeScreen,
  onSelectScreen,
}: PreviewScreenSwitcherProps) {
  return (
    <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/90 shadow-2xs">
      <button
        type="button"
        onClick={() => onSelectScreen("timer", 0)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeScreen === "timer"
            ? "bg-neutral-900 text-white shadow-xs"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        <Timer size={14} className={activeScreen === "timer" ? "text-rose-400" : ""} />
        <span>1. Đồng hồ Pomodoro & AI</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectScreen("task", 6)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeScreen === "task"
            ? "bg-neutral-900 text-white shadow-xs"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        <CheckSquare size={14} className={activeScreen === "task" ? "text-emerald-400" : ""} />
        <span>2. Nhiệm vụ Today</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectScreen("matrix", 10)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeScreen === "matrix"
            ? "bg-neutral-900 text-white shadow-xs"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        <Grid2X2 size={14} className={activeScreen === "matrix" ? "text-blue-400" : ""} />
        <span>3. Ma trận Eisenhower</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectScreen("stat-focus", 14)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeScreen === "stat-focus"
            ? "bg-neutral-900 text-white shadow-xs"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        <Flame size={14} className={activeScreen === "stat-focus" ? "text-amber-400" : ""} />
        <span>4. Thống kê Focus & Heatmap</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectScreen("stat-task", 18)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeScreen === "stat-task"
            ? "bg-neutral-900 text-white shadow-xs"
            : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        <BarChart3 size={14} className={activeScreen === "stat-task" ? "text-purple-400" : ""} />
        <span>5. Thống kê Task & Ma trận</span>
      </button>
    </div>
  );
});
