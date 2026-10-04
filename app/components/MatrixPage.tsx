"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { Priority, TaskStatus } from "../types/api";
import { MatrixQuadrant, PRIORITY_MAP, REVERSE_PRIORITY_MAP } from "./TaskPage";
import { Plus, X, Check } from "lucide-react";

const QUADRANTS: {
  id: MatrixQuadrant;
  priority: Priority;
  title: string;
  subtitle: string;
  borderColor: string;
  badgeBg: string;
}[] = [
  {
    id: "urgent-important",
    priority: Priority.ImportantUrgent,
    title: "Urgent & Important",
    subtitle: "Do First (Làm ngay)",
    borderColor: "border-rose-400/80 dark:border-rose-500/60",
    badgeBg: "bg-rose-500 text-white",
  },
  {
    id: "not-urgent-important",
    priority: Priority.ImportantNotUrgent,
    title: "Not Urgent & Important",
    subtitle: "Schedule (Lên kế hoạch)",
    borderColor: "border-blue-400/80 dark:border-blue-500/60",
    badgeBg: "bg-blue-500 text-white",
  },
  {
    id: "urgent-not-important",
    priority: Priority.NotImportantUrgent,
    title: "Urgent & Not Important",
    subtitle: "Delegate (Ủy quyền / Việc gấp)",
    borderColor: "border-amber-400/80 dark:border-amber-500/60",
    badgeBg: "bg-amber-500 text-white",
  },
  {
    id: "not-urgent-not-important",
    priority: Priority.NotImportantNotUrgent,
    title: "Not Urgent & Not Important",
    subtitle: "Don't Do (Loại bỏ / Thư giãn)",
    borderColor: "border-neutral-400/80 dark:border-neutral-600/60",
    badgeBg: "bg-neutral-500 text-white",
  },
];

export function MatrixPage() {
  const { tasks, isLoading, isSaving, fetchTasks, createTask, toggleTaskStatus, deleteTask } =
    useTaskStore();

  const [activeInputQuadrant, setActiveInputQuadrant] = useState<MatrixQuadrant | null>(null);
  const [quickInput, setQuickInput] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (quadrant: MatrixQuadrant) => {
    if (!quickInput.trim() || isSaving) return;
    const targetPriority = PRIORITY_MAP[quadrant];

    try {
      await createTask({
        title: quickInput.trim(),
        priority: targetPriority,
        estimatedMinutes: 30,
        estimatedPomodoros: 1,
      });
      setQuickInput("");
      setActiveInputQuadrant(null);
    } catch {
      // Handled in store
    }
  };

  const handleToggleTask = async (id: string) => {
    await toggleTaskStatus(id);
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      await deleteTask(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto w-full transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Eisenhower Matrix
        </h1>
        {isLoading && (
          <span className="text-xs text-neutral-400 animate-pulse font-mono">
            Đang đồng bộ...
          </span>
        )}
      </div>

      {/* 4 Quadrants Grid matching the exact wireframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[500px]">
        {QUADRANTS.map((quad) => {
          const quadTasks = tasks.filter((t) => t.priority === quad.priority);
          const isAdding = activeInputQuadrant === quad.id;

          return (
            <div
              key={quad.id}
              className={`p-5 rounded-3xl border-2 ${quad.borderColor} bg-transparent flex flex-col transition-all duration-200 shadow-2xs hover:shadow-xs`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    {quad.title}
                  </h2>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                    {quad.subtitle}
                  </span>
                </div>

                {/* Add Task Button for this quadrant */}
                <button
                  onClick={() => {
                    setActiveInputQuadrant(isAdding ? null : quad.id);
                    setQuickInput("");
                  }}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  title="Thêm task vào ô này"
                  aria-label="Thêm task vào ô này"
                >
                  {isAdding ? <X size={15} strokeWidth={2} /> : <Plus size={15} strokeWidth={2.2} />}
                </button>
              </div>

              {/* Quick Input when active */}
              {isAdding && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask(quad.id);
                  }}
                  className="mb-3"
                >
                  <input
                    type="text"
                    autoFocus
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Nhập task mới rồi nhấn Enter..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-white"
                  />
                </form>
              )}

              {/* Tasks List within this quadrant */}
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-64 pr-1">
                {quadTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 italic py-6">
                    Không có công việc nào
                  </div>
                ) : (
                  quadTasks.map((t) => {
                    const isCompleted = t.status === TaskStatus.Completed;

                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(t.id)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                          isCompleted
                            ? "bg-neutral-100/40 dark:bg-neutral-900/30 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400"
                            : "bg-white/60 dark:bg-neutral-800/50 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-neutral-400"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-neutral-400 dark:border-neutral-600"
                            }`}
                          >
                            {isCompleted && <Check size={11} strokeWidth={2.5} />}
                          </span>
                          <span
                            className={`text-xs sm:text-sm truncate ${
                              isCompleted ? "line-through text-neutral-400" : "font-medium"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteTask(t.id, e)}
                          className="text-neutral-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          title="Xóa task"
                          aria-label="Xóa task"
                        >
                          <X size={13} strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
