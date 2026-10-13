"use client";

import React from "react";
import { Flame } from "lucide-react";

interface StatisticStreaksCardProps {
  streaksCount: number;
  longestStreak?: number;
}

export function StatisticStreaksCard({
  streaksCount,
  longestStreak,
}: StatisticStreaksCardProps) {
  return (
    <section className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm transition-colors flex flex-col items-center justify-center text-center min-h-[240px]">
      <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        Streaks
      </h2>

      <div className="flex flex-col items-center justify-center my-auto">
        <span className="text-6xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none mb-2">
          {streaksCount}
        </span>
        <span className="text-base font-semibold text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
          <span>ngày liên tục</span>
          <Flame size={18} strokeWidth={2} className="text-amber-500 fill-amber-500/20" />
        </span>
        {longestStreak ? (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 font-mono">
            Kỷ lục: {longestStreak} ngày
          </span>
        ) : null}
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
        Duy trì thói quen tập trung mỗi ngày!
      </p>
    </section>
  );
}
