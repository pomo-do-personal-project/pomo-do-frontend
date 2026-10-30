"use client";

import React, { useState, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { MatrixQuadrant, PRIORITY_MAP } from "./TaskPage";
import { QUADRANTS } from "./matrix/types";
import { MatrixQuadrantCard } from "./matrix/MatrixQuadrantCard";
import { ConfirmModal } from "./ui/ConfirmModal";

export function MatrixPage() {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
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
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

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

  const handleAddTask = async (quadrant: MatrixQuadrant, title: string) => {
    if (isSaving) return;
    const targetPriority = PRIORITY_MAP[quadrant];

    try {
      await createTask({
        title,
        priority: targetPriority,
        estimatedMinutes: 30,
        estimatedPomodoros: 1,
      });
      setActiveInputQuadrant(null);
    } catch {
      // Handled in store
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(id);
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
    <div className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-20 md:pb-8 overflow-y-auto w-full transition-colors">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${wallpaperUrl ? "text-white drop-shadow-md" : "text-neutral-900 dark:text-white"
              }`}
          >
            Eisenhower Matrix
          </h1>
          <p
            className={`text-xs mt-0.5 ${wallpaperUrl ? "text-white/80 drop-shadow-xs" : "text-neutral-500 dark:text-neutral-400"
              }`}
          >
            Phân loại công việc theo mức độ Khẩn cấp &amp; Quan trọng
          </p>
        </div>
        {isLoading && (
          <span
            className={`text-xs animate-pulse font-mono ${wallpaperUrl ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"
              }`}
          >
            Đang đồng bộ...
          </span>
        )}
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 flex-1 min-h-0">
        {QUADRANTS.map((quad) => (
          <MatrixQuadrantCard
            key={quad.id}
            quad={quad}
            tasks={tasks.filter((t) => t.priority === quad.priority)}
            isAdding={activeInputQuadrant === quad.id}
            isDragOver={dragOverQuadrant === quad.id}
            draggingTaskId={draggingTaskId}
            onToggleAdding={() =>
              setActiveInputQuadrant(activeInputQuadrant === quad.id ? null : quad.id)
            }
            onAddTask={handleAddTask}
            onToggleTask={toggleTaskStatus}
            onMoveTask={moveTaskPriority}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Xóa công việc khỏi ma trận"
        message="Bạn có chắc chắn muốn xóa công việc này? Công việc sẽ được chuyển vào mục Thùng rác."
        confirmText="Xóa công việc"
        cancelText="Giữ lại"
        danger={true}
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
