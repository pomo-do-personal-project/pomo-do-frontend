"use client";

import React from "react";
import { TaskDto, TaskStatus, Priority } from "../../types/api";
import { Check, GripVertical, X } from "lucide-react";

interface MatrixTaskItemProps {
  task: TaskDto;
  wallpaperUrl?: string;
  isBeingDragged: boolean;
  otherQuadrants: { code: string; label: string; priority: Priority; color: string }[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onToggleTask: (id: string) => void;
  onMoveTask?: (id: string, targetPriority: Priority) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
}

export function MatrixTaskItem({
  task,
  wallpaperUrl,
  isBeingDragged,
  otherQuadrants,
  onDragStart,
  onDragEnd,
  onToggleTask,
  onMoveTask,
  onDeleteTask,
}: MatrixTaskItemProps) {
  const isCompleted = task.status === TaskStatus.Completed;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`group p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-2.5 cursor-grab active:cursor-grabbing select-none ${
        isBeingDragged
          ? "opacity-40 scale-[0.98] border-dashed border-neutral-400 shadow-none"
          : isCompleted
            ? wallpaperUrl
              ? "bg-white/40 backdrop-blur-md border-white/25 text-neutral-600 line-through"
              : "bg-neutral-100/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
            : wallpaperUrl
              ? "bg-white/90 backdrop-blur-md border-white/40 text-neutral-950 font-medium shadow-xs hover:bg-white hover:border-white/60"
              : "bg-white/90 dark:bg-neutral-800/80 border-neutral-200/90 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-100 shadow-2xs hover:shadow-xs hover:border-neutral-400 dark:hover:border-neutral-500"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className={`transition-colors shrink-0 cursor-grab ${
            wallpaperUrl
              ? "text-neutral-400 group-hover:text-neutral-700"
              : "text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400"
          }`}
          title="Kéo thả để di chuyển ô"
        >
          <GripVertical size={14} strokeWidth={2} />
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTask(task.id);
          }}
          aria-label={`Đánh dấu hoàn thành ${task.title}`}
          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-neutral-400 dark:border-neutral-500 hover:border-emerald-500"
          }`}
        >
          {isCompleted && <Check size={11} strokeWidth={2.5} />}
        </button>

        <span
          className={`text-xs sm:text-sm truncate ${
            isCompleted
              ? wallpaperUrl ? "line-through text-neutral-600 font-normal" : "line-through text-neutral-400"
              : wallpaperUrl ? "font-bold text-neutral-950" : "font-medium"
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Action & Quadrant Quick-Move Buttons */}
      <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        {onMoveTask &&
          otherQuadrants.map((target) => (
            <button
              key={target.code}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveTask(task.id, target.priority);
              }}
              title={`Chuyển sang ${target.label}`}
              aria-label={`Chuyển ${task.title} sang ${target.label}`}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-100/70 dark:bg-neutral-800/70 transition-colors cursor-pointer ${target.color}`}
            >
              {target.code}
            </button>
          ))}
        <button
          type="button"
          onClick={(e) => onDeleteTask(task.id, e)}
          className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
          title="Xóa công việc này"
          aria-label="Xóa công việc này"
        >
          <X size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
