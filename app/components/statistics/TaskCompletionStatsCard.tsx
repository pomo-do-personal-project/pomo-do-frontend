"use client";

import React, { useMemo } from "react";
import { TaskDto, TaskStatus } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";
import { CheckCircle2, ListTodo, CheckSquare, Clock } from "lucide-react";

interface TaskCompletionStatsCardProps {
  tasks: TaskDto[];
}

export function TaskCompletionStatsCard({ tasks }: TaskCompletionStatsCardProps) {
  const { t } = useTranslation();

  const {
    total,
    completed,
    inProgress,
    todo,
    percent,
    totalSubtasks,
    completedSubtasks,
    subtaskPercent,
  } = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    tasks.forEach((t) => {
      if (t.status === TaskStatus.Completed) completed++;
      else if (t.status === TaskStatus.InProgress) inProgress++;
      else todo++;

      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter((s) => s.isCompleted).length;
      }
    });

    const total = tasks.length || 1;
    const percent = Math.round((completed / total) * 100);
    const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return {
      total: tasks.length,
      completed,
      inProgress,
      todo,
      percent,
      totalSubtasks,
      completedSubtasks,
      subtaskPercent,
    };
  }, [tasks]);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <section className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-4 sm:p-6 md:p-8 shadow-sm transition-colors flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={18} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
          {t.statistics.taskCompletionTitle}
        </h2>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 110 110">
          <circle
            cx="55"
            cy="55"
            r={radius}
            className="stroke-neutral-200 dark:stroke-neutral-800"
            strokeWidth="11"
            fill="none"
          />
          <circle
            cx="55"
            cy="55"
            r={radius}
            className="stroke-emerald-500 transition-all duration-700 ease-out"
            strokeWidth="11"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {percent}%
          </span>
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            {completed}/{total} đã xong
          </span>
        </div>
      </div>

      {/* Status Breakdown Chips */}
      <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-200 dark:border-neutral-800 text-center">
        <div>
          <span className="block text-base font-bold text-emerald-500">{completed}</span>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Đã xong</span>
        </div>
        <div>
          <span className="block text-base font-bold text-blue-500">{inProgress}</span>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Đang làm</span>
        </div>
        <div>
          <span className="block text-base font-bold text-neutral-400">{todo}</span>
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">Chưa bắt đầu</span>
        </div>
      </div>

      {/* Subtasks Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <CheckSquare size={14} className="text-emerald-500" />
            {t.statistics.subtaskProgress}
          </span>
          <span className="font-mono text-neutral-900 dark:text-white">
            {completedSubtasks}/{totalSubtasks} ({subtaskPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${subtaskPercent}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          />
        </div>
      </div>
    </section>
  );
}
