"use client";

import React from "react";
import { ChevronsRight, Timer, Play, Pause } from "lucide-react";

interface MockTopBarProps {
  showMiniTimer?: boolean;
  timerSeconds?: number;
  isTimerRunning?: boolean;
}

export const MockTopBar = React.memo(function MockTopBar({
  showMiniTimer = true,
  timerSeconds = 4 * 60,
  isTimerRunning = true,
}: MockTopBarProps) {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-12 px-5 flex items-center justify-between border-b border-neutral-200/80 bg-white/95 shrink-0 select-none cursor-default">
      <div className="flex items-center gap-3">
        <div
          title="Thu gọn / Mở rộng Sidebar"
          className="p-1.5 rounded-lg text-neutral-400 cursor-default"
        >
          <ChevronsRight size={17} strokeWidth={2} />
        </div>
      </div>

      {showMiniTimer && (
        <div
          title="Đồng hồ Tổng quan"
          className="flex items-center gap-2 px-3 py-1 rounded-xl border border-neutral-200/90 bg-white shadow-2xs select-none cursor-default"
        >
          <span className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-neutral-600">
            <Timer size={13} strokeWidth={2.2} className="text-rose-500" />
            <span>FOCUS:</span>
          </span>
          <span className="font-mono text-xs font-bold text-neutral-900">
            {formatTime(timerSeconds)}
          </span>
          <div className="p-0.5 rounded text-neutral-500">
            {isTimerRunning ? (
              <Pause size={11} strokeWidth={2.5} />
            ) : (
              <Play size={11} strokeWidth={2.5} fill="currentColor" />
            )}
          </div>
        </div>
      )}

      <div className="w-8" />
    </div>
  );
});
