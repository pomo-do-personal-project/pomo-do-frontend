"use client";

import React, { useState, useEffect } from "react";
import { TaskDto, Priority, TaskStatus } from "../../types/api";
import { Zap, ArrowLeft, X } from "lucide-react";
import { TaskSubtasksSection } from "./TaskSubtasksSection";
import { TaskDetailBottomBar } from "./TaskDetailBottomBar";
import { TaskTagsSection } from "./TaskTagsSection";
import { DigitalTimePicker } from "./DigitalTimePicker";
import { TaskPrioritySelect } from "./TaskPrioritySelect";
import { TaskStatusSelect } from "./TaskStatusSelect";
import { TaskDueTimePicker } from "./TaskDueTimePicker";
import { useTaskDetailActions } from "./hooks/useTaskDetailActions";
import { useSettingsStore } from "../../stores/useSettingsStore";

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
  onClose,
  onDelete,
  onNavigateToTimer,
  detailPanelRef,
}: TaskDetailDrawerProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState<number>(task.estimatedMinutes || 30);
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const checkXl = () => setIsXl(window.innerWidth >= 1280);
    checkXl();
    window.addEventListener("resize", checkXl);
    return () => window.removeEventListener("resize", checkXl);
  }, []);

  const { isSaving, handleAutoSave, handleStartPomodoro, handleDuplicateTask, handleDelete } =
    useTaskDetailActions({ task, onDelete, onNavigateToTimer });

  useEffect(() => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditEstimatedMinutes(task.estimatedMinutes || 30);
  }, [task]);

  return (
    <>
      {/* Overlay Backdrop on screens < xl (tablet & mobile) */}
      {!isXl && onClose && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs xl:hidden animate-in fade-in duration-150"
        />
      )}

      <aside
        ref={detailPanelRef}
        style={isXl ? { width: `${detailWidth}px` } : undefined}
        className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-lg xl:max-w-none xl:relative xl:inset-auto xl:z-auto flex flex-col p-4 sm:p-6 overflow-y-auto shrink-0 select-none shadow-2xl transition-all ${
          wallpaperUrl
            ? "border-l border-white/15 bg-neutral-950/95 xl:bg-black/45 backdrop-blur-2xl text-white"
            : "border-l border-neutral-200 bg-white/98 xl:bg-white/95 backdrop-blur-2xl text-neutral-900"
        } ${
          isResizing ? "transition-none pointer-events-none" : "transition-[width] duration-150 ease-out"
        }`}
      >
        {/* Resize Handle Bar (desktop xl only) */}
        <div
          onMouseDown={onStartResize}
          title="Kéo sang trái/phải để co giãn khung chi tiết"
          className="hidden xl:flex absolute top-0 left-0 bottom-0 w-3 cursor-col-resize hover:bg-neutral-400/30 dark:hover:bg-neutral-500/30 transition-colors z-20 group items-center justify-center -ml-1.5 pointer-events-auto"
        >
          <div
            className={`w-1 h-10 rounded-full transition-colors ${
              wallpaperUrl ? "bg-white/30 group-hover:bg-white/60" : "bg-neutral-300 group-hover:bg-neutral-500"
            }`}
          />
        </div>

        {/* Mobile & Tablet Top Back Button (< xl) */}
        {onClose && (
          <div className="flex items-center justify-between pb-3 mb-2 xl:hidden border-b border-black/10 dark:border-white/15">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Quay lại</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

      {/* Header: Title & Matrix Priority Selector */}
      <div
        className={`relative z-30 pb-3 mb-6 pointer-events-auto border-b ${
          wallpaperUrl ? "border-white/20" : "border-neutral-200"
        }`}
      >
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
            className={`text-lg font-bold bg-transparent focus:outline-none flex-1 min-w-0 truncate transition-colors ${
              task.status === TaskStatus.Completed
                ? wallpaperUrl
                  ? "line-through text-white/40"
                  : "line-through text-neutral-400"
                : wallpaperUrl
                ? "text-white placeholder:text-white/40"
                : "text-neutral-900 placeholder:text-neutral-400"
            }`}
            placeholder="Tên công việc"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <TaskPrioritySelect
              priority={editPriority}
              onChange={(newP) => {
                setEditPriority(newP);
                handleAutoSave({ priority: newP });
              }}
            />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Đóng chi tiết"
                className="hidden md:flex p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Frame (Status, Due Date & Time, Estimation) */}
      <div
        className={`p-4 rounded-2xl mb-6 flex flex-col gap-3.5 pointer-events-auto backdrop-blur-md relative z-20 ${
          wallpaperUrl
            ? "border border-white/15 bg-white/10"
            : "border border-neutral-200 bg-neutral-50/80"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              wallpaperUrl ? "text-white/70" : "text-neutral-500"
            }`}
          >
            Chi tiết công việc
          </span>
          {task.isQuickAdd && (
            <span className="text-[11px] font-semibold text-amber-500 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Zap size={12} strokeWidth={2} className="shrink-0" />
              <span>Nguồn: Quick Add</span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${wallpaperUrl ? "text-white/80" : "text-neutral-700"}`}>
            Trạng thái
          </span>
          <TaskStatusSelect
            status={task.status}
            onChange={(newStatus) => handleAutoSave({ status: newStatus })}
          />
        </div>

        <TaskDueTimePicker
          dueDate={task.dueDate}
          onSaveDueDate={(val) => handleAutoSave({ dueDate: val })}
        />

        <div
          className={`flex items-center justify-between text-xs pt-1 border-t ${
            wallpaperUrl ? "border-white/15" : "border-neutral-200"
          }`}
        >
          <span className={`font-medium ${wallpaperUrl ? "text-white/80" : "text-neutral-700"}`}>
            Ước tính
          </span>
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
      <div className="mb-6 pointer-events-auto relative z-10">
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
    </>
  );
}
