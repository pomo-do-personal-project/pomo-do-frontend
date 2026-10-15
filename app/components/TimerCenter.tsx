"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { FocusSessionMode } from "../types/api";
import { TimerType, FocusMode, ModeDurationInfo } from "./timer/types";
import { TimerModeSelector } from "./timer/TimerModeSelector";
import { TimerDisplay } from "./timer/TimerDisplay";
import { TimerTaskInput } from "./timer/TimerTaskInput";
import { TimerControls } from "./timer/TimerControls";
import { AiFocusWidget } from "./timer/AiFocusWidget";
import { useAiFocusStore } from "../stores/useAiFocusStore";

interface TimerCenterProps {
  onOpenAiSettings?: () => void;
}

export function TimerCenter({}: TimerCenterProps = {}) {
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Zustand Settings Store
  const settings = useSettingsStore((s) => s.settings);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  // Zustand AI Focus Store
  const onTimerTick = useAiFocusStore((s) => s.onTimerTick);
  const resetSessionStats = useAiFocusStore((s) => s.resetSessionStats);
  const generateSessionSummary = useAiFocusStore((s) => s.generateSessionSummary);

  const modeDurations: Record<FocusMode, ModeDurationInfo> = useMemo(
    () => ({
      W: { label: "W", fullName: "Focus", minutes: settings.focusDuration || 25 },
      SB: { label: "SB", fullName: "Break", minutes: settings.shortBreakDuration || 5 },
      LB: { label: "LB", fullName: "Break", minutes: settings.shortBreakDuration || 5 },
    }),
    [settings.focusDuration, settings.shortBreakDuration]
  );

  // Zustand Pomodoro Global Store
  const timerType = usePomodoroStore((s) => s.timerType);
  const setTimerType = usePomodoroStore((s) => s.setTimerType);
  const focusMode = usePomodoroStore((s) => s.focusMode);
  const setFocusMode = usePomodoroStore((s) => s.setFocusMode);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const setIsRunning = usePomodoroStore((s) => s.setIsRunning);
  const seconds = usePomodoroStore((s) => s.seconds);
  const isOvertime = usePomodoroStore((s) => s.isOvertime);
  const overtimeSeconds = usePomodoroStore((s) => s.overtimeSeconds);
  const elapsedSeconds = usePomodoroStore((s) => s.elapsedSeconds);
  const taskName = usePomodoroStore((s) => s.taskName);
  const setTaskName = usePomodoroStore((s) => s.setTaskName);
  const tickTimer = usePomodoroStore((s) => s.tickTimer);
  const resetTimer = usePomodoroStore((s) => s.resetTimer);

  const currentSession = usePomodoroStore((s) => s.currentSession);
  const startSession = usePomodoroStore((s) => s.startSession);
  const completeSession = usePomodoroStore((s) => s.completeSession);
  const cancelSession = usePomodoroStore((s) => s.cancelSession);

  const tasks = useTaskStore((s) => s.tasks);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Khớp task hiện tại nếu có
  const matchedTask = useMemo(() => {
    if (!taskName.trim()) return null;
    return tasks.find(
      (t) => t.title.toLowerCase() === taskName.trim().toLowerCase()
    );
  }, [tasks, taskName]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [fetchSettings, isAuthenticated]);

  // Tự động đồng bộ số giây countdown khi user chỉnh sửa settings lúc timer chưa chạy
  useEffect(() => {
    if (!isRunning && elapsedSeconds === 0) {
      const targetDuration = modeDurations[focusMode].minutes * 60;
      if (seconds !== targetDuration) {
        resetTimer(targetDuration);
      }
    }
  }, [
    settings.focusDuration,
    settings.shortBreakDuration,
    focusMode,
    isRunning,
    elapsedSeconds,
    seconds,
    resetTimer,
    modeDurations,
  ]);

  const handleSelectMode = (mode: FocusMode) => {
    setFocusMode(mode);
    resetTimer(modeDurations[mode].minutes * 60);
  };

  const handleSelectTimerType = (type: TimerType) => {
    setTimerType(type);
    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  const handleTogglePlay = async () => {
    if (!isRunning) {
      if (!currentSession && elapsedSeconds === 0) {
        resetSessionStats();
        const plannedMinutes = modeDurations[focusMode].minutes;
        await startSession({
          taskId: matchedTask?.id || null,
          mode: timerType === "pomo" ? FocusSessionMode.Pomo : FocusSessionMode.Stopwatch,
          durationMinutes: plannedMinutes,
        });
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tickTimer(modeDurations[focusMode].minutes);
        // Chỉ đếm giây và xao nhãng khi đang làm việc (W), không tính khi nghỉ (SB / LB)
        onTimerTick(focusMode === "W");
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tickTimer, focusMode, modeDurations, onTimerTick]);

  const handleReset = async () => {
    setIsRunning(false);
    if (currentSession?.id) {
      await cancelSession(currentSession.id, elapsedSeconds);
    }
    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  const handleManualComplete = async () => {
    setIsRunning(false);
    if (currentSession?.id) {
      const plannedSeconds = modeDurations[focusMode].minutes * 60;
      const actual = elapsedSeconds;
      const ot =
        overtimeSeconds > 0 ? overtimeSeconds : Math.max(0, actual - plannedSeconds);

      // Đính kèm điểm AI Focus vào Note của phiên
      const aiSummary = generateSessionSummary();
      const finalNote = [taskName.trim(), aiSummary].filter(Boolean).join(" | ");

      await completeSession(currentSession.id, {
        actualSeconds: actual,
        overtimeSeconds: ot,
        note: finalNote || undefined,
      });

      setNotificationMsg(
        `✓ Đã hoàn tất & lưu: ${Math.round(actual / 60)}m ${
          ot > 0 ? `(+${Math.round(ot / 60)}m Overtime)` : ""
        } ${aiSummary ? `[${aiSummary}]` : ""}`
      );
      setTimeout(() => setNotificationMsg(null), 4000);
    }

    // Luân phiên tối giản 2 trạng thái: Focus (W) <-> Break (SB)
    const nextMode: FocusMode = focusMode === "W" ? "SB" : "W";
    setFocusMode(nextMode);
    resetTimer(modeDurations[nextMode].minutes * 60);

    const autoStartFocus = typeof window !== "undefined" && localStorage.getItem("pomodo_auto_start_focus") === "true";
    if (focusMode === "W" && settings.autoStartBreaks) {
      setIsRunning(true);
    } else if (focusMode !== "W" && autoStartFocus) {
      setIsRunning(true);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-6 px-4">
      {/* Session notification banner */}
      {notificationMsg && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200 shadow-xs">
          {notificationMsg}
        </div>
      )}

      {/* Mode & Type Selectors */}
      <TimerModeSelector
        timerType={timerType}
        focusMode={focusMode}
        modeDurations={modeDurations}
        onSelectTimerType={handleSelectTimerType}
        onSelectFocusMode={handleSelectMode}
      />

      {/* Center Clock / Dial */}
      <TimerDisplay
        timerType={timerType}
        seconds={seconds}
        isOvertime={isOvertime}
        overtimeSeconds={overtimeSeconds}
        isRunning={isRunning}
        formatTime={formatTime}
      />

      {/* Task input */}
      <TimerTaskInput taskName={taskName} onTaskNameChange={setTaskName} />

      {/* Play / Reset / Complete buttons */}
      <TimerControls
        isRunning={isRunning}
        isOvertime={isOvertime}
        elapsedSeconds={elapsedSeconds}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onManualComplete={handleManualComplete}
      />

      {/* AI Focus Assistant Widget */}
      <AiFocusWidget isTimerRunning={isRunning && focusMode === "W"} />
    </div>
  );
}

