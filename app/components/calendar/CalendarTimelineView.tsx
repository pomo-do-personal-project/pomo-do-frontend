"use client";

import React, { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { TaskDto, Priority } from "../../types/api";
import { DayInfo, CalendarTimelineProps } from "./types";
import { CalendarDayStrip } from "./CalendarDayStrip";
import { TimelineSection } from "./TimelineSection";
import { parseTaskDueDate, formatLocalDate } from "../../utils/dateUtils";

export function CalendarTimelineView({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleStatus,
  onNavigateToTimer,
}: CalendarTimelineProps) {
  const todayStr = useMemo(() => formatLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);

  // Tính 7 ngày trong tuần theo currentWeekOffset sử dụng local date
  const { days, weekLabel } = useMemo(() => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + currentWeekOffset * 7);

    // Tìm ngày Thứ Hai của tuần đó
    const dayOfWeek = baseDate.getDay(); // 0 (CN) -> 6 (T7)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday);

    const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const generatedDays: DayInfo[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = formatLocalDate(d);

      // Đếm pomos cho ngày này
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
    const label = `Tháng ${startMonth}/${year}`;

    return { days: generatedDays, weekLabel: label };
  }, [currentWeekOffset, tasks, todayStr]);

  // Lọc danh sách công việc của ngày được chọn
  const dayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.isQuickAdd) return false;
      if (t.dueDate) {
        return parseTaskDueDate(t.dueDate).dateStr === selectedDate;
      }
      return selectedDate === todayStr;
    });
  }, [tasks, selectedDate, todayStr]);

  // Phân bổ và sắp xếp công việc theo AM (Buổi sáng) và PM (Buổi tối)
  const { morningTasks, eveningTasks } = useMemo(() => {
    const morning: TaskDto[] = [];
    const evening: TaskDto[] = [];

    dayTasks.forEach((t) => {
      const { hasTime, ampm } = parseTaskDueDate(t.dueDate);

      if (hasTime && ampm) {
        // Xếp theo AM và PM do người dùng đặt
        if (ampm === "AM") {
          morning.push(t);
        } else {
          evening.push(t);
        }
      } else {
        // Việc cả ngày: Q1 & Q2 vào sáng, Q3 & Q4 vào tối
        if (
          t.priority === Priority.ImportantUrgent ||
          t.priority === Priority.ImportantNotUrgent
        ) {
          morning.push(t);
        } else {
          evening.push(t);
        }
      }
    });

    // Sắp xếp thứ tự thời gian AM và PM
    const sortSection = (list: TaskDto[]) => {
      return [...list].sort((a, b) => {
        const aInfo = parseTaskDueDate(a.dueDate);
        const bInfo = parseTaskDueDate(b.dueDate);

        if (aInfo.hasTime && bInfo.hasTime) {
          return (aInfo.hour! * 60 + (aInfo.minute || 0)) - (bInfo.hour! * 60 + (bInfo.minute || 0));
        }
        if (aInfo.hasTime && !bInfo.hasTime) return -1;
        if (!aInfo.hasTime && bInfo.hasTime) return 1;
        return (a.priority || 0) - (b.priority || 0);
      });
    };

    return {
      morningTasks: sortSection(morning),
      eveningTasks: sortSection(evening),
    };
  }, [dayTasks]);

  const totalDayTasks = dayTasks.length;
  const completedDayTasks = dayTasks.filter((t) => t.status === 3).length;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-2">
      {/* 7-Day Navigation Strip */}
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

      {/* Sleek Summary Strip */}
      <div className="mb-6 px-4 py-2.5 rounded-xl bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Khung giờ vàng: 09:00 - 11:30 AM
          </span>
          <span className="text-[11px] text-neutral-400">
            (Độ tập trung 94%)
          </span>
        </div>

        {totalDayTasks > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span className="text-neutral-400 text-[11px]">Tiến độ:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completedDayTasks}/{totalDayTasks}</span>
            <span className="text-neutral-400 text-[11px]">việc</span>
          </div>
        )}
      </div>

      {/* Timeline Stream: Sáng (AM) & Tối (PM) */}
      <TimelineSection
        timeOfDay="morning"
        title="Buổi sáng"
        timeRange="AM • Trước 12:00"
        tasks={morningTasks}
        isGoldenHour={true}
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
