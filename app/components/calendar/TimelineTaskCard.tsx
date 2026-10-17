"use client";

import React from "react";
import { CheckCircle2, Circle, Play, Clock } from "lucide-react";
import { TaskDto, TaskStatus, Priority, FocusSessionMode } from "../../types/api";
import { usePomodoroStore } from "../../stores/usePomodoroStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { parseTaskDueDate } from "../../utils/dateUtils";

interface TimelineTaskCardProps {
  task: TaskDto;
  isSelected: boolean;
  onSelect: (task: TaskDto) => void;
  onToggleStatus: (id: string, e: React.MouseEvent) => void;
  onNavigateToTimer?: () => void;
}

export function TimelineTaskCard({
  task,
  isSelected,
  onSelect,
  onToggleStatus,
  onNavigateToTimer,
}: TimelineTaskCardProps) {
  const isCompleted = task.status === TaskStatus.Completed;

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.ImportantUrgent:
        return { label: "Q1", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
      case Priority.ImportantNotUrgent:
        return { label: "Q2", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
      case Priority.NotImportantUrgent:
        return { label: "Q3", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
      default:
        return { label: "Q4", color: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20" };
    }
  };

  const priorityInfo = getPriorityBadge(task.priority);
  const totalPomos = task.estimatedPomodoros || 1;
  const completedPomos = task.completedPomodoros || 0;
  const dueInfo = parseTaskDueDate(task.dueDate);

  const handleStartPomo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { setTaskName, setIsRunning, setTimerType, setFocusMode, resetTimer, clearCurrentSession, startSession } =
      usePomodoroStore.getState();
    const { settings } = useSettingsStore.getState();
    const durationMinutes =
      task.estimatedMinutes && task.estimatedMinutes > 0
        ? task.estimatedMinutes
        : (settings.focusDuration || 25);

    clearCurrentSession();
    resetTimer(durationMinutes * 60);
    setTaskName(task.title);
    setTimerType("pomo");
    setFocusMode("W");
    startSession({ taskId: task.id, mode: FocusSessionMode.Pomo, durationMinutes });
    setIsRunning(true);
    onNavigateToTimer?.();
  };

  return (
    <div
      onClick={() => onSelect(task)}
      className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? "bg-neutral-100/90 dark:bg-neutral-800/90 border-neutral-400 dark:border-neutral-600 shadow-md"
          : "bg-white/70 dark:bg-neutral-900/50 border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800/40 shadow-xs"
      }`}
    >
      {/* Left: Checkbox & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => onToggleStatus(task.id, e)}
          className="text-neutral-400 hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
          title={isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
        >
          {isCompleted ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        <div className="flex flex-col min-w-0 gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border shrink-0 ${priorityInfo.color}`}
            >
              {priorityInfo.label}
            </span>

            {dueInfo.hasTime && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
                <Clock size={11} className="text-neutral-400" />
                <span>{dueInfo.time12h}</span>
              </span>
            )}

            <span
              className={`text-sm font-semibold truncate ${
                isCompleted
                  ? "line-through text-neutral-400 dark:text-neutral-500"
                  : "text-neutral-900 dark:text-white"
              }`}
            >
              {task.title}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-neutral-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              <span>{task.estimatedMinutes || 25}m</span>
            </span>
            <span>•</span>
            <span>
              Tiến độ: <strong className="text-neutral-700 dark:text-neutral-300">{completedPomos}/{totalPomos}</strong> Pomo
            </span>
            {task.tags && task.tags.length > 0 && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px]">
                  #{task.tags.map((t) => t.name).join(", #")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Action Button */}
      <div className="flex items-center gap-2 shrink-0">
        {!isCompleted && (
          <button
            type="button"
            onClick={handleStartPomo}
            title="Chạy Pomodoro ngay"
            className="p-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Play size={12} className="fill-current" />
            <span className="hidden sm:inline">Tập trung</span>
          </button>
        )}
      </div>
    </div>
  );
}
