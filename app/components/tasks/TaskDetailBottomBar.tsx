"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, MoreHorizontal, Timer, Copy, Trash2 } from "lucide-react";

interface TaskDetailBottomBarProps {
  isSaving: boolean;
  onStartPomodoro: () => void;
  onDuplicateTask: () => void;
  onDelete: () => void;
}

export function TaskDetailBottomBar({
  isSaving,
  onStartPomodoro,
  onDuplicateTask,
  onDelete,
}: TaskDetailBottomBarProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 mt-auto pointer-events-auto">
      {/* Auto-save Status Indicator */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-medium select-none">
        {isSaving ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>Đang lưu...</span>
          </>
        ) : (
          <>
            <Check size={14} strokeWidth={2.5} className="text-emerald-500 shrink-0" />
            <span>Đã lưu</span>
          </>
        )}
      </div>

      {/* Action Popover Menu (TickTick style •••) */}
      <div className="relative shrink-0" ref={actionMenuRef}>
        <button
          type="button"
          onClick={() => setIsActionMenuOpen((prev) => !prev)}
          title="Tùy chọn khác"
          aria-label="Tùy chọn khác"
          className={`p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer ${
            isActionMenuOpen ? "bg-neutral-100 dark:bg-neutral-800" : ""
          }`}
        >
          <MoreHorizontal size={18} strokeWidth={1.75} />
        </button>

        {isActionMenuOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
            {/* 1. Start Pomodoro */}
            <button
              type="button"
              onClick={() => {
                setIsActionMenuOpen(false);
                onStartPomodoro();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors cursor-pointer font-medium"
            >
              <Timer size={15} strokeWidth={2} className="text-rose-500 shrink-0" />
              <span>Bắt đầu Pomodoro</span>
            </button>

            {/* 2. Duplicate Task */}
            <button
              type="button"
              onClick={() => {
                setIsActionMenuOpen(false);
                onDuplicateTask();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors cursor-pointer font-medium"
            >
              <Copy size={15} strokeWidth={2} className="text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span>Nhân bản việc</span>
            </button>

            <div className="my-1 border-t border-neutral-100 dark:border-neutral-700/60" />

            {/* 3. Delete Task */}
            <button
              type="button"
              onClick={() => {
                setIsActionMenuOpen(false);
                onDelete();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-medium"
            >
              <Trash2 size={15} strokeWidth={2} className="shrink-0" />
              <span>Xóa việc này</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
