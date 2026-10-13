"use client";

import React from "react";
import { Timer, AlertTriangle, Play } from "lucide-react";

interface NotificationTickingCardProps {
  tickingEnabled: boolean;
  tickingVolume: number;
  overtimeAlertEnabled: boolean;
  soundVolume: number;
  onToggleTicking: (enabled: boolean) => void;
  onTickingVolumeChange: (volume: number) => void;
  onToggleOvertimeAlert: (enabled: boolean) => void;
  onPlayTickSound: (volume: number) => void;
  onPlayOvertimeAlert: (volume: number) => void;
}

export function NotificationTickingCard({
  tickingEnabled,
  tickingVolume,
  overtimeAlertEnabled,
  soundVolume,
  onToggleTicking,
  onTickingVolumeChange,
  onToggleOvertimeAlert,
  onPlayTickSound,
  onPlayOvertimeAlert,
}: NotificationTickingCardProps) {
  return (
    <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
      {/* Ticking sound */}
      <div className="flex flex-col gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Timer size={16} className="text-neutral-500 dark:text-neutral-300" />
              <span>Tiếng tích tắc đồng hồ (Ticking Sound)</span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Phát nhịp tích tắc khe khẽ trong lúc đếm ngược để duy trì nhịp tập trung sâu
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tickingEnabled}
              onChange={(e) => onToggleTicking(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {tickingEnabled && (
          <div className="pt-2 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
                Âm lượng tích tắc:
              </span>
              <input
                type="range"
                min="10"
                max="100"
                value={tickingVolume}
                onChange={(e) => onTickingVolumeChange(Number(e.target.value))}
                onMouseUp={() => onPlayTickSound(tickingVolume)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-white"
              />
              <span className="font-mono text-xs text-neutral-900 dark:text-white shrink-0 font-bold">
                {tickingVolume}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => onPlayTickSound(tickingVolume)}
              className="px-2.5 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-neutral-200 dark:border-transparent"
            >
              <Play size={11} fill="currentColor" />
              <span>Nghe thử nhịp</span>
            </button>
          </div>
        )}
      </div>

      {/* Cảnh báo Overtime */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
            <span>Cảnh báo quá giờ (+OT Alert)</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Phát âm báo nhắc nhở khi đồng hồ bắt đầu đếm Overtime để bạn không làm quá sức
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPlayOvertimeAlert(soundVolume)}
            className="px-2.5 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200 dark:border-transparent"
          >
            <Play size={11} fill="currentColor" />
            <span>Nghe thử</span>
          </button>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={overtimeAlertEnabled}
              onChange={(e) => onToggleOvertimeAlert(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
