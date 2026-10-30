"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { DayInfo } from "./types";
import { useSettingsStore } from "../../stores/useSettingsStore";

interface CalendarDayStripProps {
  days: DayInfo[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  weekLabel: string;
}

export function CalendarDayStrip({
  days,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  weekLabel,
}: CalendarDayStripProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);

  return (
    <div className="flex flex-col gap-3 mb-6 select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevWeek}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              wallpaperUrl
                ? "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
            title="Tuần trước"
            aria-label="Tuần trước"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className={`text-xs sm:text-sm font-bold px-1 ${
              wallpaperUrl ? "text-white drop-shadow-md" : "text-neutral-900 dark:text-white"
            }`}
          >
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={onNextWeek}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              wallpaperUrl
                ? "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
            title="Tuần kế tiếp"
            aria-label="Tuần kế tiếp"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onToday}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            wallpaperUrl
              ? "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs shadow-xs"
              : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <CalendarIcon size={13} className="text-rose-500" />
          <span>Hôm nay</span>
        </button>
      </div>

      {/* 7 Days Strip */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = day.dateStr === selectedDate;
          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? wallpaperUrl
                    ? "bg-white text-neutral-950 border-white shadow-lg scale-[1.02]"
                    : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md scale-[1.02]"
                  : wallpaperUrl
                    ? "bg-white/15 backdrop-blur-md border-white/20 text-white hover:bg-white/25 hover:border-white/30"
                    : "bg-white/60 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected
                    ? wallpaperUrl ? "text-neutral-600 font-extrabold" : "opacity-80"
                    : wallpaperUrl ? "text-white/70" : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {day.dayLabel}
              </span>
              <span className={`text-base sm:text-lg font-black tracking-tight my-0.5 ${isSelected && wallpaperUrl ? "text-neutral-950" : ""}`}>
                {day.dayNumber}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {day.totalPomos > 0 ? (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? wallpaperUrl
                          ? "bg-neutral-900/10 text-neutral-800"
                          : "bg-white/20 dark:bg-neutral-900/20"
                        : wallpaperUrl
                          ? "bg-white/15 text-white/90"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {day.completedPomos}/{day.totalPomos}
                  </span>
                ) : (
                  <span className={`text-[10px] ${wallpaperUrl ? "text-white/50" : "opacity-40"}`}>•</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
