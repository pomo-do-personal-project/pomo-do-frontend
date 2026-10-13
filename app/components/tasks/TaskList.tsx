"use client";

import React from "react";
import { TaskDto } from "../../types/api";
import { TaskItem } from "./TaskItem";
import { TaskCategory } from "./types";

interface TaskListProps {
  tasks: TaskDto[];
  selectedTaskId?: string;
  currentCategory: TaskCategory;
  isLoading: boolean;
  onSelectTask: (task: TaskDto) => void;
  onToggleStatus: (taskId: string, e: React.MouseEvent) => void;
}

export function TaskList({
  tasks,
  selectedTaskId,
  currentCategory,
  isLoading,
  onSelectTask,
  onToggleStatus,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-neutral-400 dark:text-neutral-500">
        {isLoading
          ? "Đang tải công việc..."
          : currentCategory === "QuickAdd"
          ? "Chưa có ý nghĩ nảy sinh nào được ghi nhận. Hãy bấm nút trên để thêm nhanh!"
          : `Chưa có công việc nào trong mục ${currentCategory}. Hãy thêm task mới ở trên!`}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isSelected={selectedTaskId === task.id}
          onSelect={onSelectTask}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
