"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTranslation } from "../../stores/useLanguageStore";
import { AiFocusSessionDetailModal } from "./AiFocusSessionDetailModal";
import { AiSessionDetailData } from "../../types/aiFocus";

export type { AiSessionDetailData };

export interface StatisticSessionEntry {
  sessionId: string; actualMinutes: number; overtimeMinutes: number;
  durationMinutes: number; isCompleted: boolean; startedAt?: string; aiData?: AiSessionDetailData | null;
}

export interface StatisticItem {
  id: string; name: string; plannedMinutes: number; actualMinutes: number; overtimeMinutes: number;
  pomos: number; color: string; sourceType: "task" | "list"; aiData?: AiSessionDetailData | null;
  sessionId?: string; sessions?: StatisticSessionEntry[];
}

interface StatisticDetailChartProps {
  items: StatisticItem[];
  sourceFilter: "all" | "task" | "list";
  onSetSourceFilter: (filter: "all" | "task" | "list") => void;
  timeRange: "Today" | "Week" | "Month";
  onSetTimeRange: React.Dispatch<React.SetStateAction<"Today" | "Week" | "Month">>;
}

export function StatisticDetailChart({
  items,
  sourceFilter,
  onSetSourceFilter,
  timeRange,
  onSetTimeRange,
}: StatisticDetailChartProps) {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<StatisticItem | null>(null);

  const filteredData = React.useMemo(() => {
    if (sourceFilter === "all") return items;
    return items.filter((i) => i.sourceType === sourceFilter);
  }, [items, sourceFilter]);

  const totalActualMinutes = filteredData.reduce((acc, cur) => acc + cur.actualMinutes, 0);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const rangeLabels: Record<"Today" | "Week" | "Month", string> = {
    Today: t.statistics.rangeToday,
    Week: t.statistics.rangeWeek,
    Month: t.statistics.rangeMonth,
  };

  return (
    <section className="lg:col-span-2 min-w-0 max-w-full w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-4 sm:p-6 md:p-8 shadow-sm transition-colors flex flex-col justify-between">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
          {t.statistics.detailChart}
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center p-0.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
            <button
              onClick={() => onSetSourceFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sourceFilter === "all"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {t.statistics.filterAll}
            </button>
            <button
              onClick={() => onSetSourceFilter("task")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sourceFilter === "task"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {t.statistics.filterTask}
            </button>
            <button
              onClick={() => onSetSourceFilter("list")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                sourceFilter === "list"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {t.statistics.filterList}
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <button
              onClick={() =>
                onSetTimeRange((prev) => (prev === "Today" ? "Week" : prev === "Week" ? "Month" : "Today"))
              }
              className="hover:text-neutral-900 dark:hover:text-white cursor-pointer px-1 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft size={13} strokeWidth={2} />
              <span>{rangeLabels[timeRange]}</span>
              <ChevronRight size={13} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      {filteredData.length === 0 ? (
        <div className="py-16 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
          Chưa có phiên tập trung nào trong {rangeLabels[timeRange]}. Hãy bắt đầu đếm giờ ở Tổng quan!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
          {/* Donut Chart */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-neutral-200 dark:stroke-neutral-800"
                strokeWidth="14"
                fill="none"
              />

              {filteredData.map((task) => {
                const percentage = totalActualMinutes > 0 ? task.actualMinutes / totalActualMinutes : 0;
                const strokeDasharray = `${percentage * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += percentage * circumference;

                return (
                  <circle
                    key={task.id}
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={task.color}
                    strokeWidth="14"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-neutral-900 dark:text-white">
                {totalActualMinutes}
              </span>
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                {t.statistics.minutesUnit}
              </span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="sm:col-span-7 flex flex-col gap-4 w-full max-h-[175px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
            {filteredData.map((item) => {
              const isOvertime = item.actualMinutes > item.plannedMinutes;
              const overtimeMinutes = item.overtimeMinutes || Math.max(0, item.actualMinutes - item.plannedMinutes);
              const basePercent = Math.min(100, Math.round((item.actualMinutes / item.plannedMinutes) * 100));
              const overtimePercent = isOvertime
                ? Math.min(40, Math.round((overtimeMinutes / item.plannedMinutes) * 100))
                : 0;

              const hasAiScore = item.aiData?.score !== undefined;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex flex-col gap-1.5 w-full p-2 -mx-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all cursor-pointer group"
                  title="Nhấn để xem phân tích sự tập trung của AI"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <div className="flex items-center gap-2 truncate max-w-[200px]">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.sourceType === "task" ? "bg-blue-500" : "bg-amber-500"
                        }`}
                      />
                      <span className="truncate group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      {hasAiScore && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20 shrink-0">
                          AI {item.aiData?.score}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                      <span className="text-neutral-900 dark:text-white font-bold">{item.actualMinutes}m</span>
                      {isOvertime && (
                        <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                          (+{overtimeMinutes}m OT)
                        </span>
                      )}
                      <span className="text-neutral-400">/ {item.plannedMinutes}m</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${basePercent}%`, backgroundColor: item.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                    {isOvertime && (
                      <div
                        style={{ width: `${overtimePercent}%` }}
                        className="h-full bg-rose-500 rounded-r-full transition-all duration-500 animate-pulse"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal xem chi tiết sự tập trung của AI */}
      <AiFocusSessionDetailModal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </section>
  );
}
