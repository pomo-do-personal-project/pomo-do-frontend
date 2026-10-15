"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { ZeroMinuteConfirmModal } from "./timer/ZeroMinuteConfirmModal";
import { useAiFocusStore } from "../stores/useAiFocusStore";

export function TimerCenter() {
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [showZeroConfirm, setShowZeroConfirm] = useState(false);

  const { settings, fetchSettings } = useSettingsStore();
  const { onTimerTick, resetSessionStats, analyzeAndFinalizeSession, isAiEnabled } = useAiFocusStore();

  const modeDurations: Record<FocusMode, ModeDurationInfo> = useMemo(
    () => ({
      W: { label: "W", fullName: "Focus", minutes: settings.focusDuration || 25 },
      SB: { label: "SB", fullName: "Break", minutes: settings.shortBreakDuration || 5 },
      LB: { label: "LB", fullName: "Break", minutes: settings.shortBreakDuration || 5 },
    }),
    [settings.focusDuration, settings.shortBreakDuration]
  );

  const {
    timerType, setTimerType, focusMode, setFocusMode, isRunning, setIsRunning,
    seconds, isOvertime, overtimeSeconds, elapsedSeconds, taskName, setTaskName,
    tickTimer, resetTimer, currentSession, startSession, completeSession, cancelSession
  } = usePomodoroStore();

  const tasks = useTaskStore((s) => s.tasks);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const matchedTask = useMemo(() => {
    if (!taskName.trim()) return null;
    return tasks.find((t) => t.title.toLowerCase() === taskName.trim().toLowerCase());
  }, [tasks, taskName]);

  useEffect(() => {
    if (isAuthenticated) fetchSettings();
  }, [fetchSettings, isAuthenticated]);

  useEffect(() => {
    if (!isRunning && elapsedSeconds === 0) {
      const targetDuration = modeDurations[focusMode].minutes * 60;
      if (seconds !== targetDuration) resetTimer(targetDuration);
    }
  }, [settings.focusDuration, settings.shortBreakDuration, focusMode, isRunning, elapsedSeconds, seconds, resetTimer, modeDurations]);

  const handleSelectTab = (tab: "focus" | "break" | "stopwatch") => {
    if (tab === "stopwatch") {
      setTimerType(timerType === "stopwatch" ? "pomo" : "stopwatch");
      resetTimer(modeDurations[focusMode].minutes * 60);
    } else {
      const mode = tab === "focus" ? "W" : "SB";
      setFocusMode(mode);
      resetTimer(modeDurations[mode].minutes * 60);
    }
  };

  const handleTogglePlay = async () => {
    if (!isRunning) {
      if (!currentSession && elapsedSeconds === 0) {
        resetSessionStats();
        await startSession({
          taskId: matchedTask?.id || null,
          mode: timerType === "pomo" ? FocusSessionMode.Pomo : FocusSessionMode.Stopwatch,
          durationMinutes: modeDurations[focusMode].minutes,
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
        onTimerTick(focusMode === "W");
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tickTimer, focusMode, modeDurations, onTimerTick]);

  const handleReset = async () => {
    setIsRunning(false);
    if (currentSession?.id) await cancelSession(currentSession.id, elapsedSeconds);
    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  const executeSaveSession = async () => {
    if (currentSession?.id) {
      const plannedSeconds = modeDurations[focusMode].minutes * 60;
      const actual = elapsedSeconds;
      const ot = overtimeSeconds > 0 ? overtimeSeconds : Math.max(0, actual - plannedSeconds);

      let aiAnalysis = null;
      let finalNote = taskName.trim() || undefined;

      if (isAiEnabled && actual > 10) {
        aiAnalysis = await analyzeAndFinalizeSession(taskName.trim() || (focusMode === "W" ? "Tự do" : "Break"));
        if (aiAnalysis) {
          if (typeof window !== "undefined") {
            localStorage.setItem(`pomo_ai_session_${currentSession.id}`, JSON.stringify(aiAnalysis));
          }
          finalNote = JSON.stringify({
            title: taskName.trim() || undefined,
            ai: { score: aiAnalysis.score, grade: aiAnalysis.grade, ph: aiAnalysis.phoneCount, sl: aiAnalysis.sleepCount, lk: aiAnalysis.lookAwayCount, fb: aiAnalysis.conclusion },
          });
        }
      }

      await completeSession(currentSession.id, { actualSeconds: actual, overtimeSeconds: ot, note: finalNote });
      const minText = `${Math.round(actual / 60)}m`;
      setNotificationMsg(`✓ Đã lưu: ${minText} ${ot > 0 ? `(+${Math.round(ot / 60)}m OT)` : ""} ${aiAnalysis ? `[AI: ${aiAnalysis.score}%]` : ""}`);
      setTimeout(() => setNotificationMsg(null), 4000);
    }

    const nextMode: FocusMode = focusMode === "W" ? "SB" : "W";
    setFocusMode(nextMode);
    resetTimer(modeDurations[nextMode].minutes * 60);

    const autoStartFocus = typeof window !== "undefined" && localStorage.getItem("pomodo_auto_start_focus") === "true";
    if (focusMode === "W" && settings.autoStartBreaks) setIsRunning(true);
    else if (focusMode !== "W" && autoStartFocus) setIsRunning(true);
  };

  const handleManualComplete = () => {
    setIsRunning(false);
    if (elapsedSeconds < 60) {
      setShowZeroConfirm(true);
      return;
    }
    executeSaveSession();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="group flex flex-col items-center justify-center w-full max-w-lg mx-auto py-4 sm:py-6 px-4">
      {notificationMsg && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200 shadow-xs">
          {notificationMsg}
        </div>
      )}

      <TimerModeSelector
        timerType={timerType}
        focusMode={focusMode}
        modeDurations={modeDurations}
        onSelectTab={handleSelectTab}
        isRunning={isRunning}
      />

      <TimerDisplay
        timerType={timerType}
        focusMode={focusMode}
        seconds={seconds}
        isOvertime={isOvertime}
        overtimeSeconds={overtimeSeconds}
        isRunning={isRunning}
        formatTime={formatTime}
      />

      <TimerTaskInput taskName={taskName} onTaskNameChange={setTaskName} isRunning={isRunning} />

      <TimerControls
        isRunning={isRunning}
        isOvertime={isOvertime}
        elapsedSeconds={elapsedSeconds}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        onManualComplete={handleManualComplete}
      />

      <div className={`w-full max-w-sm flex justify-center transition-opacity duration-300 ${isRunning ? "opacity-30 group-hover:opacity-100" : "opacity-100"}`}>
        <AiFocusWidget isTimerRunning={isRunning && focusMode === "W"} />
      </div>

      <ZeroMinuteConfirmModal
        isOpen={showZeroConfirm}
        elapsedSeconds={elapsedSeconds}
        onExit={() => {
          setShowZeroConfirm(false);
          handleReset();
        }}
        onResume={() => {
          setShowZeroConfirm(false);
          setIsRunning(true);
        }}
        onClose={() => setShowZeroConfirm(false)}
      />
    </div>
  );
}
