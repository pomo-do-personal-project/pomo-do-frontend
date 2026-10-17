"use client";

import React from "react";
import { Sun, CloudSun, Moon } from "lucide-react";
import { TaskDto } from "../../types/api";
import { TimeOfDay } from "./types";
import { TimelineTaskCard } from "./TimelineTaskCard";

interface TimelineSectionProps {
  timeOfDay: TimeOfDay;
  title: string;
  timeRange: string;
  tasks: TaskDto[];
  isGoldenHour?: boolean;
  selectedTaskId?: string;
  onSelectTask: (task: TaskDto) => void;
  onToggleStatus: (id: string, e: React.MouseEvent) => void;
  onNavigateToTimer?: () => void;
}

export function TimelineSection({
  timeOfDay,
  title,
  timeRange,
  tasks,
  isGoldenHour = false,
  selectedTaskId,
  onSelectTask,
  onToggleStatus,
  onNavigateToTimer,
}: TimelineSectionProps) {
  const getIcon = () => {
    switch (timeOfDay) {
      case "morning":
        return <Sun size={16} className="text-amber-500" />;
      case "afternoon":
        return <CloudSun size={16} className="text-orange-500" />;
      default:
        return <Moon size={16} className="text-indigo-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-2.5 mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
            {title}
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            ({timeRange})
          </span>
        </div>

        {isGoldenHour && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            Khung giờ vàng
          </span>
        )}
      </div>

      {/* Task List in this window */}
      {tasks.length === 0 ? (
        <div className="p-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Chưa có công việc nào được lên lịch cho buổi này
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TimelineTaskCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
              onToggleStatus={onToggleStatus}
              onNavigateToTimer={onNavigateToTimer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
