"use client";

import React, { useState } from "react";
import { MatrixQuadrant } from "./TaskPage";

interface MatrixTask {
  id: string;
  title: string;
  quadrant: MatrixQuadrant;
  completed: boolean;
}

const QUADRANTS: {
  id: MatrixQuadrant;
  title: string;
  subtitle: string;
  borderColor: string;
  badgeBg: string;
}[] = [
  {
    id: "urgent-important",
    title: "Urgent & Important",
    subtitle: "Do First (Làm ngay)",
    borderColor: "border-rose-400/80 dark:border-rose-500/60",
    badgeBg: "bg-rose-500 text-white",
  },
  {
    id: "not-urgent-important",
    title: "Not Urgent & Important",
    subtitle: "Schedule (Lên kế hoạch)",
    borderColor: "border-blue-400/80 dark:border-blue-500/60",
    badgeBg: "bg-blue-500 text-white",
  },
  {
    id: "urgent-not-important",
    title: "Urgent & Not Important",
    subtitle: "Delegate (Ủy quyền / Việc gấp)",
    borderColor: "border-amber-400/80 dark:border-amber-500/60",
    badgeBg: "bg-amber-500 text-white",
  },
  {
    id: "not-urgent-not-important",
    title: "Not Urgent & Not Important",
    subtitle: "Don't Do (Loại bỏ / Thư giãn)",
    borderColor: "border-neutral-400/80 dark:border-neutral-600/60",
    badgeBg: "bg-neutral-500 text-white",
  },
];

export function MatrixPage() {
  const [tasks, setTasks] = useState<MatrixTask[]>([
    { id: "1", title: "Thiết kế giao diện Task Management", quadrant: "urgent-important", completed: false },
    { id: "2", title: "Nộp báo cáo tiến độ Sprint", quadrant: "urgent-important", completed: false },
    { id: "3", title: "Học kiến trúc React 19 server actions", quadrant: "not-urgent-important", completed: false },
    { id: "4", title: "Đọc sách phát triển bản thân 30p", quadrant: "not-urgent-important", completed: true },
    { id: "5", title: "Phản hồi các email thông báo thường", quadrant: "urgent-not-important", completed: false },
    { id: "6", title: "Lướt mạng xã hội xem tin giải trí", quadrant: "not-urgent-not-important", completed: false },
  ]);

  const [activeInputQuadrant, setActiveInputQuadrant] = useState<MatrixQuadrant | null>(null);
  const [quickInput, setQuickInput] = useState("");

  const handleAddTask = (quadrant: MatrixQuadrant) => {
    if (!quickInput.trim()) return;
    const newTask: MatrixTask = {
      id: Date.now().toString(),
      title: quickInput.trim(),
      quadrant,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setQuickInput("");
    setActiveInputQuadrant(null);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto w-full transition-colors">
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6">
        Matrix
      </h1>

      {/* 4 Quadrants Grid matching the exact wireframe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[500px]">
        {QUADRANTS.map((quad) => {
          const quadTasks = tasks.filter((t) => t.quadrant === quad.id);
          const isAdding = activeInputQuadrant === quad.id;

          return (
            <div
              key={quad.id}
              className={`p-5 rounded-3xl border-2 ${quad.borderColor} bg-transparent flex flex-col transition-all duration-200 shadow-2xs hover:shadow-xs`}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    {quad.title}
                  </h2>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                    {quad.subtitle}
                  </span>
                </div>

                {/* Add Task Button for this quadrant */}
                <button
                  onClick={() => {
                    setActiveInputQuadrant(isAdding ? null : quad.id);
                    setQuickInput("");
                  }}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  title="Thêm task vào ô này"
                >
                  {isAdding ? "✕" : "+"}
                </button>
              </div>

              {/* Quick Input when active */}
              {isAdding && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask(quad.id);
                  }}
                  className="mb-3"
                >
                  <input
                    type="text"
                    autoFocus
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Nhập task mới rồi nhấn Enter..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-white"
                  />
                </form>
              )}

              {/* Tasks List within this quadrant */}
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-64 pr-1">
                {quadTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 italic py-6">
                    Không có công việc nào
                  </div>
                ) : (
                  quadTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                        t.completed
                          ? "bg-neutral-100/40 dark:bg-neutral-900/30 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400"
                          : "bg-white/60 dark:bg-neutral-800/50 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 shadow-2xs hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center text-[9px] shrink-0 ${
                            t.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-neutral-400 dark:border-neutral-600"
                          }`}
                        >
                          {t.completed && "✓"}
                        </span>
                        <span
                          className={`text-xs sm:text-sm truncate ${
                            t.completed ? "line-through text-neutral-400" : "font-medium"
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>

                      <button
                        onClick={(e) => deleteTask(t.id, e)}
                        className="text-xs text-neutral-400 hover:text-rose-500 px-1 transition-colors cursor-pointer"
                        title="Xóa task"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
