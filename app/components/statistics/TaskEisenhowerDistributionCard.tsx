"use client";

import React, { useMemo } from "react";
import { TaskDto, Priority } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";
import { Target, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface TaskEisenhowerDistributionCardProps {
  tasks: TaskDto[];
}

export function TaskEisenhowerDistributionCard({ tasks }: TaskEisenhowerDistributionCardProps) {
  const { t } = useTranslation();

  const { q1, q2, q3, q4, total, q2Percent, q1Percent } = useMemo(() => {
    const counts = { q1: 0, q2: 0, q3: 0, q4: 0 };
    tasks.forEach((task) => {
      if (task.priority === Priority.ImportantUrgent) counts.q1++;
      else if (task.priority === Priority.ImportantNotUrgent) counts.q2++;
      else if (task.priority === Priority.NotImportantUrgent) counts.q3++;
      else if (task.priority === Priority.NotImportantNotUrgent) counts.q4++;
    });

    const total = tasks.length || 1;
    const q2Percent = Math.round((counts.q2 / total) * 100);
    const q1Percent = Math.round((counts.q1 / total) * 100);

    return { ...counts, total: tasks.length, q2Percent, q1Percent };
  }, [tasks]);

  const quadrants = [
    {
      id: "q1",
      name: "Q1: Khẩn cấp & Quan trọng",
      subtitle: "Làm ngay (Do first)",
      count: q1,
      percent: total > 0 ? Math.round((q1 / total) * 100) : 0,
      color: "bg-rose-500",
      textColor: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
    {
      id: "q2",
      name: "Q2: Quan trọng & Không khẩn",
      subtitle: "Lên kế hoạch (Schedule)",
      count: q2,
      percent: total > 0 ? Math.round((q2 / total) * 100) : 0,
      color: "bg-blue-500",
      textColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      isPrimary: true,
    },
    {
      id: "q3",
      name: "Q3: Khẩn cấp & Không quan trọng",
      subtitle: "Ủy quyền (Delegate)",
      count: q3,
      percent: total > 0 ? Math.round((q3 / total) * 100) : 0,
      color: "bg-amber-500",
      textColor: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      id: "q4",
      name: "Q4: Không khẩn & Không quan trọng",
      subtitle: "Loại bỏ (Don't do)",
      count: q4,
      percent: total > 0 ? Math.round((q4 / total) * 100) : 0,
      color: "bg-neutral-400 dark:bg-neutral-500",
      textColor: "text-neutral-500 dark:text-neutral-400",
      bgColor: "bg-neutral-500/10",
      borderColor: "border-neutral-500/20",
    },
  ];

  return (
    <section className="lg:col-span-2 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm transition-colors flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
                {t.statistics.taskEisenhowerTitle}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t.statistics.taskEisenhowerSubtitle}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            {total} {t.statistics.unitTasks}
          </span>
        </div>

        {/* Unified Segmented Bar */}
        {total > 0 && (
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-200 dark:bg-neutral-800 my-5 gap-0.5">
            {quadrants.map((q) =>
              q.percent > 0 ? (
                <div
                  key={q.id}
                  style={{ width: `${q.percent}%` }}
                  className={`h-full ${q.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                  title={`${q.name}: ${q.count} việc (${q.percent}%)`}
                />
              ) : null
            )}
          </div>
        )}

        {/* 4 Quadrants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {quadrants.map((q) => (
            <div
              key={q.id}
              className={`p-3.5 rounded-2xl border ${q.borderColor} ${q.bgColor} flex flex-col justify-between transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${q.textColor} flex items-center gap-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${q.color}`} />
                  {q.name}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  {q.count} ({q.percent}%)
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {q.subtitle}
              </p>
              <div className="w-full h-1.5 bg-neutral-200/80 dark:bg-neutral-700/80 rounded-full mt-2.5 overflow-hidden">
                <div
                  style={{ width: `${q.percent}%` }}
                  className={`h-full ${q.color} rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI / Rule-based Balance Advice */}
      <div className="mt-5 p-3.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5">
        <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-700 dark:text-neutral-300">
          <strong className="text-neutral-900 dark:text-white">Đánh giá ma trận: </strong>
          {q2Percent >= 40
            ? t.statistics.balanceGood
            : q1Percent >= 50
            ? t.statistics.balanceFirefighting
            : t.statistics.balanceNormal}
        </div>
      </div>
    </section>
  );
}
