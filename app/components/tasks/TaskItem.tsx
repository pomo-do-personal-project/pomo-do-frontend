"use client";

import React from "react";
import { TaskDto, TaskStatus, Priority } from "../../types/api";
import { Check, Zap, Clock, ChevronRight } from "lucide-react";
import { parseTaskDueDate } from "../../utils/dateUtils";

interface TaskItemProps {
  task: TaskDto;
  isSelected: boolean;
  onSelect: (task: TaskDto) => void;
  onToggleStatus: (taskId: string, e: React.MouseEvent) => void;
}

export function TaskItem({
  task,
  isSelected,
  onSelect,
  onToggleStatus,
}: TaskItemProps) {
  const isCompleted = task.status === TaskStatus.Completed;

  const getMatrixBadgeColor = (p: Priority) => {
    switch (p) {
      case Priority.ImportantUrgent:
        return "text-rose-500";
      case Priority.ImportantNotUrgent:
        return "text-blue-500";
      case Priority.NotImportantUrgent:
        return "text-amber-500";
      case Priority.NotImportantNotUrgent:
        return "text-neutral-400";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div
      data-task-item="true"
      onClick={() => onSelect(task)}
      className={`px-4 py-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
        isSelected
          ? "bg-neutral-100 dark:bg-neutral-800/90 border-neutral-400 dark:border-neutral-600 shadow-xs"
          : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Rounded Checkbox */}
        <button
          type="button"
          onClick={(e) => onToggleStatus(task.id, e)}
          aria-label={`Đánh dấu hoàn thành ${task.title}`}
          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-neutral-400 dark:border-neutral-600 hover:border-neutral-600"
          }`}
        >
          {isCompleted && <Check size={13} strokeWidth={2.5} />}
        </button>

        <div className="flex items-center gap-2 truncate">
          <span
            className={`text-sm sm:text-base truncate ${
              isCompleted
                ? "line-through text-neutral-400 dark:text-neutral-500"
                : "text-neutral-800 dark:text-neutral-200 font-medium"
            }`}
          >
            {task.title}
          </span>

          {/* QuickAdd Badge */}
          {task.isQuickAdd && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Zap size={10} strokeWidth={2} />
              <span>Quick</span>
            </span>
          )}

          {/* Tags list */}
          {task.tags && task.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {task.tags.slice(0, 2).map((t) => (
                <span
                  key={t.id}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-100/60 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 truncate max-w-[90px]"
                  title={t.name}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.colorHex || "#6366f1" }}
                  />
                  <span className="truncate">{t.name}</span>
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[10px] text-neutral-400 font-mono">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Eisenhower Matrix Priority Indicator */}
          <span
            className={`text-xs ${getMatrixBadgeColor(task.priority)}`}
            title="Độ ưu tiên Ma trận Eisenhower"
          >
            ●
          </span>

          {/* Estimated time tag */}
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock size={11} strokeWidth={1.75} />
            <span>{task.estimatedMinutes || 25}m</span>
          </span>

          {/* Scheduled Time Badge */}
          {(() => {
            const dueInfo = parseTaskDueDate(task.dueDate);
            if (!dueInfo.hasTime) return null;
            return (
              <span className="text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 shrink-0">
                <Clock size={11} className="text-neutral-400" />
                <span>{dueInfo.time12h}</span>
              </span>
            );
          })()}

          {/* Subtasks summary */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length}
            </span>
          )}
        </div>
      </div>

      <span className="text-neutral-400 dark:text-neutral-500 px-2 flex items-center">
        <ChevronRight size={16} strokeWidth={1.75} />
      </span>
    </div>
  );
}
