"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Priority } from "../types/api";
import { TaskCategory } from "./tasks/types";
import { TaskSidebar } from "./tasks/TaskSidebar";
import { TaskQuickAdd } from "./tasks/TaskQuickAdd";
import { TaskList } from "./tasks/TaskList";
import { TaskDetailDrawer } from "./tasks/TaskDetailDrawer";
import { CalendarTimelineView } from "./calendar/CalendarTimelineView";
import { AlertTriangle, RotateCcw, Zap, CalendarDays, Menu } from "lucide-react";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { useFilteredTasks } from "./tasks/hooks/useFilteredTasks";
import { formatLocalDate } from "../utils/dateUtils";
import { useSettingsStore } from "../stores/useSettingsStore";

export * from "./tasks/types";

interface TaskPageProps {
  onNavigateToTimer?: () => void;
}

export function TaskPage({ onNavigateToTimer }: TaskPageProps = {}) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  const { tasks, selectedTask, isLoading, error, fetchTasks, selectTask, createTask, toggleTaskStatus, deleteTask, clearError } = useTaskStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>("Today");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const { width: detailWidth, isResizing, panelRef: detailPanelRef, startResizing } = useResizablePanel({
    storageKey: "pomo-task-detail-width",
    defaultWidth: 384,
    minWidth: 280,
    maxWidth: 750,
  });

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsDesktopSidebarCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      useTaskStore.getState().resetTaskStore();
    }
  }, [fetchTasks, isAuthenticated]);

  useEffect(() => {
    function handleOutsideDetailClick(event: MouseEvent) {
      if (isResizing || !selectedTask) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (detailPanelRef.current && detailPanelRef.current.contains(target)) return;
      if (target.closest("[data-task-item]")) return;
      selectTask(null);
    }

    document.addEventListener("mousedown", handleOutsideDetailClick);
    return () => document.removeEventListener("mousedown", handleOutsideDetailClick);
  }, [isResizing, selectedTask, selectTask, detailPanelRef]);

  const { allTags, categoryCounts, filteredTasks } = useFilteredTasks(
    tasks,
    currentCategory,
    selectedTag
  );

  const handleAddNewTask = async (title: string) => {
    const todayStr = formatLocalDate();
    const isQuick = currentCategory === "QuickAdd";

    await createTask({
      title,
      priority: Priority.ImportantNotUrgent,
      estimatedMinutes: isQuick ? 15 : 25,
      isQuickAdd: isQuick,
      dueDate: currentCategory === "Today" ? `${todayStr}T23:59:59.000Z` : undefined,
    });
  };

  const handleToggleTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleTaskStatus(id);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      await deleteTask(id);
      selectTask(null);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-transparent">
      <TaskSidebar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        categoryCounts={categoryCounts}
        allTags={allTags}
        totalTasks={tasks.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDesktopCollapsed={isDesktopSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-20 md:pb-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                wallpaperUrl
                  ? "bg-white/15 border-white/20 text-white"
                  : "bg-white border-neutral-200 text-neutral-800 shadow-2xs"
              }`}
              title={isDesktopSidebarCollapsed ? "Mở thanh danh mục" : "Thu gọn thanh danh mục"}
              aria-label="Thu gọn hoặc mở danh mục công việc"
            >
              <Menu size={18} strokeWidth={2} />
            </button>

            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${
                wallpaperUrl ? "text-white drop-shadow-md" : "text-neutral-900 dark:text-white"
              }`}
            >
            {currentCategory === "QuickAdd" ? (
              <>
                <Zap size={26} strokeWidth={2} className="text-amber-500 shrink-0 drop-shadow-sm" />
                <span>Quick Add (Ý nghĩ phát sinh)</span>
              </>
            ) : currentCategory === "Calendar" ? (
              <>
                <CalendarDays
                  size={26}
                  strokeWidth={2}
                  className={`shrink-0 ${
                    wallpaperUrl ? "text-white drop-shadow-sm" : "text-neutral-700 dark:text-neutral-200"
                  }`}
                />
                <span>Lịch biểu tập trung</span>
              </>
            ) : currentCategory === "Today" ? (
              <span>Hôm nay</span>
            ) : currentCategory === "Upcoming" ? (
              <span>Sắp tới</span>
            ) : (
              currentCategory
            )}
          </h1>
        </div>

          {isLoading && (
            <span
              className={`text-xs animate-pulse font-mono ${
                wallpaperUrl ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              Đang đồng bộ...
            </span>
          )}
        </div>

        {error && isAuthenticated && !error.toLowerCase().includes("unauthorized") && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} strokeWidth={1.75} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTasks()}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors cursor-pointer text-[11px] flex items-center gap-1"
              >
                <span>Thử lại</span>
                <RotateCcw size={12} strokeWidth={2} />
              </button>
              <button
                onClick={clearError}
                className="px-2 py-1 text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-100 font-medium cursor-pointer text-[11px]"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {currentCategory === "Calendar" ? (
          <CalendarTimelineView
            tasks={tasks}
            selectedTaskId={selectedTask?.id}
            onSelectTask={selectTask}
            onToggleStatus={handleToggleTask}
            onNavigateToTimer={onNavigateToTimer}
          />
        ) : (
          <>
            <TaskQuickAdd currentCategory={currentCategory} onAddTask={handleAddNewTask} />
            <TaskList
              tasks={filteredTasks}
              selectedTaskId={selectedTask?.id}
              currentCategory={currentCategory}
              isLoading={isLoading}
              onSelectTask={selectTask}
              onToggleStatus={handleToggleTask}
            />
          </>
        )}
      </main>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          detailWidth={detailWidth}
          isResizing={isResizing}
          onStartResize={startResizing}
          onClose={() => selectTask(null)}
          onDelete={handleDeleteTask}
          onNavigateToTimer={onNavigateToTimer}
          detailPanelRef={detailPanelRef}
        />
      )}
    </div>
  );
}
