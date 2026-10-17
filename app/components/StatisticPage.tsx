"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useTagStore } from "../stores/useTagStore";
import { useAuthStore } from "../stores/useAuthStore";
import { FocusHeatmapResponse, FocusSessionMode } from "../types/api";
import { analyticsService } from "../services/analyticsService";
import { StatisticDetailChart, StatisticItem } from "./statistics/StatisticDetailChart";
import { StatisticStreaksCard } from "./statistics/StatisticStreaksCard";
import { FocusHeatmapCard } from "./statistics/FocusHeatmapCard";
import { AiCircadianInsightCard } from "./statistics/AiCircadianInsightCard";
import { TaskEisenhowerDistributionCard } from "./statistics/TaskEisenhowerDistributionCard";
import { TaskCompletionStatsCard } from "./statistics/TaskCompletionStatsCard";
import { TaskTagsDistributionCard } from "./statistics/TaskTagsDistributionCard";
import { RecentlyCompletedTasksCard } from "./statistics/RecentlyCompletedTasksCard";
import { mapHistoryToStatisticItems } from "./statistics/statisticHelpers";
import { formatDurationCompact } from "../utils/dateUtils";

export function StatisticPage() {
  const [activeTab, setActiveTab] = useState<"focus" | "task">("focus");
  const [sourceFilter, setSourceFilter] = useState<"all" | "task" | "list">("all");
  const [timeRange, setTimeRange] = useState<"Today" | "Week" | "Month">("Today");
  const [heatmapRangeDays, setHeatmapRangeDays] = useState<number>(30);
  const [heatmapData, setHeatmapData] = useState<FocusHeatmapResponse | null>(null);
  const [isHeatmapLoading, setIsHeatmapLoading] = useState<boolean>(false);

  const summary = usePomodoroStore((s) => s.summary);
  const history = usePomodoroStore((s) => s.history);
  const isLoading = usePomodoroStore((s) => s.isLoading);
  const fetchSummary = usePomodoroStore((s) => s.fetchSummary);
  const fetchHistory = usePomodoroStore((s) => s.fetchHistory);

  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchTags);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const loadHeatmap = useCallback(async (days: number) => {
    try {
      setIsHeatmapLoading(true);
      const res = await analyticsService.getFocusHeatmap(days);
      if (res) {
        setHeatmapData(res);
      }
    } catch (err) {
      console.error("Failed to load heatmap", err);
    } finally {
      setIsHeatmapLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadHeatmap(heatmapRangeDays);
    }
  }, [isAuthenticated, heatmapRangeDays, loadHeatmap]);

  useEffect(() => {
    if (!isAuthenticated) {
      usePomodoroStore.getState().resetPomodoroStore();
      useTaskStore.getState().resetTaskStore();
      return;
    }

    fetchSummary();
    fetchTasks();
    fetchTags();

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

  const processedItems = useMemo(() => mapHistoryToStatisticItems(history, tasks), [history, tasks]);

  const filteredData = useMemo(() => {
    if (sourceFilter === "all") return processedItems;
    return processedItems.filter((i) => i.sourceType === sourceFilter);
  }, [processedItems, sourceFilter]);

  const totalActualMinutes = filteredData.reduce((acc, cur) => acc + cur.actualMinutes, 0);
  const totalOvertimeMinutes = filteredData.reduce((acc, cur) => acc + cur.overtimeMinutes, 0);
  const todayPomos = summary?.totalPomosToday ?? filteredData.reduce((acc, cur) => acc + cur.pomos, 0);
  const todayFocusTimeStr = formatDurationCompact(summary?.totalFocusMinutesToday ?? totalActualMinutes);
  const totalFocusHours = (totalActualMinutes / 60).toFixed(1);

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto w-full transition-colors">
      {/* 1. Linear-style Top Tab Selector with Inline Badges */}
      <div className="inline-flex items-center p-1 bg-neutral-200/70 dark:bg-neutral-800/80 rounded-2xl border border-neutral-300 dark:border-neutral-700 shadow-2xs mb-8 gap-1">
        <button
          onClick={() => setActiveTab("focus")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "focus"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <span>Focus</span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-lg transition-colors ${
              activeTab === "focus"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                : "bg-neutral-300/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            {todayFocusTimeStr}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("task")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "task"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <span>Task</span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-lg transition-colors ${
              activeTab === "task"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                : "bg-neutral-300/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            {tasks.filter((t) => t.status === 3).length}/{tasks.length}
          </span>
        </button>
      </div>

      {/* FOCUS TAB CONTENT */}
      {activeTab === "focus" && (
        <>
          {/* Detail Donut Chart & Streaks */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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

          {/* Productivity Heatmap Matrix (7x24) */}
          <FocusHeatmapCard
            cells={heatmapData?.cells || []}
            isLoading={isHeatmapLoading}
            rangeDays={heatmapRangeDays}
            onRangeChange={setHeatmapRangeDays}
            totalFocusMinutes={heatmapData?.totalFocusMinutes || 0}
            totalCompletedSessions={heatmapData?.totalCompletedSessions || 0}
          />

          {/* AI Circadian & Golden Hour Insights */}
          <AiCircadianInsightCard
            insight={heatmapData?.insight || null}
            isLoading={isHeatmapLoading}
          />
        </>
      )}

      {/* TASK TAB CONTENT */}
      {activeTab === "task" && (
        <>
          {/* Eisenhower Matrix (col-2) & Completion Stats (col-1) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <TaskEisenhowerDistributionCard tasks={tasks} />
            <TaskCompletionStatsCard tasks={tasks} />
          </div>

          {/* Tags Distribution & Productivity */}
          <TaskTagsDistributionCard tasks={tasks} tags={tags} />

          {/* Recently Completed Tasks */}
          <RecentlyCompletedTasksCard tasks={tasks} />
        </>
      )}
    </div>
  );
}
