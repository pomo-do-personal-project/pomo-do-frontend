"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { TaskStatus, Priority } from "../types/api";
import {
  X,
  ChevronDown,
  ClipboardList,
  Zap,
  Check,
  Plus,
  Clock,
} from "lucide-react";

interface OverviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OverviewPanel({ isOpen, onClose }: OverviewPanelProps) {
  const { tasks, isLoading, isSaving, fetchTasks, createTask, toggleTaskStatus } = useTaskStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickAddActive, setIsQuickAddActive] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, fetchTasks]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tasks based on mode: Quick Add tasks vs Planned/Daily tasks
  const quickAddTasks = React.useMemo(() => {
    return tasks.filter((t) => t.isQuickAdd);
  }, [tasks]);

  const dailyTasks = React.useMemo(() => {
    return tasks.filter((t) => !t.isQuickAdd);
  }, [tasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSaving) return;

    try {
      await createTask({
        title: newTaskTitle.trim(),
        priority: Priority.ImportantNotUrgent,
        estimatedMinutes: 25,
        estimatedPomodoros: 1,
        isQuickAdd: isQuickAddActive, // Đánh dấu true nếu thêm từ tab Quick Add
      });
      setNewTaskTitle("");
      setIsInputExpanded(false);
    } catch {
      // Handled in store
    }
  };

  const handleToggleTask = async (id: string) => {
    await toggleTaskStatus(id);
  };

  const completedCount = tasks.filter((t) => t.status === TaskStatus.Completed).length;
  const totalMinutes = tasks.reduce(
    (acc, t) => acc + (t.status === TaskStatus.Completed ? t.estimatedMinutes || 25 : 0),
    0
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <aside
      className={`fixed top-0 right-0 bottom-0 z-30 flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-l border-neutral-200/80 dark:border-neutral-800/80 select-none shadow-sm transition-[width] duration-300 ease-in-out ${
        isOpen ? "w-80 sm:w-96 visible" : "w-0 overflow-hidden invisible border-none"
      }`}
    >
      <div className="w-80 sm:w-96 flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Panel Header (h-14 match Top Header) */}
        <div className="h-14 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 mb-6 shrink-0 -mt-6">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Overview
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng Overview"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Stats Section: Done focus & Done tasks */}
        <div className="grid grid-cols-2 gap-3 mb-8 shrink-0">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Done focus
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {totalHours}h
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Done tasks
            </span>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
              {completedCount}/{tasks.length}
            </span>
          </div>
        </div>

        {/* Daily Task & Quick Add Mode Dropdown */}
        <div className="relative mb-4 shrink-0" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white py-1 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                {isQuickAddActive ? (
                  <>
                    <Zap size={15} strokeWidth={2} className="text-amber-500" />
                    <span>Quick Add (Ghi nhanh)</span>
                  </>
                ) : (
                  <>
                    <ClipboardList size={15} strokeWidth={1.75} className="text-blue-500" />
                    <span>Daily Task (Kế hoạch)</span>
                  </>
                )}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                ({isQuickAddActive ? quickAddTasks.length : dailyTasks.length})
              </span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`text-neutral-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Dropdown Menu when clicking selector */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsQuickAddActive(false);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                  !isQuickAddActive
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList size={14} strokeWidth={1.75} className="text-blue-500" />
                  <span>Daily Task List</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-neutral-400 font-mono">({dailyTasks.length})</span>
                  {!isQuickAddActive && <Check size={12} strokeWidth={2.5} className="text-emerald-500" />}
                </div>
              </button>
              <button
                onClick={() => {
                  setIsQuickAddActive(true);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                  isQuickAddActive
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} strokeWidth={2} className="text-amber-500" />
                  <span>Quick Add (Parked)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-neutral-400 font-mono">({quickAddTasks.length})</span>
                  {isQuickAddActive && <Check size={12} strokeWidth={2.5} className="text-emerald-500" />}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 1. Quick Add Mode: Hiển thị nút (+) nhập nhanh VÀ danh sách các Quick Add task đã lưu */}
        {isQuickAddActive ? (
          <div className="flex-1 flex flex-col gap-3">
            {!isInputExpanded ? (
              <button
                onClick={() => setIsInputExpanded(true)}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/80 hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <Plus size={16} strokeWidth={2.2} />
                <span>Ghi nhanh ý nghĩ phát sinh (Quick Add)</span>
              </button>
            ) : (
              <form onSubmit={handleAddTask} className="flex flex-col gap-3 bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-xs">
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ghi nhanh suy nghĩ nảy ra (nhấn Enter)..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInputExpanded(false);
                      setNewTaskTitle("");
                    }}
                    className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu nhanh"}
                  </button>
                </div>
              </form>
            )}

            {/* Danh sách các task Quick Add đã lưu */}
            <div className="flex flex-col gap-2.5 flex-1 mt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Các ý nghĩ đã ghi nhận ({quickAddTasks.length})
              </div>

              {quickAddTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-400 dark:text-neutral-500 italic">
                  Chưa có ghi chú nhanh nào. Khi đang tập trung, hãy ghi lại tại đây!
                </div>
              ) : (
                quickAddTasks.map((task) => {
                  const isCompleted = task.status === TaskStatus.Completed;

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                        isCompleted
                          ? "bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800 text-neutral-400"
                          : "bg-white dark:bg-neutral-800/80 border-amber-200/70 dark:border-amber-800/50 text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-amber-400"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-neutral-400 dark:border-neutral-600"
                        }`}
                      >
                        {isCompleted && <Check size={11} strokeWidth={2.5} />}
                      </div>

                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <span
                          className={`text-sm leading-snug break-words ${
                            isCompleted ? "line-through opacity-60" : "font-medium"
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Zap size={10} strokeWidth={2} />
                            <span>Quick Add</span>
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-0.5">
                            <Clock size={10} strokeWidth={1.75} />
                            <span>{task.estimatedMinutes || 25}m</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* 2. Daily Task Mode: Hiển thị danh sách task kế hoạch thông thường */
          <div className="flex flex-col gap-2.5 flex-1">
            {isLoading && dailyTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                Đang tải danh sách công việc...
              </div>
            ) : dailyTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                Chưa có công việc kế hoạch nào hôm nay.
              </div>
            ) : (
              dailyTasks.map((task) => {
                const isCompleted = task.status === TaskStatus.Completed;

                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ${
                      isCompleted
                        ? "bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800 text-neutral-400"
                        : "bg-white dark:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-neutral-400"
                    }`}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-neutral-400 dark:border-neutral-600"
                      }`}
                    >
                      {isCompleted && <Check size={11} strokeWidth={2.5} />}
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <span
                        className={`text-sm leading-snug break-words ${
                          isCompleted ? "line-through opacity-60" : "font-medium"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Tomato Progress indicator */}
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 font-mono">
                        ⏱ ({task.completedPomodoros || 0}/{task.estimatedPomodoros || 1} 🍅)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
