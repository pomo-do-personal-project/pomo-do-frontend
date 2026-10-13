"use client";

import React, { useState } from "react";
import { TaskDto, TaskStatus } from "../../types/api";
import { Plus, Check, Zap, Clock, Timer } from "lucide-react";

interface OverviewTaskListProps {
  isQuickAddActive: boolean;
  quickAddTasks: TaskDto[];
  dailyTasks: TaskDto[];
  isLoading: boolean;
  isSaving: boolean;
  onAddTask: (title: string) => Promise<void>;
  onToggleTask: (id: string) => void;
}

export function OverviewTaskList({
  isQuickAddActive,
  quickAddTasks,
  dailyTasks,
  isLoading,
  isSaving,
  onAddTask,
  onToggleTask,
}: OverviewTaskListProps) {
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSaving) return;
    await onAddTask(newTaskTitle.trim());
    setNewTaskTitle("");
    setIsInputExpanded(false);
  };

  if (isQuickAddActive) {
    return (
      <div className="flex-1 flex flex-col gap-3">
        {!isInputExpanded ? (
          <button
            onClick={() => setIsInputExpanded(true)}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/80 hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>Ghi nhanh ý nghĩ phát sinh (Quick Add)</span>
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-xs"
          >
            <input
              type="text"
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ghi nhanh suy nghĩ nảy ra (nhấn Enter)..."
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsInputExpanded(false);
                  setNewTaskTitle("");
                }}
                className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu nhanh"}
              </button>
            </div>
          </form>
        )}

        {/* Danh sách các task Quick Add đã lưu */}
        <div className="flex flex-col gap-2.5 flex-1 mt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Các ý nghĩ đã ghi nhận ({quickAddTasks.length})
          </div>

          {quickAddTasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-400 dark:text-neutral-500 italic">
              Chưa có ghi chú nhanh nào. Khi đang tập trung, hãy ghi lại tại đây!
            </div>
          ) : (
            quickAddTasks.map((task) => {
              const isCompleted = task.status === TaskStatus.Completed;

              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                    isCompleted
                      ? "bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800 text-neutral-400"
                      : "bg-white dark:bg-neutral-800/80 border-amber-200/70 dark:border-amber-800/50 text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-amber-400"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-neutral-400 dark:border-neutral-600"
                    }`}
                  >
                    {isCompleted && <Check size={11} strokeWidth={2.5} />}
                  </div>

                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span
                      className={`text-sm leading-snug break-words ${
                        isCompleted ? "line-through opacity-60" : "font-medium"
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Zap size={10} strokeWidth={2} />
                        <span>Quick Add</span>
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-0.5">
                        <Clock size={10} strokeWidth={1.75} />
                        <span>{task.estimatedMinutes || 25}m</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 flex-1">
      {isLoading && dailyTasks.length === 0 ? (
        <div className="text-center py-6 text-xs text-neutral-400">
          Đang tải danh sách công việc...
        </div>
      ) : dailyTasks.length === 0 ? (
        <div className="text-center py-6 text-xs text-neutral-400">
          Chưa có công việc kế hoạch nào hôm nay.
        </div>
      ) : (
        dailyTasks.map((task) => {
          const isCompleted = task.status === TaskStatus.Completed;

          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                isCompleted
                  ? "bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800 text-neutral-400"
                  : "bg-white dark:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-neutral-400"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-neutral-400 dark:border-neutral-600"
                }`}
              >
                {isCompleted && <Check size={11} strokeWidth={2.5} />}
              </div>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <span
                  className={`text-sm leading-snug break-words ${
                    isCompleted ? "line-through opacity-60" : "font-medium"
                  }`}
                >
                  {task.title}
                </span>

                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 font-mono">
                  <Clock size={11} strokeWidth={1.75} className="shrink-0" />
                  <span>
                    ({task.completedPomodoros || 0}/{task.estimatedPomodoros || 1}
                  </span>
                  <Timer size={11} strokeWidth={1.75} className="text-rose-500 shrink-0 inline -ml-0.5" />
                  <span>)</span>
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
