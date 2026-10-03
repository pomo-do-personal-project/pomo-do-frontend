"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { TaskStatus, Priority } from "../types/api";

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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSaving) return;

    try {
      await createTask({
        title: newTaskTitle.trim(),
        priority: Priority.ImportantNotUrgent,
        estimatedMinutes: 25,
        estimatedPomodoros: 1,
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
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Stats Section: Today focus & Completed tasks */}
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

        {/* Daily Task Section with Dropdown Arrow */}
        <div className="relative mb-4 shrink-0" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white py-1 transition-colors cursor-pointer group"
            >
              <span>{isQuickAddActive ? "Quick Add" : "Daily Task"}</span>
              {!isQuickAddActive && (
                <span className="text-xs text-neutral-400">({tasks.length})</span>
              )}
              <span
                className={`text-neutral-400 text-xs transition-transform duration-200 font-mono ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                v
              </span>
            </button>
          </div>

          {/* Dropdown Menu when clicking dropdown button */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsQuickAddActive(false);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                  !isQuickAddActive
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span>Daily Task List</span>
                {!isQuickAddActive && <span className="text-[10px] text-emerald-500">✓</span>}
              </button>
              <button
                onClick={() => {
                  setIsQuickAddActive(true);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                  isQuickAddActive
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span>Quick Add</span>
                {isQuickAddActive && <span className="text-[10px] text-emerald-500">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* 1. Quick Add Mode: Only shows the big (+) button and form */}
        {isQuickAddActive ? (
          <div className="flex-1 flex flex-col gap-3">
            {!isInputExpanded ? (
              <button
                onClick={() => setIsInputExpanded(true)}
                className="w-full h-14 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-400 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white text-2xl font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                +
              </button>
            ) : (
              <form onSubmit={handleAddTask} className="flex flex-col gap-3 bg-neutral-50/50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-xs">
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Nhập nội dung task mới..."
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 transition-colors"
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
                    className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Đang thêm..." : "Thêm"}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-4">
              Nhấn (+) để nhập nhanh công việc mới vào Backend
            </p>
          </div>
        ) : (
          /* 2. Daily Task Mode: Shows the task items list */
          <div className="flex flex-col gap-2.5 flex-1">
            {isLoading && tasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                Đang tải danh sách công việc...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-400">
                Chưa có công việc nào hôm nay.
              </div>
            ) : (
              tasks.map((task) => {
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
                      className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center text-[10px] shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-neutral-400 dark:border-neutral-600"
                      }`}
                    >
                      {isCompleted && "✓"}
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
