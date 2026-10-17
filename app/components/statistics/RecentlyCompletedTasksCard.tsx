"use client";

import React, { useMemo } from "react";
import { TaskDto, TaskStatus, Priority } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";
import { CheckCircle2, Clock, Calendar, CheckSquare } from "lucide-react";

interface RecentlyCompletedTasksCardProps {
  tasks: TaskDto[];
}

export function RecentlyCompletedTasksCard({ tasks }: RecentlyCompletedTasksCardProps) {
  const { t } = useTranslation();

  const recentCompleted = useMemo(() => {
    return tasks
      .filter((task) => task.status === TaskStatus.Completed)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [tasks]);

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case Priority.ImportantUrgent:
        return { label: "Q1", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
      case Priority.ImportantNotUrgent:
        return { label: "Q2", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
      case Priority.NotImportantUrgent:
        return { label: "Q3", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
      default:
        return { label: "Q4", color: "text-neutral-400 bg-neutral-500/10 border-neutral-500/20" };
    }
  };

  const formatTaskTime = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} ${d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } catch {
      return "";
    }
  };

  return (
    <section className="w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm transition-colors mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <CheckSquare size={18} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
            {t.statistics.recentCompletedTitle}
          </h2>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
          {recentCompleted.length} việc gần nhất
        </span>
      </div>

      {/* List */}
      {recentCompleted.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
          {t.statistics.noRecentCompleted}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
          {recentCompleted.map((task) => {
            const pBadge = getPriorityBadge(task.priority);
            const timeStr = formatTaskTime(task.updatedAt || task.createdAt);

            return (
              <div
                key={task.id}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 -mx-3 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate line-through opacity-85">
                    {task.title}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${pBadge.color} shrink-0`}>
                    {pBadge.label}
                  </span>
                  {task.tags && task.tags.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      {task.tags.slice(0, 2).map((tg) => (
                        <span
                          key={tg.id}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        >
                          #{tg.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono shrink-0">
                  {task.completedPomodoros > 0 && (
                    <span className="hidden md:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {task.completedPomodoros} pomo
                    </span>
                  )}
                  {timeStr && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                      <Clock size={12} />
                      {timeStr}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
