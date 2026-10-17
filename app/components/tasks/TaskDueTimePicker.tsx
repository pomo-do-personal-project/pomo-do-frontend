"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { parseTaskDueDate, buildDueDateTimeIso, formatLocalDate } from "../../utils/dateUtils";

interface TaskDueTimePickerProps {
  dueDate?: string | null;
  onSaveDueDate: (newIso: string | null) => void;
}

export function TaskDueTimePicker({ dueDate, onSaveDueDate }: TaskDueTimePickerProps) {
  const [date, setDate] = useState(() => {
    const parsed = parseTaskDueDate(dueDate);
    return parsed.dateStr || formatLocalDate();
  });
  const [time, setTime] = useState(() => parseTaskDueDate(dueDate).timeStr);

  useEffect(() => {
    const parsed = parseTaskDueDate(dueDate);
    setDate(parsed.dateStr || formatLocalDate());
    setTime(parsed.timeStr);
  }, [dueDate]);

  const handleUpdate = (nextDate: string, nextTime: string) => {
    const iso = buildDueDateTimeIso(nextDate, nextTime);
    onSaveDueDate(iso);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    handleUpdate(newDate, time);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    handleUpdate(date, newTime);
  };

  const handleClearTime = () => {
    setTime("");
    handleUpdate(date, "");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Hạn chót (Ngày) */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1.5">
          <Calendar size={13} className="text-neutral-400" />
          <span>Hạn chót</span>
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] transition-colors"
        />
      </div>

      {/* Khung giờ */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1.5">
          <Clock size={13} className="text-neutral-400" />
          <span>Khung giờ</span>
        </span>

        <div className="flex items-center gap-1.5">
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] transition-colors"
          />

          {time && (
            <button
              type="button"
              onClick={handleClearTime}
              title="Xóa giờ (cả ngày)"
              className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
