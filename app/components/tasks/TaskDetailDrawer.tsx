"use client";

import React, { useState, useEffect, useRef } from "react";
import { TaskDto, Priority } from "../../types/api";
import { PRIORITY_MAP, MATRIX_OPTIONS } from "./types";
import { useTaskStore } from "../../stores/useTaskStore";
import { Flag, ChevronDown, Check, Trash2 } from "lucide-react";
import { TaskSubtasksSection } from "./TaskSubtasksSection";

interface TaskDetailDrawerProps {
  task: TaskDto;
  detailWidth: number;
  isResizing: boolean;
  onStartResize: () => void;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  detailPanelRef: React.RefObject<HTMLElement | null>;
}

export function TaskDetailDrawer({
  task,
  detailWidth,
  isResizing,
  onStartResize,
  onClose,
  onDelete,
  detailPanelRef,
}: TaskDetailDrawerProps) {
  const { updateTask, isSaving } = useTaskStore();

  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState<number>(
    task.estimatedMinutes || 30
  );
  const [editDueDate, setEditDueDate] = useState<string>(
    task.dueDate ? task.dueDate.split("T")[0] : new Date().toISOString().split("T")[0]
  );

  const [isMatrixMenuOpen, setIsMatrixMenuOpen] = useState(false);
  const matrixDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditEstimatedMinutes(task.estimatedMinutes || 30);
    setEditDueDate(
      task.dueDate ? task.dueDate.split("T")[0] : new Date().toISOString().split("T")[0]
    );
  }, [task]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        matrixDropdownRef.current &&
        !matrixDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMatrixMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMatrixBadgeColor = (p: Priority) => {
    switch (p) {
      case Priority.ImportantUrgent:
        return "text-rose-500";
      case Priority.ImportantNotUrgent:
        return "text-blue-500";
      case Priority.NotImportantUrgent:
        return "text-amber-500";
      case Priority.NotImportantNotUrgent:
        return "text-neutral-400";
      default:
        return "text-neutral-400";
    }
  };

  const handleSaveDetail = async () => {
    if (!editTitle.trim()) return;
    try {
      await updateTask(task.id, {
        title: editTitle.trim(),
        priority: editPriority,
        status: task.status,
        estimatedPomodoros:
          task.estimatedPomodoros || Math.ceil(editEstimatedMinutes / 25),
        estimatedMinutes: editEstimatedMinutes,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      onClose();
    } catch {
      // Handled in store
    }
  };

  return (
    <aside
      ref={detailPanelRef}
      style={{ width: `${detailWidth}px` }}
      className={`relative border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex flex-col p-6 overflow-y-auto shrink-0 select-none ${
        isResizing
          ? "transition-none pointer-events-none"
          : "transition-[width] duration-150 ease-out"
      }`}
    >
      {/* Resize Handle Bar */}
      <div
        onMouseDown={onStartResize}
        title="Kéo sang trái/phải để co giãn khung chi tiết"
        className="absolute top-0 left-0 bottom-0 w-3 cursor-col-resize hover:bg-neutral-400/30 dark:hover:bg-neutral-500/30 transition-colors z-20 group flex items-center justify-center -ml-1.5 pointer-events-auto"
      >
        <div className="w-1 h-10 bg-neutral-300 dark:bg-neutral-600 rounded-full group-hover:bg-neutral-500 dark:group-hover:bg-neutral-400 transition-colors" />
      </div>

      {/* Header: Title & Matrix Selector */}
      <div className="relative pb-3 border-b-2 border-neutral-300 dark:border-neutral-700 mb-6 pointer-events-auto">
        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-lg font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none flex-1 min-w-0 truncate"
            placeholder="Tên công việc"
          />

          <div className="relative shrink-0 flex items-center" ref={matrixDropdownRef}>
            <button
              type="button"
              onClick={() => setIsMatrixMenuOpen((prev) => !prev)}
              title="Chọn dạng Ma trận Eisenhower"
              aria-label="Chọn Ma trận Eisenhower"
              className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Flag
                size={18}
                strokeWidth={2}
                className={`${getMatrixBadgeColor(editPriority)} shrink-0`}
              />
              <ChevronDown size={14} strokeWidth={2} className="text-neutral-400 shrink-0" />
            </button>

            {isMatrixMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase px-2 py-1 mb-1">
                  Phân loại Ma trận Eisenhower
                </div>
                {MATRIX_OPTIONS.map((opt) => {
                  const optPriority = PRIORITY_MAP[opt.id];
                  const isSelected = editPriority === optPriority;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setEditPriority(optPriority);
                        setIsMatrixMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-neutral-100 dark:bg-neutral-700 font-semibold"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-900 dark:text-white font-medium">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <Check size={14} strokeWidth={2.5} className="text-emerald-500" />
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Frame (Due Date, Estimation) */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 mb-6 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Chi tiết công việc
          </span>
          {task.isQuickAdd && (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
              ⚡ Nguồn: Quick Add
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            Due date
          </span>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            Estimation
          </span>
          <select
            value={editEstimatedMinutes}
            onChange={(e) => setEditEstimatedMinutes(parseInt(e.target.value) || 30)}
            className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer font-medium"
          >
            <option value={15}>15 phút</option>
            <option value={25}>25 phút (1 Pomo)</option>
            <option value={30}>30 phút</option>
            <option value={45}>45 phút</option>
            <option value={50}>50 phút (2 Pomo)</option>
            <option value={60}>1 giờ</option>
            <option value={90}>1 giờ 30 phút</option>
            <option value={120}>2 giờ</option>
            <option value={180}>3 giờ</option>
          </select>
        </div>
      </div>

      {/* Subtasks Section */}
      <TaskSubtasksSection task={task} />

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80 mt-auto pointer-events-auto">
        <button
          onClick={handleSaveDetail}
          disabled={isSaving}
          className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Check size={14} strokeWidth={2.5} />
          <span>{isSaving ? "Đang lưu..." : "Save"}</span>
        </button>
        <button
          onClick={onClose}
          className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
        >
          Đóng
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all cursor-pointer flex items-center justify-center"
          title="Xóa công việc này"
          aria-label="Xóa công việc"
        >
          <Trash2 size={15} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
