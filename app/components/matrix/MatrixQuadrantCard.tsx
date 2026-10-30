"use client";

import React, { useState } from "react";
import { TaskDto, Priority } from "../../types/api";
import { MatrixQuadrant } from "../tasks/types";
import { QuadrantConfig } from "./types";
import { Plus, X } from "lucide-react";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { MatrixTaskItem } from "./MatrixTaskItem";

const QUICK_MOVE_QUADRANTS: { code: string; label: string; priority: Priority; color: string }[] = [
  { code: "Q1", label: "Q1: Khẩn cấp & Quan trọng", priority: Priority.ImportantUrgent, color: "hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400" },
  { code: "Q2", label: "Q2: Không khẩn & Quan trọng", priority: Priority.ImportantNotUrgent, color: "hover:bg-blue-500/15 hover:text-blue-600 dark:hover:text-blue-400" },
  { code: "Q3", label: "Q3: Khẩn cấp & Không quan trọng", priority: Priority.NotImportantUrgent, color: "hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400" },
  { code: "Q4", label: "Q4: Không khẩn & Không quan trọng", priority: Priority.NotImportantNotUrgent, color: "hover:bg-neutral-500/15 hover:text-neutral-700 dark:hover:text-neutral-300" },
];

interface MatrixQuadrantCardProps {
  quad: QuadrantConfig;
  tasks: TaskDto[];
  isAdding: boolean;
  isDragOver: boolean;
  draggingTaskId: string | null;
  onToggleAdding: () => void;
  onAddTask: (quadrant: MatrixQuadrant, title: string) => Promise<void>;
  onToggleTask: (id: string) => void;
  onMoveTask?: (id: string, targetPriority: Priority) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, quadrant: MatrixQuadrant) => void;
  onDragLeave: (e: React.DragEvent, quadrant: MatrixQuadrant) => void;
  onDrop: (e: React.DragEvent, quadrant: MatrixQuadrant) => void;
}

const ACCENT_DOTS: Record<string, string> = {
  rose: "bg-rose-500 ring-4 ring-rose-500/20",
  blue: "bg-blue-500 ring-4 ring-blue-500/20",
  amber: "bg-amber-500 ring-4 ring-amber-500/20",
  neutral: "bg-neutral-500 ring-4 ring-neutral-500/20",
};

export function MatrixQuadrantCard({
  quad,
  tasks,
  isAdding,
  isDragOver,
  draggingTaskId,
  onToggleAdding,
  onAddTask,
  onToggleTask,
  onMoveTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: MatrixQuadrantCardProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const [quickInput, setQuickInput] = useState("");
  const otherQuadrants = QUICK_MOVE_QUADRANTS.filter((q) => q.priority !== quad.priority);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    await onAddTask(quad.id, quickInput.trim());
    setQuickInput("");
  };

  return (
    <div
      onDragOver={(e) => onDragOver(e, quad.id)}
      onDragLeave={(e) => onDragLeave(e, quad.id)}
      onDrop={(e) => onDrop(e, quad.id)}
      className={`p-5 rounded-3xl border-2 flex flex-col transition-all duration-200 shadow-2xs relative ${
        isDragOver
          ? quad.dragOverBg
          : `${quad.borderColor} ${quad.bgGlow} ${wallpaperUrl ? "backdrop-blur-md bg-black/20 shadow-sm" : "hover:shadow-xs"}`
      }`}
    >
      {/* Quadrant Header */}
      <div
        className={`flex items-center justify-between pb-3 border-b mb-4 ${
          wallpaperUrl ? "border-white/15" : "border-neutral-200/80 dark:border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ACCENT_DOTS[quad.accentColor] || ACCENT_DOTS.neutral}`} />
          <div>
            <div className="flex items-center gap-2">
              <h2
                className={`text-base sm:text-lg font-bold ${
                  wallpaperUrl ? "text-white drop-shadow-md" : "text-neutral-900 dark:text-white"
                }`}
              >
                {quad.title}
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                  wallpaperUrl
                    ? "bg-white/20 text-white backdrop-blur-xs font-bold"
                    : "bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {tasks.length}
              </span>
            </div>
            <span
              className={`text-xs font-medium ${
                wallpaperUrl ? "text-white/80 drop-shadow-xs" : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {quad.subtitle}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onToggleAdding();
            setQuickInput("");
          }}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
            wallpaperUrl
              ? "bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-xs"
              : "bg-white/80 hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200"
          }`}
          title="Thêm việc vào ô này"
          aria-label="Thêm việc vào ô này"
        >
          {isAdding ? <X size={15} strokeWidth={2} /> : <Plus size={15} strokeWidth={2.2} />}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-3">
          <input
            type="text"
            autoFocus
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Nhập công việc mới rồi nhấn Enter..."
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-800/90 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 text-neutral-900 dark:text-white shadow-xs"
          />
        </form>
      )}

      {/* Tasks List */}
      <div
        className={`flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-72 pr-1 rounded-2xl transition-all duration-150 ${isDragOver ? "bg-black/5 dark:bg-white/5 p-2" : ""
          }`}
      >
        {tasks.length === 0 ? (
          <div
            className={`flex-1 flex items-center justify-center text-xs py-8 px-4 rounded-2xl transition-colors ${
              isDragOver
                ? "border-2 border-dashed border-neutral-400/60 text-neutral-600 dark:text-neutral-300 bg-white/40 dark:bg-neutral-800/40"
                : wallpaperUrl
                  ? "text-white/70 italic drop-shadow-xs font-medium"
                  : "text-neutral-400 dark:text-neutral-500 italic"
            }`}
          >
            <span>{isDragOver ? "Thả chuột vào đây" : "Không có công việc nào"}</span>
          </div>
        ) : (
          tasks.map((t) => (
            <MatrixTaskItem
              key={t.id}
              task={t}
              wallpaperUrl={wallpaperUrl || undefined}
              isBeingDragged={draggingTaskId === t.id}
              otherQuadrants={otherQuadrants}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onToggleTask={onToggleTask}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
