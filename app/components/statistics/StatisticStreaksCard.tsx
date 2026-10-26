"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useTranslation } from "../../stores/useLanguageStore";

interface StatisticStreaksCardProps {
  streaksCount: number;
  longestStreak?: number;
}

export function StatisticStreaksCard({
  streaksCount,
  longestStreak,
}: StatisticStreaksCardProps) {
  const { t } = useTranslation();

  return (
    <section className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-4 sm:p-6 md:p-8 shadow-sm transition-colors flex flex-col items-center justify-center text-center min-h-[240px]">
      <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        {t.statistics.streaks}
      </h2>

      <div className="flex flex-col items-center justify-center my-auto">
        <span className="text-6xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none mb-2">
          {streaksCount}
        </span>
        <span className="text-base font-semibold text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
          <span>{t.statistics.streakDays}</span>
          <Flame size={18} strokeWidth={2} className="text-amber-500 fill-amber-500/20" />
        </span>
        {longestStreak ? (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 font-mono">
            {t.statistics.streakRecord} {longestStreak} {t.statistics.streakDays}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
        {t.statistics.streakEncourage}
      </p>
    </section>
  );
}
