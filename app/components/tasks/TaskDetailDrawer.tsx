"use client";

import React, { useState, useEffect, useRef } from "react";
import { TaskDto, Priority } from "../../types/api";
import { PRIORITY_MAP, MATRIX_OPTIONS } from "./types";
import { useTaskStore } from "../../stores/useTaskStore";
import { usePomodoroStore } from "../../stores/usePomodoroStore";
import { Flag, ChevronDown, Check, Zap } from "lucide-react";
import { TaskSubtasksSection } from "./TaskSubtasksSection";
import { TaskDetailBottomBar } from "./TaskDetailBottomBar";

interface TaskDetailDrawerProps {
  task: TaskDto;
  detailWidth: number;
  isResizing: boolean;
  onStartResize: () => void;
  onClose?: () => void;
  onDelete: (id: string) => Promise<void>;
  onNavigateToTimer?: () => void;
  detailPanelRef: React.RefObject<HTMLElement | null>;
}

export function TaskDetailDrawer({
  task,
  detailWidth,
  isResizing,
  onStartResize,
  onDelete,
  onNavigateToTimer,
  detailPanelRef,
}: TaskDetailDrawerProps) {
  const { updateTask, isSaving, createTask } = useTaskStore();

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
    if (p === Priority.ImportantUrgent) return "text-rose-500";
    if (p === Priority.ImportantNotUrgent) return "text-blue-500";
    if (p === Priority.NotImportantUrgent) return "text-amber-500";
    return "text-neutral-400";
  };

  const handleAutoSave = async (updates?: {
    title?: string;
    priority?: Priority;
    estimatedMinutes?: number;
    dueDate?: string | null;
  }) => {
    const newTitle = (updates?.title ?? editTitle).trim();
    if (!newTitle) return;

    const newPriority = updates?.priority ?? editPriority;
    const newEstMin = updates?.estimatedMinutes ?? editEstimatedMinutes;
    const newDueDate = updates?.dueDate !== undefined ? updates.dueDate : editDueDate;

    try {
      await updateTask(task.id, {
        title: newTitle,
        priority: newPriority,
        status: task.status,
        estimatedPomodoros: Math.ceil(newEstMin / 25),
        estimatedMinutes: newEstMin,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : null,
      });
    } catch {
      // Error handled in store
    }
  };

  const handleStartPomodoro = () => {
    const { setTaskName, setIsRunning, setTimerType, setFocusMode } = usePomodoroStore.getState();
    setTaskName(task.title);
    setTimerType("pomo");
    setFocusMode("W");
    setIsRunning(true);
    onNavigateToTimer?.();
  };

  const handleDuplicateTask = async () => {
    await createTask({
      title: `${task.title} (Bản sao)`,
      priority: task.priority,
      estimatedPomodoros: task.estimatedPomodoros,
      estimatedMinutes: task.estimatedMinutes,
      dueDate: task.dueDate || undefined,
      isQuickAdd: task.isQuickAdd,
      tagIds: task.tags?.map((t) => t.id),
      initialSubtasks: task.subtasks?.map((st) => st.title),
    });
  };

  const handleDelete = async () => {
    await onDelete(task.id);
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
            onBlur={() => {
              if (editTitle.trim() && editTitle !== task.title) {
                handleAutoSave({ title: editTitle });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
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
                        if (optPriority !== editPriority) {
                          handleAutoSave({ priority: optPriority });
                        }
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
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Zap size={12} strokeWidth={2} className="shrink-0" />
              <span>Nguồn: Quick Add</span>
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
            onChange={(e) => {
              const val = e.target.value;
              setEditDueDate(val);
              handleAutoSave({ dueDate: val });
            }}
            className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            Estimation
          </span>
          <select
            value={editEstimatedMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 30;
              setEditEstimatedMinutes(val);
              handleAutoSave({ estimatedMinutes: val });
            }}
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

      {/* Sleek Bottom Action Toolbar with Auto-save and 3-dots Menu */}
      <TaskDetailBottomBar
        isSaving={isSaving}
        onStartPomodoro={handleStartPomodoro}
        onDuplicateTask={handleDuplicateTask}
        onDelete={handleDelete}
      />
    </aside>
  );
}
