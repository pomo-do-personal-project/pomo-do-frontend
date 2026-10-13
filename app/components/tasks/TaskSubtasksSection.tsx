"use client";

import React, { useState } from "react";
import { TaskDto } from "../../types/api";
import { useTaskStore } from "../../stores/useTaskStore";
import { Plus, Check, X } from "lucide-react";

interface TaskSubtasksSectionProps {
  task: TaskDto;
}

export function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
  const { addSubtask, toggleSubtask, deleteSubtask, isSaving } = useTaskStore();
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || isSaving) return;
    try {
      await addSubtask(task.id, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    } catch {
      // Handled in store
    }
  };

  const completedCount = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalCount = task.subtasks?.length || 0;

  return (
    <div className="mb-8 flex flex-col gap-2 flex-1">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Subtasks ({completedCount}/{totalCount})
      </span>

      {!isAddingSubtask ? (
        <button
          type="button"
          onClick={() => setIsAddingSubtask(true)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-xl text-left cursor-pointer transition-all group mb-2"
        >
          <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
            <Plus size={13} strokeWidth={2.2} />
          </span>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
            Thêm subtask
          </span>
        </button>
      ) : (
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-transparent border border-neutral-900 dark:border-white rounded-xl">
            <span className="text-neutral-500">
              <Plus size={13} strokeWidth={2.2} />
            </span>
            <input
              type="text"
              autoFocus
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Nhập tên subtask..."
              className="flex-1 text-xs bg-transparent focus:outline-none text-neutral-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => {
                setIsAddingSubtask(false);
                setNewSubtaskTitle("");
              }}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              Hủy
            </button>
          </div>
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Lưu
          </button>
        </form>
      )}

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-40">
        {task.subtasks?.map((sub) => (
          <div
            key={sub.id}
            onClick={() => toggleSubtask(task.id, sub.id)}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-neutral-50/30 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-700/50 cursor-pointer text-xs group"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                  sub.isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-neutral-400"
                }`}
              >
                {sub.isCompleted && <Check size={10} strokeWidth={2.5} />}
              </span>
              <span
                className={`truncate ${
                  sub.isCompleted ? "line-through text-neutral-400" : ""
                }`}
              >
                {sub.title}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSubtask(task.id, sub.id);
              }}
              className="text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
              title="Xóa subtask"
              aria-label="Xóa subtask"
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
