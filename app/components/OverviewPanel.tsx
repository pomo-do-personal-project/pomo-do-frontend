"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { TaskStatus, Priority } from "../types/api";
import { X } from "lucide-react";
import { OverviewStatsCards } from "./overview/OverviewStatsCards";
import { OverviewTaskDropdown } from "./overview/OverviewTaskDropdown";
import { OverviewTaskList } from "./overview/OverviewTaskList";
import { useSettingsStore } from "../stores/useSettingsStore";

interface OverviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OverviewPanel({ isOpen, onClose }: OverviewPanelProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const { tasks, isLoading, isSaving, fetchTasks, createTask, toggleTaskStatus } = useTaskStore();
  const [isQuickAddActive, setIsQuickAddActive] = useState(false);

  useEffect(() => {
    // Chỉ gọi fetchTasks nếu user đang có phiên đăng nhập (tránh lỗi 401 khi ở chế độ guest)
    const authed = typeof window !== "undefined" && !!localStorage.getItem("pomo-auth-storage");
    if (isOpen && authed) {
      fetchTasks();
    }
  }, [isOpen, fetchTasks]);

  // Filter tasks based on mode: Quick Add tasks vs Planned/Daily tasks
  const quickAddTasks = React.useMemo(() => tasks.filter((t) => t.isQuickAdd), [tasks]);
  const dailyTasks = React.useMemo(() => tasks.filter((t) => !t.isQuickAdd), [tasks]);

  const handleAddTask = async (title: string) => {
    try {
      await createTask({
        title,
        priority: Priority.ImportantNotUrgent,
        estimatedMinutes: 25,
        estimatedPomodoros: 1,
        isQuickAdd: isQuickAddActive,
      });
    } catch {
      // Handled in store
    }
  };

  const completedCount = tasks.filter((t) => t.status === TaskStatus.Completed).length;
  const totalMinutes = tasks.reduce(
    (acc, t) => acc + (t.status === TaskStatus.Completed ? t.estimatedMinutes || 25 : 0),
    0
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-30 flex flex-col backdrop-blur-2xl select-none shadow-2xl transition-[width,transform] duration-300 ease-in-out ${
          wallpaperUrl
            ? "bg-neutral-950/85 border-l border-white/15 text-white"
            : "bg-white/98 border-l border-neutral-200 text-neutral-900"
        } ${
          isOpen ? "w-full max-w-[340px] sm:w-96 visible translate-x-0" : "w-0 overflow-hidden invisible border-none translate-x-full"
        }`}
      >
        <div className="w-full sm:w-96 flex-1 flex flex-col p-5 sm:p-6 overflow-y-auto">
        {/* Panel Header */}
        <div
          className={`h-14 flex items-center justify-between border-b mb-6 shrink-0 -mt-6 ${
            wallpaperUrl ? "border-white/15" : "border-neutral-200"
          }`}
        >
          <h2
            className={`text-lg font-bold tracking-tight ${
              wallpaperUrl ? "text-white" : "text-neutral-900"
            }`}
          >
            Tổng quan
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng Tổng quan"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              wallpaperUrl
                ? "text-white/60 hover:text-white hover:bg-white/15"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Stats Section */}
        <OverviewStatsCards
          totalMinutes={totalMinutes}
          completedCount={completedCount}
          totalTasks={tasks.length}
        />

        {/* Mode Selector */}
        <OverviewTaskDropdown
          isQuickAddActive={isQuickAddActive}
          onSelectMode={setIsQuickAddActive}
          dailyCount={dailyTasks.length}
          quickAddCount={quickAddTasks.length}
        />

        {/* Task List or Quick Add View */}
        <OverviewTaskList
          isQuickAddActive={isQuickAddActive}
          quickAddTasks={quickAddTasks}
          dailyTasks={dailyTasks}
          isLoading={isLoading}
          isSaving={isSaving}
          onAddTask={handleAddTask}
          onToggleTask={toggleTaskStatus}
        />
      </div>
    </aside>
    </>
  );
}
