"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { TaskStatus, Priority } from "../types/api";
import { X } from "lucide-react";
import { OverviewStatsCards } from "./overview/OverviewStatsCards";
import { OverviewTaskDropdown } from "./overview/OverviewTaskDropdown";
import { OverviewTaskList } from "./overview/OverviewTaskList";

interface OverviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OverviewPanel({ isOpen, onClose }: OverviewPanelProps) {
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
    <aside
      className={`fixed top-0 right-0 bottom-0 z-30 flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-200/80 dark:border-neutral-800/80 select-none shadow-sm transition-[width] duration-300 ease-in-out ${
        isOpen ? "w-80 sm:w-96 visible" : "w-0 overflow-hidden invisible border-none"
      }`}
    >
      <div className="w-80 sm:w-96 flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Panel Header */}
        <div className="h-14 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 mb-6 shrink-0 -mt-6">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Tổng quan
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng Tổng quan"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
  );
}
