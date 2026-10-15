"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useAuthStore } from "../stores/useAuthStore";
import { FocusSessionMode } from "../types/api";
import { StatisticOverviewCard } from "./statistics/StatisticOverviewCard";
import { StatisticDetailChart, StatisticItem } from "./statistics/StatisticDetailChart";
import { StatisticStreaksCard } from "./statistics/StatisticStreaksCard";

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

  const summary = usePomodoroStore((s) => s.summary);
  const history = usePomodoroStore((s) => s.history);
  const isLoading = usePomodoroStore((s) => s.isLoading);
  const fetchSummary = usePomodoroStore((s) => s.fetchSummary);
  const fetchHistory = usePomodoroStore((s) => s.fetchHistory);

  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      usePomodoroStore.getState().resetPomodoroStore();
      useTaskStore.getState().resetTaskStore();
      return;
    }

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
  }, [fetchSummary, fetchHistory, fetchTasks, timeRange, isAuthenticated]);

  const processedItems = useMemo<StatisticItem[]>(() => {
    const map = new Map<string, StatisticItem>();

    history.forEach((session, index) => {
      const isTask = !!session.taskId;
      const key = isTask ? `task-${session.taskId}` : `session-${session.id}`;
      let title = session.taskTitle;
      let aiData: any = null;

      if (session.note) {
        try {
          const parsed = JSON.parse(session.note);
          if (parsed && typeof parsed === "object") {
            if (parsed.ai) aiData = parsed.ai;
            if (parsed.title) title = title || parsed.title;
          }
        } catch {
          title = title || session.note;
        }
      }

      if (!aiData && typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(`pomo_ai_session_${session.id}`);
          if (cached) aiData = JSON.parse(cached);
        } catch {}
      }

      const name = title || (session.mode === FocusSessionMode.Pomo ? "Tự do" : "Stopwatch");
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
          aiData,
          sessionId: session.id,
        });
      } else {
        const existing = map.get(key)!;
        existing.plannedMinutes += session.durationMinutes || 25;
        existing.actualMinutes += session.actualMinutes;
        existing.overtimeMinutes += session.overtimeMinutes;
        if (!existing.aiData && aiData) existing.aiData = aiData;
        if (session.isCompleted) existing.pomos += 1;
      }
    });

    return Array.from(map.values());
  }, [history]);

  const filteredData = useMemo(() => {
    if (sourceFilter === "all") return processedItems;
    return processedItems.filter((i) => i.sourceType === sourceFilter);
  }, [processedItems, sourceFilter]);

  const totalActualMinutes = filteredData.reduce((acc, cur) => acc + cur.actualMinutes, 0);
  const totalOvertimeMinutes = filteredData.reduce((acc, cur) => acc + cur.overtimeMinutes, 0);
  const todayPomos = summary?.totalPomosToday ?? filteredData.reduce((acc, cur) => acc + cur.pomos, 0);
  const todayFocusHours = ((summary?.totalFocusMinutesToday ?? totalActualMinutes) / 60).toFixed(1);
  const totalFocusHours = (totalActualMinutes / 60).toFixed(1);

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

      {/* 2. Overview Card */}
      <StatisticOverviewCard
        activeTab={activeTab}
        todayFocusHours={todayFocusHours}
        todayPomos={todayPomos}
        totalFocusHours={totalFocusHours}
        tasksCount={tasks.length}
        completedTasksCount={tasks.filter((t) => t.status === 3).length}
        overtimeMinutes={summary?.totalOvertimeMinutesToday ?? totalOvertimeMinutes}
        isLoading={isLoading}
      />

      {/* 3. Detail & Streaks */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatisticDetailChart
          items={processedItems}
          sourceFilter={sourceFilter}
          onSetSourceFilter={setSourceFilter}
          timeRange={timeRange}
          onSetTimeRange={setTimeRange}
        />

        <StatisticStreaksCard
          streaksCount={summary?.currentStreak ?? 0}
          longestStreak={summary?.longestStreak}
        />
      </div>
    </div>
  );
}
