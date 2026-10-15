"use client";

import React from "react";
import { PenLine, X } from "lucide-react";

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
          className={`absolute left-2 text-neutral-400 pointer-events-none transition-opacity duration-200 ${
            isRunning ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          <PenLine size={15} strokeWidth={1.75} />
        </span>

        <input
          type="text"
          value={taskName}
          onChange={(e) => onTaskNameChange(e.target.value)}
          placeholder=""
          aria-label="Tên nhiệm vụ"
          className={`w-full text-center bg-transparent py-2 px-9 text-base font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none transition-all duration-200 ${
            isRunning
              ? "border-b border-transparent group-hover:border-neutral-300/80 dark:group-hover:border-neutral-700/80"
              : "border-b-2 border-neutral-300/80 dark:border-neutral-700/80 focus:border-neutral-900 dark:focus:border-white"
          }`}
        />

        {taskName && (
          <button
            type="button"
            onClick={() => onTaskNameChange("")}
            className={`absolute right-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer transition-opacity duration-200 ${
              isRunning ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
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
