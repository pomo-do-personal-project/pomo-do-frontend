"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Priority, TaskStatus } from "../types/api";
import { TaskCategory } from "./tasks/types";
import { TaskSidebar } from "./tasks/TaskSidebar";
import { TaskQuickAdd } from "./tasks/TaskQuickAdd";
import { TaskList } from "./tasks/TaskList";
import { TaskDetailDrawer } from "./tasks/TaskDetailDrawer";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Re-export types for backward compatibility with MatrixPage and other consumers
export * from "./tasks/types";

export function TaskPage() {
  const {
    tasks,
    selectedTask,
    isLoading,
    error,
    fetchTasks,
    selectTask,
    createTask,
    toggleTaskStatus,
    deleteTask,
    clearError,
  } = useTaskStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [currentCategory, setCurrentCategory] = useState<TaskCategory>("Today");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Detail panel resizing
  const [detailWidth, setDetailWidth] = useState<number>(384);
  const [isResizing, setIsResizing] = useState(false);
  const detailWidthRef = useRef<number>(384);
  const detailPanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedWidth = localStorage.getItem("pomo-task-detail-width");
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed) && parsed >= 280 && parsed <= 750) {
        setDetailWidth(parsed);
        detailWidthRef.current = parsed;
      }
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(300, Math.min(newWidth, Math.min(750, window.innerWidth - 350)));
        detailWidthRef.current = clampedWidth;
        setDetailWidth(clampedWidth);
      });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        localStorage.setItem("pomo-task-detail-width", detailWidthRef.current.toString());
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      useTaskStore.getState().resetTaskStore();
    }
  }, [fetchTasks, isAuthenticated]);

  // Close detail on outside click
  useEffect(() => {
    function handleOutsideDetailClick(event: MouseEvent) {
      if (isResizing || !selectedTask) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (detailPanelRef.current && detailPanelRef.current.contains(target)) {
        return;
      }

      if (target.closest("[data-task-item]")) {
        return;
      }

      selectTask(null);
    }

    document.addEventListener("mousedown", handleOutsideDetailClick);
    return () => document.removeEventListener("mousedown", handleOutsideDetailClick);
  }, [isResizing, selectedTask, selectTask]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => {
      t.tags?.forEach((tg) => tagSet.add(tg.name));
    });
    return Array.from(tagSet);
  }, [tasks]);

  const categoryCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      Today: tasks.filter((t) => !t.isQuickAdd && (!t.dueDate || t.dueDate.startsWith(todayStr))).length,
      Upcoming: tasks.filter((t) => !t.isQuickAdd && t.dueDate && !t.dueDate.startsWith(todayStr)).length,
      QuickAdd: tasks.filter((t) => t.isQuickAdd).length,
      Calendar: tasks.length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return tasks.filter((t) => {
      if (currentCategory === "QuickAdd") {
        if (!t.isQuickAdd) return false;
      } else if (currentCategory === "Today") {
        if (t.isQuickAdd) return false;
        if (t.dueDate && !t.dueDate.startsWith(todayStr)) {
          return false;
        }
      } else if (currentCategory === "Upcoming") {
        if (t.isQuickAdd) return false;
        if (!t.dueDate || t.dueDate.startsWith(todayStr)) {
          return false;
        }
      }

      if (selectedTag !== "All") {
        if (!t.tags?.some((tg) => tg.name === selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, currentCategory, selectedTag]);

  const handleAddNewTask = async (title: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
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
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* 1. Left Category Sidebar */}
      <TaskSidebar
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        categoryCounts={categoryCounts}
        allTags={allTags}
        totalTasks={tasks.length}
      />

      {/* 2. Middle Main Area: Task List */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {currentCategory === "QuickAdd" ? "⚡ Quick Add (Ý nghĩ phát sinh)" : currentCategory}
          </h1>
          {isLoading && (
            <span className="text-xs text-neutral-400 animate-pulse font-mono">
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

        {/* Quick Add Input Bar */}
        <TaskQuickAdd currentCategory={currentCategory} onAddTask={handleAddNewTask} />

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          selectedTaskId={selectedTask?.id}
          currentCategory={currentCategory}
          isLoading={isLoading}
          onSelectTask={selectTask}
          onToggleStatus={handleToggleTask}
        />
      </main>

      {/* 3. Right Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          detailWidth={detailWidth}
          isResizing={isResizing}
          onStartResize={() => setIsResizing(true)}
          onClose={() => selectTask(null)}
          onDelete={handleDeleteTask}
          detailPanelRef={detailPanelRef}
        />
      )}
    </div>
  );
}
