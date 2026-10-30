"use client";

import React, { useState, useMemo, useEffect } from "react";
import { TaskDto, Priority } from "../../types/api";
import { DayInfo, CalendarTimelineProps } from "./types";
import { CalendarDayStrip } from "./CalendarDayStrip";
import { TimelineSection } from "./TimelineSection";
import { parseTaskDueDate, formatLocalDate } from "../../utils/dateUtils";
import { useAuthStore } from "../../stores/useAuthStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useFocusInsightsStore } from "../../stores/useFocusInsightsStore";

export function CalendarTimelineView({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleStatus,
  onNavigateToTimer,
}: CalendarTimelineProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const todayStr = useMemo(() => formatLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { goldenHour, deepFlowPercentage, totalSessionsAnalyzed, fetchInsights } = useFocusInsightsStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchInsights();
    }
  }, [isAuthenticated, fetchInsights]);

  // Tính 7 ngày trong tuần theo currentWeekOffset sử dụng local date
  const { days, weekLabel } = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + currentWeekOffset * 7);

    const dayOfWeek = baseDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);

    const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const generatedDays: DayInfo[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = formatLocalDate(d);

      const dayTasks = tasks.filter((t) => {
        if (t.isQuickAdd) return false;
        if (t.dueDate) {
          return parseTaskDueDate(t.dueDate).dateStr === dStr;
        }
        return dStr === todayStr;
      });

      const totalPomos = dayTasks.reduce((acc, t) => acc + (t.estimatedPomodoros || 1), 0);
      const completedPomos = dayTasks.reduce((acc, t) => acc + (t.completedPomodoros || 0), 0);

      generatedDays.push({
        dateStr: dStr,
        dayLabel: dayLabels[i],
        dayNumber: d.getDate(),
        isToday: dStr === todayStr,
        totalPomos,
        completedPomos,
      });
    }

    const startMonth = monday.getMonth() + 1;
    const year = monday.getFullYear();
    return { days: generatedDays, weekLabel: `Tháng ${startMonth}/${year}` };
  }, [currentWeekOffset, tasks, todayStr]);

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.isQuickAdd) return false;
      if (t.dueDate) {
        return parseTaskDueDate(t.dueDate).dateStr === selectedDate;
      }
      return selectedDate === todayStr;
    });
  }, [tasks, selectedDate, todayStr]);

  const { morningTasks, eveningTasks } = useMemo(() => {
    const morning: TaskDto[] = [];
    const evening: TaskDto[] = [];

    dayTasks.forEach((t) => {
      const { hasTime, ampm } = parseTaskDueDate(t.dueDate);
      if (hasTime && ampm) {
        if (ampm === "AM") morning.push(t);
        else evening.push(t);
      } else if (t.priority === Priority.ImportantUrgent || t.priority === Priority.ImportantNotUrgent) {
        morning.push(t);
      } else {
        evening.push(t);
      }
    });

    const sortSection = (list: TaskDto[]) =>
      [...list].sort((a, b) => {
        const aInfo = parseTaskDueDate(a.dueDate);
        const bInfo = parseTaskDueDate(b.dueDate);
        if (aInfo.hasTime && bInfo.hasTime) {
          return (aInfo.hour! * 60 + (aInfo.minute || 0)) - (bInfo.hour! * 60 + (bInfo.minute || 0));
        }
        if (aInfo.hasTime && !bInfo.hasTime) return -1;
        if (!aInfo.hasTime && bInfo.hasTime) return 1;
        return (a.priority || 0) - (b.priority || 0);
      });

    return {
      morningTasks: sortSection(morning),
      eveningTasks: sortSection(evening),
    };
  }, [dayTasks]);

  const totalDayTasks = dayTasks.length;
  const completedDayTasks = dayTasks.filter((t) => t.status === 3).length;
  const hasRealGoldenHour = Boolean(goldenHour && totalSessionsAnalyzed >= 3);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-2">
      <CalendarDayStrip
        days={days}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevWeek={() => setCurrentWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setCurrentWeekOffset((prev) => prev + 1)}
        onToday={() => {
          setCurrentWeekOffset(0);
          setSelectedDate(todayStr);
        }}
        weekLabel={weekLabel}
      />

      <div
        className={`mb-6 px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
          wallpaperUrl
            ? "bg-white/15 backdrop-blur-md border-white/20 text-white shadow-sm"
            : "bg-neutral-100/60 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800/80"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-xs" />
          {hasRealGoldenHour ? (
            <>
              <span
                className={`font-semibold ${
                  wallpaperUrl ? "text-white drop-shadow-xs" : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Khung giờ vàng: {goldenHour}
              </span>
              <span className={`text-[11px] ${wallpaperUrl ? "text-white/80" : "text-neutral-400"}`}>
                (Độ tập trung {deepFlowPercentage}%)
              </span>
            </>
          ) : (
            <span
              className={`font-semibold ${
                wallpaperUrl ? "text-white/80" : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Đang thu thập nhịp sinh học (cần &gt;= 3 phiên)
            </span>
          )}
        </div>

        {totalDayTasks > 0 && (
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              wallpaperUrl ? "text-white" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <span className={wallpaperUrl ? "text-white/80 text-[11px]" : "text-neutral-400 text-[11px]"}>
              Tiến độ:
            </span>
            <span className={wallpaperUrl ? "text-emerald-300 font-extrabold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
              {completedDayTasks}/{totalDayTasks}
            </span>
            <span className={wallpaperUrl ? "text-white/80 text-[11px]" : "text-neutral-400 text-[11px]"}>
              việc
            </span>
          </div>
        )}
      </div>

      <TimelineSection
        timeOfDay="morning"
        title="Buổi sáng"
        timeRange="AM • Trước 12:00"
        tasks={morningTasks}
        isGoldenHour={hasRealGoldenHour}
        selectedTaskId={selectedTaskId}
        onSelectTask={onSelectTask}
        onToggleStatus={onToggleStatus}
        onNavigateToTimer={onNavigateToTimer}
      />

      <TimelineSection
        timeOfDay="evening"
        title="Buổi tối"
        timeRange="PM • Sau 12:00"
        tasks={eveningTasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={onSelectTask}
        onToggleStatus={onToggleStatus}
        onNavigateToTimer={onNavigateToTimer}
      />
    </div>
  );
}
