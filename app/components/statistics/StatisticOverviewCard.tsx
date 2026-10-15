"use client";

import React from "react";
import { useTranslation } from "../../stores/useLanguageStore";

interface StatisticOverviewCardProps {
  activeTab: "focus" | "task";
  todayFocusHours: string;
  todayPomos: number;
  totalFocusHours: string;
  tasksCount: number;
  completedTasksCount: number;
  overtimeMinutes: number;
  isLoading: boolean;
}

export function StatisticOverviewCard({
  activeTab,
  todayFocusHours,
  todayPomos,
  totalFocusHours,
  tasksCount,
  completedTasksCount,
  overtimeMinutes,
  isLoading,
}: StatisticOverviewCardProps) {
  const { t } = useTranslation();

  return (
    <section className="w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm mb-8 transition-colors">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
            {t.statistics.overview}
          </h2>
          {isLoading && (
            <span className="text-xs text-neutral-400 font-mono animate-pulse">
              {t.common.syncing}
            </span>
          )}
        </div>

        {overtimeMinutes > 0 && activeTab === "focus" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {t.statistics.totalOvertimeToday} +{overtimeMinutes} {t.statistics.minutesUnit}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
        {/* Item 1 */}
        <div className="flex flex-col items-center justify-center py-4 md:py-2">
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            {activeTab === "focus" ? t.statistics.todayFocus : t.statistics.totalTasks}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
              {activeTab === "focus" ? todayFocusHours : tasksCount}
            </span>
            <span className="text-sm text-neutral-400 font-semibold">
              {activeTab === "focus" ? t.statistics.unitHours : t.statistics.unitTasks}
            </span>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex flex-col items-center justify-center py-4 md:py-2">
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            {activeTab === "focus" ? t.statistics.todayPomos : t.statistics.completedTasks}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
              {activeTab === "focus" ? todayPomos : completedTasksCount}
            </span>
            <span className="text-sm text-neutral-400 font-semibold">
              {activeTab === "focus" ? t.statistics.unitPomos : t.statistics.unitTasks}
            </span>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex flex-col items-center justify-center py-4 md:py-2">
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            {activeTab === "focus" ? t.statistics.totalFocus : t.statistics.pendingTasks}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
              {activeTab === "focus" ? totalFocusHours : tasksCount - completedTasksCount}
            </span>
            <span className="text-sm text-neutral-400 font-semibold">
              {activeTab === "focus" ? t.statistics.unitHours : t.statistics.unitTasks}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
