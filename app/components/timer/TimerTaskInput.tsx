"use client";

import React from "react";
import { PenLine, X } from "lucide-react";

interface TimerTaskInputProps {
  taskName: string;
  onTaskNameChange: (value: string) => void;
}

export function TimerTaskInput({ taskName, onTaskNameChange }: TimerTaskInputProps) {
  return (
    <div className="w-full max-w-sm mb-10 flex flex-col items-center relative">
      <div className="w-full relative flex items-center justify-center group">
        <span className="absolute left-2 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 pointer-events-none transition-colors">
          <PenLine size={15} strokeWidth={1.75} />
        </span>

        <input
          type="text"
          value={taskName}
          onChange={(e) => onTaskNameChange(e.target.value)}
          placeholder=""
          aria-label="Tên nhiệm vụ"
          className="w-full text-center bg-transparent border-b-2 border-neutral-300/80 dark:border-neutral-700/80 focus:border-neutral-900 dark:focus:border-white py-2 px-9 text-base font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none transition-colors"
        />

        {taskName && (
          <button
            type="button"
            onClick={() => onTaskNameChange("")}
            className="absolute right-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer transition-colors"
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
