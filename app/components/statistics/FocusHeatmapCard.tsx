"use client";

import React, { useState, useMemo } from "react";
import { HeatmapCellDto } from "../../types/api";
import { useTranslation } from "../../stores/useLanguageStore";
import { Flame, Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";

interface FocusHeatmapCardProps {
  cells: HeatmapCellDto[];
  isLoading: boolean;
  rangeDays: number;
  onRangeChange: (days: number) => void;
  totalFocusMinutes: number;
  totalCompletedSessions: number;
}

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const KEY_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export function FocusHeatmapCard({
  cells,
  isLoading,
  rangeDays,
  onRangeChange,
  totalFocusMinutes,
  totalCompletedSessions,
}: FocusHeatmapCardProps) {
  const { t } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<HeatmapCellDto | null>(null);

  // Tổ chức dữ liệu theo ma trận 7 hàng (ngày) x 24 cột (giờ)
  const matrix = useMemo(() => {
    const map = new Map<string, HeatmapCellDto>();
    cells.forEach((cell) => {
      map.set(`${cell.dayOfWeek}-${cell.hour}`, cell);
    });
    return map;
  }, [cells]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-200 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-900/60";
      case 2:
        return "bg-emerald-400 dark:bg-emerald-800/80 border-emerald-500 dark:border-emerald-700/60";
      case 3:
        return "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500";
      case 4:
        return "bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.35)]";
      default:
        return "bg-neutral-100 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/40";
    }
  };

  const totalHours = (totalFocusMinutes / 60).toFixed(1);

  return (
    <section className="w-full min-w-0 max-w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-4 sm:p-6 md:p-8 shadow-sm transition-colors mb-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-emerald-500" />
              {t.statistics.heatmapTitle}
            </h2>
            {isLoading && (
              <span className="text-xs text-neutral-400 font-mono animate-pulse">
                {t.common.syncing}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t.statistics.heatmapSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Quick Stats Pill */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            <span>
              <strong className="text-neutral-900 dark:text-white">{totalHours}h</strong> tập trung
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-400" />
            <span>
              <strong className="text-neutral-900 dark:text-white">{totalCompletedSessions}</strong> phiên
            </span>
          </div>

          {/* Range Selector */}
          <div className="inline-flex items-center p-0.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => onRangeChange(days)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  rangeDays === days
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {days === 7 ? t.statistics.range7Days : days === 30 ? t.statistics.range30Days : t.statistics.range90Days}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix Heatmap Container */}
      <div className="relative w-full max-w-full overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Hour Labels */}
          <div className="grid grid-cols-[40px_repeat(24,_1fr)] gap-1 mb-1 text-[10px] font-mono text-neutral-400 select-none">
            <span />
            {Array.from({ length: 24 }).map((_, hour) => (
              <span
                key={hour}
                className={`text-center ${KEY_HOURS.includes(hour) ? "text-neutral-600 dark:text-neutral-300 font-bold" : "opacity-0"}`}
              >
                {hour.toString().padStart(2, "0")}h
              </span>
            ))}
          </div>

          {/* 7 Days of Week Rows */}
          {DAYS_OF_WEEK.map((dayLabel, dayIndex) => (
            <div key={dayLabel} className="grid grid-cols-[40px_repeat(24,_1fr)] gap-1 mb-1 items-center">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 text-right pr-2 select-none">
                {dayLabel}
              </span>
              {Array.from({ length: 24 }).map((_, hour) => {
                const cell = matrix.get(`${dayIndex}-${hour}`) || {
                  dayOfWeek: dayIndex,
                  dayName: dayLabel,
                  hour,
                  hourLabel: `${hour}:00 - ${hour + 1}:00`,
                  totalMinutes: 0,
                  completedCount: 0,
                  cancelledCount: 0,
                  averageAiScore: 0,
                  level: 0,
                };
                return (
                  <div
                    key={hour}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`aspect-square rounded-sm md:rounded-md border cursor-pointer transition-all duration-150 hover:scale-115 hover:z-10 ${getCellColor(
                      cell.level
                    )}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip Hover Display & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800/80">
        {/* Dynamic Cell Details on Hover */}
        <div className="min-h-[28px] flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
          {hoveredCell ? (
            <div className="flex items-center gap-2 flex-wrap animate-fadeIn">
              <span className="font-bold text-neutral-900 dark:text-white">
                {hoveredCell.dayName} · {hoveredCell.hourLabel}:
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Clock className="w-3.5 h-3.5" /> {hoveredCell.totalMinutes} {t.statistics.minutesUnit}
              </span>
              <span className="text-neutral-400">|</span>
              <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {hoveredCell.completedCount}
                <XCircle className="w-3.5 h-3.5 text-rose-400 ml-1" /> {hoveredCell.cancelledCount}
              </span>
              {hoveredCell.averageAiScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" /> AI {hoveredCell.averageAiScore}%
                </span>
              )}
            </div>
          ) : (
            <span className="text-neutral-400 dark:text-neutral-500 italic text-xs">
              Di chuột qua từng ô để xem chi tiết thời gian tập trung và điểm AI
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 select-none ml-auto">
          <span>{t.statistics.legendLess}</span>
          <div className="w-3 h-3 rounded-xs bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/40" />
          <div className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-900/60" />
          <div className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-800/80 border border-emerald-500 dark:border-emerald-700/60" />
          <div className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-500" />
          <div className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-300" />
          <span>{t.statistics.legendMore}</span>
        </div>
      </div>
    </section>
  );
}
