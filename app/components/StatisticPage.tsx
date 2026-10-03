"use client";

import React, { useState, useEffect } from "react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTaskStore } from "../stores/useTaskStore";
import { FocusSessionDto, FocusSessionMode } from "../types/api";

const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

export function StatisticPage() {
  const [activeTab, setActiveTab] = useState<"focus" | "task">("focus");
  const [sourceFilter, setSourceFilter] = useState<"all" | "task" | "list">("all");
  const [timeRange, setTimeRange] = useState<"Today" | "Week" | "Month">("Today");

  // Zustand stores
  const summary = usePomodoroStore((s) => s.summary);
  const history = usePomodoroStore((s) => s.history);
  const isLoading = usePomodoroStore((s) => s.isLoading);
  const error = usePomodoroStore((s) => s.error);
  const fetchSummary = usePomodoroStore((s) => s.fetchSummary);
  const fetchHistory = usePomodoroStore((s) => s.fetchHistory);

  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  // Fetch summary and history on mount or range change
  useEffect(() => {
    fetchSummary();
    fetchTasks();

    const now = new Date();
    let fromUtc: string | undefined;

    if (timeRange === "Today") {
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
      fromUtc = todayStart.toISOString();
    } else if (timeRange === "Week") {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      fromUtc = weekStart.toISOString();
    } else if (timeRange === "Month") {
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      fromUtc = monthStart.toISOString();
    }

    fetchHistory(fromUtc);
  }, [fetchSummary, fetchHistory, fetchTasks, timeRange]);

  // Aggregate sessions by Task or Free Pomo
  const processedItems = React.useMemo(() => {
    // Map aggregation
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        plannedMinutes: number;
        actualMinutes: number;
        overtimeMinutes: number;
        pomos: number;
        color: string;
        sourceType: "task" | "list";
      }
    >();

    history.forEach((session, index) => {
      const isTask = !!session.taskId;
      const key = isTask ? `task-${session.taskId}` : `session-${session.id}`;
      const name = session.taskTitle || session.note || (session.mode === FocusSessionMode.Pomo ? "Phiên Pomodoro tự do" : "Phiên Stopwatch tự do");
      const color = PALETTE[index % PALETTE.length];

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name,
          plannedMinutes: session.durationMinutes || 25,
          actualMinutes: session.actualMinutes,
          overtimeMinutes: session.overtimeMinutes,
          pomos: session.isCompleted ? 1 : 0,
          color,
          sourceType: isTask ? "task" : "list",
        });
      } else {
        const existing = map.get(key)!;
        existing.plannedMinutes += session.durationMinutes || 25;
        existing.actualMinutes += session.actualMinutes;
        existing.overtimeMinutes += session.overtimeMinutes;
        if (session.isCompleted) existing.pomos += 1;
      }
    });

    return Array.from(map.values());
  }, [history]);

  // Filter based on source (all | task | list)
  const filteredData = React.useMemo(() => {
    if (sourceFilter === "all") return processedItems;
    return processedItems.filter((i) => i.sourceType === sourceFilter);
  }, [processedItems, sourceFilter]);

  // Metric computations
  const totalActualMinutes = filteredData.reduce((acc, cur) => acc + cur.actualMinutes, 0);
  const totalOvertimeMinutes = filteredData.reduce((acc, cur) => acc + cur.overtimeMinutes, 0);
  const todayPomos = summary?.totalPomosToday ?? filteredData.reduce((acc, cur) => acc + cur.pomos, 0);
  const todayFocusHours = (
    (summary?.totalFocusMinutesToday ?? totalActualMinutes) / 60
  ).toFixed(1);
  const totalFocusHours = (totalActualMinutes / 60).toFixed(1);
  const streaksCount = summary?.currentStreak ?? 0;

  // SVG Donut Ring Chart calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full transition-colors">
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
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white">
              Overview
            </h2>
            {isLoading && (
              <span className="text-xs text-neutral-400 font-mono animate-pulse">
                Đang đồng bộ...
              </span>
            )}
          </div>

          {(summary?.totalOvertimeMinutesToday || totalOvertimeMinutes) > 0 && activeTab === "focus" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Tổng Overtime hôm nay: +{summary?.totalOvertimeMinutesToday ?? totalOvertimeMinutes} phút
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
                {activeTab === "focus" ? todayFocusHours : tasks.length}
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
                {activeTab === "focus"
                  ? todayPomos
                  : tasks.filter((t) => t.status === 3).length}
              </span>
              <span className="text-sm text-neutral-400 font-semibold">
                {activeTab === "focus" ? "pomos" : "done"}
              </span>
            </div>
          </div>

          {/* Item 3: Total focus / Total tasks */}
          <div className="flex flex-col items-center justify-center py-4 md:py-2">
            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
              {activeTab === "focus" ? "Total focus" : "Total tasks"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                {activeTab === "focus" ? totalFocusHours : tasks.length}
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
          {/* Header row: Detail Title + Filter List/Task + Filter < Today/Week/Month > */}
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
                  title="Tasks được liên kết từ Task List"
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
                  title="Đổi khoảng thời gian thống kê"
                >
                  &lt; {timeRange} &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Chart + Task Bars */}
          {filteredData.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
              Chưa có phiên tập trung nào trong {timeRange}. Hãy bắt đầu đếm giờ ở Dashboard!
            </div>
          ) : (
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
                  const overtimeMinutes = item.overtimeMinutes || Math.max(0, item.actualMinutes - item.plannedMinutes);
                  const basePercent = Math.min(100, Math.round((item.actualMinutes / item.plannedMinutes) * 100));
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
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${isOvertime ? (100 / (100 + overtimePercent)) * 100 : basePercent}%`,
                            backgroundColor: item.color,
                          }}
                        />

                        {isOvertime && (
                          <div
                            className="h-full rounded-full bg-rose-500 relative transition-all duration-500 ease-out shadow-xs ml-0.5"
                            style={{
                              width: `${(overtimePercent / (100 + overtimePercent)) * 100}%`,
                            }}
                            title={`Vượt ${overtimeMinutes} phút so với kế hoạch`}
                          >
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/80 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
              ngày liên tục 🔥
            </span>
            {summary?.longestStreak ? (
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 font-mono">
                Kỷ lục: {summary.longestStreak} ngày
              </span>
            ) : null}
          </div>

          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">
            Duy trì thói quen tập trung mỗi ngày!
          </p>
        </section>
      </div>
    </div>
  );
}
