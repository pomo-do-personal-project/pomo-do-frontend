"use client";

import React from "react";
import { formatDurationCompact } from "../../utils/dateUtils";

interface OverviewStatsCardsProps {
  totalMinutes: number;
  completedCount: number;
  totalTasks: number;
}

export function OverviewStatsCards({
  totalMinutes,
  completedCount,
  totalTasks,
}: OverviewStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 shrink-0 w-full min-w-0">
      <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col items-center justify-center min-w-0 text-center">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 truncate w-full">
          Đã tập trung
        </span>
        <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white truncate w-full">
          {formatDurationCompact(totalMinutes)}
        </span>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col items-center justify-center min-w-0 text-center">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 truncate w-full">
          Việc hoàn thành
        </span>
        <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white truncate w-full">
          {completedCount}/{totalTasks}
        </span>
      </div>
    </div>
  );
}
