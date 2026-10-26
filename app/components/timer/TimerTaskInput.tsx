"use client";

import React from "react";
import { PenLine, X } from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";

interface TimerTaskInputProps {
  taskName: string;
  onTaskNameChange: (value: string) => void;
  isRunning?: boolean;
}

export function TimerTaskInput({
  taskName,
  onTaskNameChange,
  isRunning = false,
}: TimerTaskInputProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);

  return (
    <div
      className={`w-full max-w-sm mb-5 flex flex-col items-center relative transition-all duration-300 ${
        isRunning && !taskName.trim()
          ? "opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
          : "opacity-100 translate-y-0"
      }`}
    >
      <div className="w-full relative flex items-center justify-center">
        <span
          className={`absolute left-2 pointer-events-none transition-opacity duration-200 ${
            wallpaperUrl ? "text-white/60" : "text-neutral-400"
          } ${isRunning ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
        >
          <PenLine size={15} strokeWidth={1.75} />
        </span>

        <input
          type="text"
          value={taskName}
          onChange={(e) => onTaskNameChange(e.target.value)}
          placeholder=""
          aria-label="Tên nhiệm vụ"
          className={`w-full text-center bg-transparent py-2 px-9 text-base font-medium transition-all duration-200 focus:outline-none ${
            wallpaperUrl
              ? isRunning
                ? "text-white placeholder:text-white/40 border-b border-transparent group-hover:border-white/30"
                : "text-white placeholder:text-white/40 border-b-2 border-white/25 focus:border-white"
              : isRunning
              ? "text-neutral-900 placeholder:text-neutral-400 border-b border-transparent group-hover:border-neutral-300"
              : "text-neutral-900 placeholder:text-neutral-400 border-b-2 border-neutral-300 focus:border-neutral-900"
          }`}
        />

        {taskName && (
          <button
            type="button"
            onClick={() => onTaskNameChange("")}
            className={`absolute right-1 p-1 cursor-pointer transition-opacity duration-200 ${
              wallpaperUrl
                ? "text-white/60 hover:text-white"
                : "text-neutral-400 hover:text-neutral-700"
            } ${isRunning ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
            title="Xóa tên task"
            aria-label="Xóa tên task"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

