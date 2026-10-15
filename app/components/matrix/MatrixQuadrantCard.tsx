"use client";

import React, { useState } from "react";
import { TaskDto, TaskStatus } from "../../types/api";
import { MatrixQuadrant } from "../tasks/types";
import { QuadrantConfig } from "./types";
import { Plus, X, Check, GripVertical } from "lucide-react";

interface MatrixQuadrantCardProps {
  quad: QuadrantConfig;
  tasks: TaskDto[];
  isAdding: boolean;
  isDragOver: boolean;
  draggingTaskId: string | null;
  onToggleAdding: () => void;
  onAddTask: (quadrant: MatrixQuadrant, title: string) => Promise<void>;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, quadrant: MatrixQuadrant) => void;
  onDragLeave: (e: React.DragEvent, quadrant: MatrixQuadrant) => void;
  onDrop: (e: React.DragEvent, quadrant: MatrixQuadrant) => void;
}

export function MatrixQuadrantCard({
  quad,
  tasks,
  isAdding,
  isDragOver,
  draggingTaskId,
  onToggleAdding,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: MatrixQuadrantCardProps) {
  const [quickInput, setQuickInput] = useState("");

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
                {tasks.length}
              </span>
            </div>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {quad.subtitle}
            </span>
          </div>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => {
            onToggleAdding();
            setQuickInput("");
          }}
          className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs"
          title="Thêm việc vào ô này"
          aria-label="Thêm việc vào ô này"
        >
          {isAdding ? <X size={15} strokeWidth={2} /> : <Plus size={15} strokeWidth={2.2} />}
        </button>
      </div>

      {/* Quick Input Form */}
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
        className={`flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-72 pr-1 rounded-2xl transition-all duration-150 ${
          isDragOver ? "bg-black/5 dark:bg-white/5 p-2" : ""
        }`}
      >
        {tasks.length === 0 ? (
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
          tasks.map((t) => {
            const isCompleted = t.status === TaskStatus.Completed;
            const isBeingDragged = draggingTaskId === t.id;

            return (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => onDragStart(e, t.id)}
                onDragEnd={onDragEnd}
                onClick={() => onToggleTask(t.id)}
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
                      onToggleTask(t.id);
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
                    onClick={(e) => onDeleteTask(t.id, e)}
                    className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                    title="Xóa công việc này"
                    aria-label="Xóa công việc này"
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
}
