"use client";

import React from "react";
import { TaskDto, TaskStatus, Priority } from "../../types/api";
import { Check, Zap, Clock, ChevronRight } from "lucide-react";
import { parseTaskDueDate } from "../../utils/dateUtils";
import { useSettingsStore } from "../../stores/useSettingsStore";

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
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
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
      className={`px-4 py-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none backdrop-blur-md ${
        isSelected
          ? wallpaperUrl
            ? "bg-white/25 border-white/40 shadow-md ring-1 ring-white/30 text-white"
            : "bg-white border-neutral-300 shadow-md ring-1 ring-neutral-400 text-neutral-900"
          : wallpaperUrl
          ? "bg-white/15 hover:bg-white/20 border-white/15 hover:border-white/30 shadow-xs text-white"
          : "bg-white hover:bg-neutral-50/90 border-neutral-200/90 hover:border-neutral-300 shadow-2xs text-neutral-800"
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
              : wallpaperUrl
              ? "border-white/40 hover:border-white bg-black/20 text-white"
              : "border-neutral-300 hover:border-neutral-500 bg-neutral-100/80 text-neutral-700"
          }`}
        >
          {isCompleted && <Check size={13} strokeWidth={2.5} />}
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={`text-sm sm:text-base truncate font-medium min-w-0 ${
              isCompleted
                ? wallpaperUrl
                  ? "line-through text-white/40"
                  : "line-through text-neutral-400"
                : wallpaperUrl
                ? "text-white drop-shadow-xs"
                : "text-neutral-900"
            }`}
          >
            {task.title}
          </span>

          {/* QuickAdd Badge */}
          {task.isQuickAdd && (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
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
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 border truncate max-w-[90px] ${
                    wallpaperUrl
                      ? "border-white/15 bg-white/15 text-white"
                      : "border-neutral-200 bg-neutral-100 text-neutral-700"
                  }`}
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
                <span
                  className={`text-[10px] font-mono ${
                    wallpaperUrl ? "text-white/60" : "text-neutral-500"
                  }`}
                >
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
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 border ${
              wallpaperUrl
                ? "text-white/80 bg-white/15 border-white/10 backdrop-blur-xs"
                : "text-neutral-600 bg-neutral-100 border-neutral-200/80"
            }`}
          >
            <Clock size={11} strokeWidth={1.75} />
            <span>{task.estimatedMinutes || 25}m</span>
          </span>

          {/* Scheduled Time Badge */}
          {(() => {
            const dueInfo = parseTaskDueDate(task.dueDate);
            if (!dueInfo.hasTime) return null;
            return (
              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border shrink-0 ${
                  wallpaperUrl
                    ? "text-white/90 bg-white/15 border-white/15 backdrop-blur-xs"
                    : "text-neutral-700 bg-neutral-100 border-neutral-200"
                }`}
              >
                <Clock size={11} className={wallpaperUrl ? "text-white/70" : "text-neutral-500"} />
                <span>{dueInfo.time12h}</span>
              </span>
            );
          })()}

          {/* Subtasks summary */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                wallpaperUrl
                  ? "text-white/80 bg-white/15 border-white/10"
                  : "text-neutral-600 bg-neutral-100 border-neutral-200"
              }`}
            >
              {task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length}
            </span>
          )}
        </div>
      </div>

      <span
        className={`px-2 flex items-center ${
          wallpaperUrl
            ? "text-white/40 group-hover:text-white"
            : "text-neutral-400 group-hover:text-neutral-700"
        }`}
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </span>
    </div>
  );
}
