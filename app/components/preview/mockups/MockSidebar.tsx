"use client";

import React from "react";
import { LayoutDashboard, CheckSquare, Grid2X2, BarChart3 } from "lucide-react";
import { Logo } from "../../Logo";
import { ScreenId } from "../types";

interface MockSidebarProps {
  activeScreen: ScreenId;
}

export const MockSidebar = React.memo(function MockSidebar({
  activeScreen,
}: MockSidebarProps) {
  return (
    <div className="w-18 bg-white border-r border-neutral-200/80 flex flex-col items-center justify-between py-4 shrink-0 select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center mb-2">
          <Logo iconOnly size={32} />
        </div>

        <div
          title="1. Đồng hồ Tổng quan (Timer Center)"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-default ${
            activeScreen === "timer"
              ? "bg-neutral-900 text-white shadow-xs"
              : "text-neutral-400"
          }`}
        >
          <LayoutDashboard size={20} strokeWidth={2} />
        </div>

        <div
          title="2. Danh sách Công việc (Task Page)"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-default ${
            activeScreen === "task"
              ? "bg-neutral-900 text-white shadow-xs"
              : "text-neutral-400"
          }`}
        >
          <CheckSquare size={20} strokeWidth={1.75} />
        </div>

        <div
          title="3. Ma trận Eisenhower (Matrix Page)"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-default ${
            activeScreen === "matrix"
              ? "bg-neutral-900 text-white shadow-xs"
              : "text-neutral-400"
          }`}
        >
          <Grid2X2 size={20} strokeWidth={1.75} />
        </div>

        <div
          title="4 & 5. Thống kê & Bản đồ nhiệt (Statistic Page)"
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-default ${
            activeScreen === "stat-focus" || activeScreen === "stat-task"
              ? "bg-neutral-900 text-white shadow-xs"
              : "text-neutral-400"
          }`}
        >
          <BarChart3 size={20} strokeWidth={1.75} />
        </div>
      </div>

      <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
        AN
      </div>
    </div>
  );
});
