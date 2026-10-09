"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Priority, TaskStatus } from "../types/api";
import { MatrixQuadrant, PRIORITY_MAP, REVERSE_PRIORITY_MAP } from "./TaskPage";
import { Plus, X, Check, GripVertical } from "lucide-react";

const QUADRANTS: {
  id: MatrixQuadrant;
  priority: Priority;
  title: string;
  subtitle: string;
  accentColor: string;
  borderColor: string;
  activeBorderColor: string;
  bgGlow: string;
  badgeBg: string;
  dragOverBg: string;
}[] = [
  {
    id: "urgent-important",
    priority: Priority.ImportantUrgent,
    title: "Urgent & Important",
    subtitle: "Do First (Làm ngay)",
    accentColor: "rose",
    borderColor: "border-rose-400/50 dark:border-rose-500/30",
    activeBorderColor: "border-rose-500 dark:border-rose-400",
    bgGlow: "bg-rose-500/5 dark:bg-rose-950/20",
    badgeBg: "bg-rose-500 text-white",
    dragOverBg: "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30",
  },
  {
    id: "not-urgent-important",
    priority: Priority.ImportantNotUrgent,
    title: "Not Urgent & Important",
    subtitle: "Schedule (Lên kế hoạch)",
    accentColor: "blue",
    borderColor: "border-blue-400/50 dark:border-blue-500/30",
    activeBorderColor: "border-blue-500 dark:border-blue-400",
    bgGlow: "bg-blue-500/5 dark:bg-blue-950/20",
    badgeBg: "bg-blue-500 text-white",
    dragOverBg: "bg-blue-500/10 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30",
  },
  {
    id: "urgent-not-important",
    priority: Priority.NotImportantUrgent,
    title: "Urgent & Not Important",
    subtitle: "Delegate (Ủy quyền / Việc gấp)",
    accentColor: "amber",
    borderColor: "border-amber-400/50 dark:border-amber-500/30",
    activeBorderColor: "border-amber-500 dark:border-amber-400",
    bgGlow: "bg-amber-500/5 dark:bg-amber-950/20",
    badgeBg: "bg-amber-500 text-white",
    dragOverBg: "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30",
  },
  {
    id: "not-urgent-not-important",
    priority: Priority.NotImportantNotUrgent,
    title: "Not Urgent & Not Important",
    subtitle: "Don't Do (Loại bỏ / Thư giãn)",
    accentColor: "neutral",
    borderColor: "border-neutral-300 dark:border-neutral-700/60",
    activeBorderColor: "border-neutral-600 dark:border-neutral-300",
    bgGlow: "bg-neutral-500/5 dark:bg-neutral-900/30",
    badgeBg: "bg-neutral-500 text-white",
    dragOverBg: "bg-neutral-200/50 dark:bg-neutral-800/80 border-neutral-500 ring-2 ring-neutral-400/30",
  },
];

export function MatrixPage() {
  const {
    tasks,
    isLoading,
    isSaving,
    fetchTasks,
    createTask,
    moveTaskPriority,
    toggleTaskStatus,
    deleteTask,
  } = useTaskStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeInputQuadrant, setActiveInputQuadrant] = useState<MatrixQuadrant | null>(null);
  const [quickInput, setQuickInput] = useState("");

  // Drag and Drop States
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<MatrixQuadrant | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      useTaskStore.getState().resetTaskStore();
    }
  }, [fetchTasks, isAuthenticated]);

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

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverQuadrant(null);
  };

  const handleDragOver = (e: React.DragEvent, quadrant: MatrixQuadrant) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverQuadrant !== quadrant) {
      setDragOverQuadrant(quadrant);
    }
  };

  const handleDragLeave = (e: React.DragEvent, quadrant: MatrixQuadrant) => {
    // Chỉ reset khi rời hẳn quadrant container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverQuadrant === quadrant) {
      setDragOverQuadrant(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetQuadrant: MatrixQuadrant) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    setDraggingTaskId(null);
    setDragOverQuadrant(null);

    if (!taskId) return;

    const targetPriority = PRIORITY_MAP[targetQuadrant];
    await moveTaskPriority(taskId, targetPriority);
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

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[520px]">
        {QUADRANTS.map((quad) => {
          const quadTasks = tasks.filter((t) => t.priority === quad.priority);
          const isAdding = activeInputQuadrant === quad.id;
          const isDragOver = dragOverQuadrant === quad.id;

          return (
            <div
              key={quad.id}
              onDragOver={(e) => handleDragOver(e, quad.id)}
              onDragLeave={(e) => handleDragLeave(e, quad.id)}
              onDrop={(e) => handleDrop(e, quad.id)}
              className={`p-5 rounded-3xl border-2 flex flex-col transition-all duration-200 shadow-2xs relative ${
                isDragOver
                  ? quad.dragOverBg
                  : `${quad.borderColor} ${quad.bgGlow} hover:shadow-xs`
              }`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      quad.accentColor === "rose"
                        ? "bg-rose-500 ring-4 ring-rose-500/20"
                        : quad.accentColor === "blue"
                        ? "bg-blue-500 ring-4 ring-blue-500/20"
                        : quad.accentColor === "amber"
                        ? "bg-amber-500 ring-4 ring-amber-500/20"
                        : "bg-neutral-500 ring-4 ring-neutral-500/20"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                        {quad.title}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono font-semibold">
                        {quadTasks.length}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                      {quad.subtitle}
                    </span>
                  </div>
                </div>

                {/* Add Task Button for this quadrant */}
                <button
                  onClick={() => {
                    setActiveInputQuadrant(isAdding ? null : quad.id);
                    setQuickInput("");
                  }}
                  className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs"
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
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800/90 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 text-neutral-900 dark:text-white shadow-xs"
                  />
                </form>
              )}

              {/* Tasks List within this quadrant */}
              <div
                className={`flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-72 pr-1 rounded-2xl transition-all duration-150 ${
                  isDragOver ? "bg-black/5 dark:bg-white/5 p-2" : ""
                }`}
              >
                {quadTasks.length === 0 ? (
                  <div
                    className={`flex-1 flex items-center justify-center text-xs py-8 px-4 rounded-2xl transition-colors ${
                      isDragOver
                        ? "border-2 border-dashed border-neutral-400/60 text-neutral-600 dark:text-neutral-300 bg-white/40 dark:bg-neutral-800/40"
                        : "text-neutral-400 dark:text-neutral-500 italic"
                    }`}
                  >
                    <span>{isDragOver ? "Thả chuột vào đây" : "Không có công việc nào"}</span>
                  </div>
                ) : (
                  quadTasks.map((t) => {
                    const isCompleted = t.status === TaskStatus.Completed;
                    const isBeingDragged = draggingTaskId === t.id;

                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleToggleTask(t.id)}
                        className={`group p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-2.5 cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? "opacity-40 scale-[0.98] border-dashed border-neutral-400 shadow-none"
                            : isCompleted
                            ? "bg-neutral-100/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                            : "bg-white/90 dark:bg-neutral-800/80 border-neutral-200/90 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-100 shadow-2xs hover:shadow-xs hover:border-neutral-400 dark:hover:border-neutral-500"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Drag Handle Indicator */}
                          <span
                            className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors shrink-0 cursor-grab"
                            title="Kéo thả để di chuyển ô"
                          >
                            <GripVertical size={14} strokeWidth={2} />
                          </span>

                          {/* Completed Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTask(t.id);
                            }}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-neutral-400 dark:border-neutral-500 hover:border-emerald-500"
                            }`}
                          >
                            {isCompleted && <Check size={11} strokeWidth={2.5} />}
                          </button>

                          <span
                            className={`text-xs sm:text-sm truncate ${
                              isCompleted ? "line-through text-neutral-400" : "font-medium"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleDeleteTask(t.id, e)}
                            className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                            title="Xóa task"
                            aria-label="Xóa task"
                          >
                            <X size={13} strokeWidth={2} />
                          </button>
                        </div>
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

