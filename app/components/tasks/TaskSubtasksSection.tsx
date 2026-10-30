"use client";

import React, { useState } from "react";
import { TaskDto, SubtaskDto } from "../../types/api";
import { useTaskStore } from "../../stores/useTaskStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Plus, Check, X } from "lucide-react";

interface TaskSubtasksSectionProps {
  task: TaskDto;
}

export function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const { addSubtask, toggleSubtask, updateSubtask, deleteSubtask, isSaving } = useTaskStore();
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

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

  const handleStartEditing = (sub: SubtaskDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubtaskId(sub.id);
    setEditingTitle(sub.title);
  };

  const handleSaveSubtaskTitle = async (sub: SubtaskDto) => {
    const trimmed = editingTitle.trim();
    setEditingSubtaskId(null);
    if (!trimmed || trimmed === sub.title) {
      setEditingTitle(sub.title);
      return;
    }
    try {
      await updateSubtask(task.id, sub.id, {
        title: trimmed,
        isCompleted: sub.isCompleted,
        orderIndex: sub.orderIndex,
      });
    } catch {
      // Handled in store
    }
  };

  const completedCount = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalCount = task.subtasks?.length || 0;

  return (
    <div className="mb-8 flex flex-col gap-2 flex-1">
      <span
        className={`text-xs font-bold uppercase tracking-wider ${
          wallpaperUrl ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        Nhiệm vụ con ({completedCount}/{totalCount})
      </span>

      {!isAddingSubtask ? (
        <button
          type="button"
          onClick={() => setIsAddingSubtask(true)}
          className={`w-full flex items-center gap-2 px-3 py-2 border border-dashed rounded-xl text-left cursor-pointer transition-all group mb-2 ${
            wallpaperUrl
              ? "bg-white/10 hover:bg-white/15 border-white/20 text-white"
              : "bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform ${
              wallpaperUrl
                ? "bg-white/20 text-white"
                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            <Plus size={13} strokeWidth={2.2} />
          </span>
          <span
            className={`text-xs font-medium transition-colors ${
              wallpaperUrl
                ? "text-white/80 group-hover:text-white"
                : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
            }`}
          >
            Thêm nhiệm vụ con
          </span>
        </button>
      ) : (
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mb-2">
          <div
            className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
              wallpaperUrl
                ? "bg-white/10 border-white/30 focus-within:border-white/80"
                : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-600 focus-within:border-neutral-900 dark:focus-within:border-white"
            }`}
          >
            <span className={wallpaperUrl ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"}>
              <Plus size={13} strokeWidth={2.2} />
            </span>
            <input
              type="text"
              autoFocus
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Nhập tên nhiệm vụ con..."
              className={`flex-1 text-xs bg-transparent focus:outline-none font-medium ${
                wallpaperUrl
                  ? "text-white placeholder:text-white/50"
                  : "text-neutral-900 dark:text-white placeholder:text-neutral-400"
              }`}
              style={{ color: wallpaperUrl ? "#ffffff" : "var(--text-highlight, inherit)" }}
            />
            <button
              type="button"
              onClick={() => {
                setIsAddingSubtask(false);
                setNewSubtaskTitle("");
              }}
              className={`text-[10px] cursor-pointer transition-colors ${
                wallpaperUrl
                  ? "text-white/60 hover:text-white"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
            >
              Hủy
            </button>
          </div>
          <button
            type="submit"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 ${
              wallpaperUrl
                ? "bg-white text-neutral-900 hover:bg-neutral-100 font-bold"
                : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
            }`}
          >
            Lưu
          </button>
        </form>
      )}

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-40">
        {task.subtasks?.map((sub) => (
          <div
            key={sub.id}
            className={`flex items-center justify-between gap-2 p-2 rounded-xl text-xs border transition-all group ${
              wallpaperUrl
                ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
                : "bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200/70 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => toggleSubtask(task.id, sub.id)}
                aria-label={`Đánh dấu hoàn thành ${sub.title}`}
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 cursor-pointer ${
                  sub.isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : wallpaperUrl
                    ? "border-white/40 hover:border-emerald-400"
                    : "border-neutral-400 dark:border-neutral-500 hover:border-emerald-500"
                }`}
              >
                {sub.isCompleted && <Check size={10} strokeWidth={2.5} />}
              </button>

              {editingSubtaskId === sub.id ? (
                <input
                  type="text"
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveSubtaskTitle(sub)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveSubtaskTitle(sub);
                    } else if (e.key === "Escape") {
                      setEditingSubtaskId(null);
                      setEditingTitle(sub.title);
                    }
                  }}
                  className={`flex-1 min-w-0 text-xs px-2 py-0.5 rounded border focus:outline-none font-medium ${
                    wallpaperUrl
                      ? "bg-black/50 border-white/40 text-white"
                      : "bg-white dark:bg-neutral-900 border-neutral-400 dark:border-neutral-600 text-neutral-900 dark:text-white"
                  }`}
                  style={{ color: wallpaperUrl ? "#ffffff" : "var(--text-highlight, inherit)" }}
                />
              ) : (
                <span
                  onClick={(e) => handleStartEditing(sub, e)}
                  title="Nhấp để sửa tên nhiệm vụ con"
                  className={`truncate flex-1 cursor-text rounded px-1 py-0.5 transition-colors ${
                    sub.isCompleted
                      ? wallpaperUrl
                        ? "line-through text-white/40"
                        : "line-through text-neutral-400"
                      : wallpaperUrl
                      ? "text-white hover:bg-white/10"
                      : "text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/40"
                  }`}
                >
                  {sub.title}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteSubtask(task.id, sub.id);
              }}
              className={`p-1 cursor-pointer shrink-0 transition-colors ${
                wallpaperUrl
                  ? "text-white/60 hover:text-rose-400"
                  : "text-neutral-400 hover:text-rose-500"
              }`}
              title="Xóa nhiệm vụ con"
              aria-label="Xóa nhiệm vụ con"
            >
              <X size={13} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
