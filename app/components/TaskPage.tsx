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
import { AlertTriangle, RotateCcw, Zap, CalendarDays, Menu, Undo2 } from "lucide-react";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { useFilteredTasks } from "./tasks/hooks/useFilteredTasks";
import { formatLocalDate } from "../utils/dateUtils";
import { useSettingsStore } from "../stores/useSettingsStore";
import { ConfirmModal } from "./ui/ConfirmModal";
import { taskService } from "../services/taskService";

export * from "./tasks/types";

interface TaskPageProps {
  onNavigateToTimer?: () => void;
}

export function TaskPage({ onNavigateToTimer }: TaskPageProps = {}) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [undoToast, setUndoToast] = useState<{ id: string; title: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

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
    if (!undoToast) return;
    const timer = setTimeout(() => setUndoToast(null), 6000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  useEffect(() => {
    function handleOutsideDetailClick(event: MouseEvent) {
      if (isResizing || !selectedTask || taskToDelete) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[role="dialog"], [role="alertdialog"]')) return;
      if (detailPanelRef.current && detailPanelRef.current.contains(target)) return;
      if (target.closest("[data-task-item]")) return;
      selectTask(null);
    }

    document.addEventListener("mousedown", handleOutsideDetailClick);
    return () => document.removeEventListener("mousedown", handleOutsideDetailClick);
  }, [isResizing, selectedTask, taskToDelete, selectTask, detailPanelRef]);

  const { allTags, categoryCounts, filteredTasks } = useFilteredTasks(tasks, currentCategory, selectedTag);

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

  const handleUndoDelete = async () => {
    if (!undoToast || isRestoring) return;
    const deletedId = undoToast.id;
    setIsRestoring(true);
    try {
      const restored = await taskService.restoreTask(deletedId);
      await fetchTasks();
      if (restored) selectTask(restored);
      setUndoToast(null);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-transparent relative">
      <TaskSidebar
        currentCategory={currentCategory} onSelectCategory={setCurrentCategory}
        selectedTag={selectedTag} onSelectTag={setSelectedTag}
        categoryCounts={categoryCounts} allTags={allTags} totalTasks={tasks.length}
        isOpenMobile={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDesktopCollapsed={isDesktopSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-20 md:pb-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button" onClick={handleToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                wallpaperUrl ? "bg-white/15 border-white/20 text-white" : "bg-white border-neutral-200 text-neutral-800 shadow-2xs"
              }`}
              title={isDesktopSidebarCollapsed ? "Mở thanh danh mục" : "Thu gọn thanh danh mục"}
              aria-label="Thu gọn hoặc mở danh mục công việc"
            >
              <Menu size={18} strokeWidth={2} />
            </button>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${wallpaperUrl ? "text-white drop-shadow-md" : "text-neutral-900 dark:text-white"}`}>
              {currentCategory === "QuickAdd" ? (
                <><Zap size={26} strokeWidth={2} className="text-amber-500 shrink-0 drop-shadow-sm" /><span>Quick Add (Ý nghĩ phát sinh)</span></>
              ) : currentCategory === "Calendar" ? (
                <><CalendarDays size={26} strokeWidth={2} className={`shrink-0 ${wallpaperUrl ? "text-white drop-shadow-sm" : "text-neutral-700 dark:text-neutral-200"}`} /><span>Lịch biểu tập trung</span></>
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
            <span className={`text-xs animate-pulse font-mono ${wallpaperUrl ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"}`}>
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
              <button onClick={() => fetchTasks()} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors cursor-pointer text-[11px] flex items-center gap-1">
                <span>Thử lại</span><RotateCcw size={12} strokeWidth={2} />
              </button>
              <button onClick={clearError} className="px-2 py-1 text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-100 font-medium cursor-pointer text-[11px]">
                Đóng
              </button>
            </div>
          </div>
        )}

        {currentCategory === "Calendar" ? (
          <CalendarTimelineView
            tasks={tasks} selectedTaskId={selectedTask?.id}
            onSelectTask={selectTask} onToggleStatus={handleToggleTask}
            onNavigateToTimer={onNavigateToTimer}
          />
        ) : (
          <>
            <TaskQuickAdd currentCategory={currentCategory} onAddTask={handleAddNewTask} />
            <TaskList
              tasks={filteredTasks} selectedTaskId={selectedTask?.id}
              currentCategory={currentCategory} isLoading={isLoading}
              onSelectTask={selectTask} onToggleStatus={handleToggleTask}
            />
          </>
        )}
      </main>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask} detailWidth={detailWidth} isResizing={isResizing}
          onStartResize={startResizing} onClose={() => selectTask(null)}
          onDelete={async (id) => setTaskToDelete(id)} onNavigateToTimer={onNavigateToTimer}
          detailPanelRef={detailPanelRef}
        />
      )}

      {undoToast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl border border-neutral-700 dark:border-neutral-200 flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <span className="truncate max-w-[220px] sm:max-w-xs">Đã xóa &ldquo;{undoToast.title}&rdquo;</span>
          <button
            type="button" onClick={handleUndoDelete} disabled={isRestoring}
            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Undo2 size={13} />
            <span>{isRestoring ? "Đang khôi phục..." : "Hoàn tác"}</span>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Xóa công việc"
        message="Bạn có chắc chắn muốn xóa công việc này? Công việc sẽ được chuyển vào mục Thùng rác."
        confirmText="Xóa công việc"
        cancelText="Giữ lại"
        danger={true}
        onConfirm={async () => {
          if (taskToDelete) {
            const targetTitle = tasks.find((t) => t.id === taskToDelete)?.title || "Công việc";
            const deletedId = taskToDelete;
            const ok = await deleteTask(deletedId);
            selectTask(null);
            setTaskToDelete(null);
            if (ok) {
              setUndoToast({ id: deletedId, title: targetTitle });
            }
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
