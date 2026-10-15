"use client";

import React, { useState, useEffect } from "react";
import { TaskDto, Priority } from "../../types/api";
import { Zap } from "lucide-react";
import { TaskSubtasksSection } from "./TaskSubtasksSection";
import { TaskDetailBottomBar } from "./TaskDetailBottomBar";
import { TaskTagsSection } from "./TaskTagsSection";
import { DigitalTimePicker } from "./DigitalTimePicker";
import { TaskPrioritySelect } from "./TaskPrioritySelect";
import { useTaskDetailActions } from "./hooks/useTaskDetailActions";

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
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState<number>(task.estimatedMinutes || 30);
  const [editDueDate, setEditDueDate] = useState<string>(
    task.dueDate ? task.dueDate.split("T")[0] : new Date().toISOString().split("T")[0]
  );

  const {
    isSaving,
    handleAutoSave,
    handleStartPomodoro,
    handleDuplicateTask,
    handleDelete,
  } = useTaskDetailActions({ task, onDelete, onNavigateToTimer });

  useEffect(() => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditEstimatedMinutes(task.estimatedMinutes || 30);
    setEditDueDate(
      task.dueDate ? task.dueDate.split("T")[0] : new Date().toISOString().split("T")[0]
    );
  }, [task]);

  return (
    <aside
      ref={detailPanelRef}
      style={{ width: `${detailWidth}px` }}
      className={`relative border-l border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex flex-col p-6 overflow-y-auto shrink-0 select-none ${
        isResizing ? "transition-none pointer-events-none" : "transition-[width] duration-150 ease-out"
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

      {/* Header: Title & Matrix Priority Selector */}
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
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="text-lg font-bold text-neutral-900 dark:text-white bg-transparent focus:outline-none flex-1 min-w-0 truncate"
            placeholder="Tên công việc"
          />

          <TaskPrioritySelect
            priority={editPriority}
            onChange={(newP) => {
              setEditPriority(newP);
              handleAutoSave({ priority: newP });
            }}
          />
        </div>
      </div>

      {/* Detail Frame (Due Date, Estimation) */}
      <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 mb-6 flex flex-col gap-3.5 pointer-events-auto">
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
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">Hạn chót</span>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => {
              const val = e.target.value;
              setEditDueDate(val);
              handleAutoSave({ dueDate: val });
            }}
            className="px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-lg text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] shadow-2xs transition-colors"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">Ước tính</span>
          <DigitalTimePicker
            valueMinutes={editEstimatedMinutes}
            onChange={(val) => {
              setEditEstimatedMinutes(val);
              handleAutoSave({ estimatedMinutes: val });
            }}
          />
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-6 pointer-events-auto">
        <TaskTagsSection task={task} onUpdateTags={(tagIds) => handleAutoSave({ tagIds })} />
      </div>

      {/* Subtasks Section */}
      <div className="pointer-events-auto">
        <TaskSubtasksSection task={task} />
      </div>

      {/* Sleek Bottom Action Toolbar */}
      <TaskDetailBottomBar
        isSaving={isSaving}
        onStartPomodoro={handleStartPomodoro}
        onDuplicateTask={handleDuplicateTask}
        onDelete={handleDelete}
      />
    </aside>
  );
}
