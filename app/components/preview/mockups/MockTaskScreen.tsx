"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Zap,
  Plus,
  CheckCircle2,
  X,
} from "lucide-react";
import { MockTopBar } from "./MockTopBar";

interface MockTaskScreenProps {
  mockTasks: string[];
  setMockTasks: React.Dispatch<React.SetStateAction<string[]>>;
  timerSeconds?: number;
  isTimerRunning?: boolean;
}

export const MockTaskScreen = React.memo(function MockTaskScreen({
  mockTasks,
  setMockTasks,
  timerSeconds,
  isTimerRunning,
}: MockTaskScreenProps) {
  const [taskCategory] = useState<"Today" | "Upcoming" | "QuickAdd" | "Calendar">("Today");
  const [newTaskInput] = useState("");

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      <MockTopBar
        showMiniTimer={true}
        timerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
      />

      <div className="flex-1 flex min-h-0">
        {/* Sidebar Thu Nhỏ Bên Trong Trang Task */}
        <div className="w-56 border-r border-neutral-200/80 p-4 shrink-0 flex flex-col justify-between select-none">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2 px-2">
                DANH MỤC
              </span>
              <div className="space-y-1">
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-default ${
                    taskCategory === "Today"
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Hôm nay</span>
                  </span>
                  <span className="text-[11px] font-mono opacity-80">
                    {mockTasks.length}
                  </span>
                </div>

                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-default ${
                    taskCategory === "Upcoming"
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Sắp tới</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">1</span>
                </div>

                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-default ${
                    taskCategory === "QuickAdd"
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Zap size={14} />
                    <span>Quick Add</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">0</span>
                </div>

                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-default ${
                    taskCategory === "Calendar"
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Lịch biểu</span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">1</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2 px-2">
                THẺ PHÂN LOẠI
              </span>
              <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span>Tất cả (1)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Khung Danh Sách Việc Today */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-black text-neutral-900 mb-5">Today</h2>

          {/* Ô Nhập Việc Mới Nét Đứt (Chỉ xem mô phỏng) */}
          <div className="w-full p-3.5 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-400 text-xs font-medium flex items-center gap-2 bg-white select-none cursor-default">
            <Plus size={16} />
            <input
              type="text"
              readOnly
              tabIndex={-1}
              placeholder="Thêm công việc mới..."
              value={newTaskInput}
              className="w-full bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400 text-xs pointer-events-none select-none cursor-default"
            />
          </div>

          {/* Danh Sách Nhiệm Vụ Hoặc Trạng Thái Trống */}
          {mockTasks.length === 0 ? (
            <div className="my-auto py-16 text-center text-xs text-neutral-400 italic">
              Chưa có công việc nào trong mục Hôm nay. Hãy thêm công việc mới ở trên!
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {mockTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="font-semibold text-neutral-900">{t}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMockTasks((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-neutral-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
