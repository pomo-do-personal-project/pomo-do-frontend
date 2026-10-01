"use client";

import React, { useState } from "react";

interface FocusItem {
  id: string;
  name: string;
  plannedMinutes: number; // Thời gian dự tính hoặc mục tiêu (100%)
  actualMinutes: number;  // Thời gian thực tế đã focus (có thể vượt 100% => Overtime)
  pomos: number;
  color: string;
  sourceType: "task" | "list"; // "task" = Task được tạo sẵn trong Task List, "list" = Phiên Pomo bật chạy tự do trong ngày
}

export function StatisticPage() {
  const [activeTab, setActiveTab] = useState<"focus" | "task">("focus");
  const [sourceFilter, setSourceFilter] = useState<"all" | "task" | "list">("all");
  const [timeRange, setTimeRange] = useState<"Today" | "Week" | "Month">("Today");

  // Sample data: Có task bình thường, có task overtime (vượt 100%), và có phiên list tự do
  const focusData: FocusItem[] = [
    {
      id: "1",
      name: "Code giao diện Statistics",
      plannedMinutes: 60,
      actualMinutes: 90, // Vượt 150% (+30m overtime)
      pomos: 3,
      color: "#3b82f6", // blue-500
      sourceType: "task",
    },
    {
      id: "2",
      name: "Setup Eisenhower Matrix",
      plannedMinutes: 50,
      actualMinutes: 50, // 100% đúng hạn
      pomos: 2,
      color: "#10b981", // emerald-500
      sourceType: "task",
    },
    {
      id: "3",
      name: "Phiên Pomo tự do buổi sáng",
      plannedMinutes: 30,
      actualMinutes: 30, // 100%
      pomos: 1,
      color: "#f59e0b", // amber-500
      sourceType: "list",
    },
    {
      id: "4",
      name: "Deep focus đọc tài liệu",
      plannedMinutes: 25,
      actualMinutes: 45, // Vượt 180% (+20m overtime)
      pomos: 2,
      color: "#8b5cf6", // purple-500
      sourceType: "list",
    },
  ];

  // Lọc dữ liệu theo sourceFilter (All, Task, hoặc List)
  const filteredData = focusData.filter((item) => {
    if (sourceFilter === "all") return true;
    return item.sourceType === sourceFilter;
  });

  const totalActualMinutes = filteredData.reduce((acc, cur) => acc + cur.actualMinutes, 0);
  const todayPomos = filteredData.reduce((acc, cur) => acc + cur.pomos, 0);
  const totalFocusHours = (totalActualMinutes / 60).toFixed(1);
  const streaksCount = 5;

  // Tổng thời gian overtime vượt định mức
  const totalOvertimeMinutes = filteredData.reduce((acc, cur) => {
    return acc + Math.max(0, cur.actualMinutes - cur.plannedMinutes);
  }, 0);

  // SVG Donut Ring Chart calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* 1. Top Tab Selector: Focus | Task */}
      <div className="inline-flex items-center p-1 bg-neutral-200/70 dark:bg-neutral-800/80 rounded-2xl border border-neutral-300 dark:border-neutral-700 shadow-2xs mb-8">
        <button
          onClick={() => setActiveTab("focus")}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "focus"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => setActiveTab("task")}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "task"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Task
        </button>
      </div>

      {/* 2. Overview Card Container */}
      <section className="w-full bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm mb-8 transition-colors">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
            Overview
          </h2>
          {totalOvertimeMinutes > 0 && activeTab === "focus" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Tổng Overtime hôm nay: +{totalOvertimeMinutes} phút
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* Item 1: Today focus */}
          <div className="flex flex-col items-center justify-center py-4 md:py-2">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
              Today focus
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {activeTab === "focus" ? totalFocusHours : filteredData.length}
              </span>
              <span className="text-sm text-neutral-400 font-semibold">
                {activeTab === "focus" ? "h" : "tasks"}
              </span>
            </div>
          </div>

          {/* Item 2: Today pomos */}
          <div className="flex flex-col items-center justify-center py-4 md:py-2">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
              {activeTab === "focus" ? "Today pomos" : "Completed tasks"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {activeTab === "focus" ? todayPomos : filteredData.filter((i) => i.actualMinutes >= i.plannedMinutes).length}
              </span>
              <span className="text-sm text-neutral-400 font-semibold">
                {activeTab === "focus" ? "pomos" : "done"}
              </span>
            </div>
          </div>

          {/* Item 3: Total focus */}
          <div className="flex flex-col items-center justify-center py-4 md:py-2">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
              {activeTab === "focus" ? "Total focus" : "Total tasks"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {activeTab === "focus" ? "14.2" : "28"}
              </span>
              <span className="text-sm text-neutral-400 font-semibold">
                {activeTab === "focus" ? "h" : "all"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom Row: Detail Card (Left 2/3) + Streaks Card (Right 1/3) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Card */}
        <section className="lg:col-span-2 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm transition-colors flex flex-col justify-between">
          {/* Header row: Detail Title + Filter List/Task + Filter < Today > */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              Detail
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              {/* List / Task Segmented Switch */}
              <div className="inline-flex items-center p-0.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
                <button
                  onClick={() => setSourceFilter("all")}
                  title="Tất cả thời gian focus"
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sourceFilter === "all"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSourceFilter("task")}
                  title="Tasks được tạo sẵn trong Task List"
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sourceFilter === "task"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  Task
                </button>
                <button
                  onClick={() => setSourceFilter("list")}
                  title="Phiên Pomo chạy tự do trong ngày"
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sourceFilter === "list"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  List
                </button>
              </div>

              {/* Time Range Filter: < Today > */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <button
                  onClick={() =>
                    setTimeRange((prev) =>
                      prev === "Today" ? "Week" : prev === "Week" ? "Month" : "Today"
                    )
                  }
                  className="hover:text-neutral-900 dark:hover:text-white cursor-pointer px-1 transition-colors"
                  title="Đổi khoảng thời gian"
                >
                  &lt; {timeRange} &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Chart + Task Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
            {/* Left Donut Ring Chart */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-neutral-200 dark:stroke-neutral-800"
                  strokeWidth="14"
                  fill="none"
                />

                {/* Dynamic colored segments */}
                {filteredData.map((task) => {
                  const percentage = totalActualMinutes > 0 ? task.actualMinutes / totalActualMinutes : 0;
                  const strokeDasharray = `${percentage * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += percentage * circumference;

                  return (
                    <circle
                      key={task.id}
                      cx="70"
                      cy="70"
                      r={radius}
                      stroke={task.color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-700 ease-out"
                    />
                  );
                })}
              </svg>

              {/* Inside Donut Center Info */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-neutral-900 dark:text-white">
                  {totalActualMinutes}
                </span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  phút
                </span>
              </div>
            </div>

            {/* Right Task Progress Bars */}
            <div className="sm:col-span-7 flex flex-col gap-4 w-full">
              {filteredData.map((item) => {
                const isOvertime = item.actualMinutes > item.plannedMinutes;
                const overtimeMinutes = item.actualMinutes - item.plannedMinutes;
                // Base percent đạt tới 100%
                const basePercent = Math.min(100, Math.round((item.actualMinutes / item.plannedMinutes) * 100));
                // Tỷ lệ overtime vượt thêm so với định mức (tối đa hiển thị thêm 40% để visual không vỡ)
                const overtimePercent = isOvertime
                  ? Math.min(40, Math.round((overtimeMinutes / item.plannedMinutes) * 100))
                  : 0;

                return (
                  <div key={item.id} className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-2 truncate max-w-[200px]">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.sourceType === "task" ? "bg-blue-500" : "bg-amber-500"
                          }`}
                          title={item.sourceType === "task" ? "Task định sẵn" : "List tự do"}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
                        <span className="text-neutral-900 dark:text-white font-bold">
                          {item.actualMinutes}m
                        </span>
                        <span className="text-neutral-400">/{item.plannedMinutes}m</span>
                        {isOvertime ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            +{overtimeMinutes}m OT
                          </span>
                        ) : basePercent === 100 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            100%
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Progress Bar Container: Base Fill + Overtime Striped Extension */}
                    <div className="relative w-full h-3.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 overflow-hidden p-0.5 flex">
                      {/* Base Progress Bar (lên tới 100%) */}
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${isOvertime ? (100 / (100 + overtimePercent)) * 100 : basePercent}%`,
                          backgroundColor: item.color,
                        }}
                      />

                      {/* Overtime Progress Extension (hiển thị màu đỏ cảnh báo Overtime) */}
                      {isOvertime && (
                        <div
                          className="h-full rounded-full bg-rose-500 relative transition-all duration-500 ease-out shadow-xs ml-0.5"
                          style={{
                            width: `${(overtimePercent / (100 + overtimePercent)) * 100}%`,
                          }}
                          title={`Vượt ${overtimeMinutes} phút so với kế hoạch`}
                        >
                          {/* Chấm sáng nhấp nháy ở mút thanh overtime */}
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/80 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Streaks Card */}
        <section className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md rounded-3xl border-2 border-neutral-300 dark:border-neutral-700 p-6 md:p-8 shadow-sm transition-colors flex flex-col items-center justify-center text-center min-h-[240px]">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Streaks
          </h2>

          <div className="flex flex-col items-center justify-center my-auto">
            <span className="text-6xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none mb-2">
              {streaksCount}
            </span>
            <span className="text-base font-semibold text-neutral-500 dark:text-neutral-400">
              days
            </span>
          </div>

          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
            Duy trì thói quen tập trung mỗi ngày! 🔥
          </p>
        </section>
      </div>
    </div>
  );
}
