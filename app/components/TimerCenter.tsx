"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { FocusSessionMode, TaskStatus, TaskDto } from "../types/api";
import { TimerType, FocusMode, ModeDurationInfo } from "./timer/types";
import { TimerModeSelector } from "./timer/TimerModeSelector";
import { TimerDisplay } from "./timer/TimerDisplay";
import { TimerTaskInput } from "./timer/TimerTaskInput";
import { TimerControls } from "./timer/TimerControls";
import { AiFocusWidget } from "./timer/AiFocusWidget";
import { ZeroMinuteConfirmModal } from "./timer/ZeroMinuteConfirmModal";
import { SessionCompleteModal, SessionCompleteModalProps } from "./timer/SessionCompleteModal";
import { useAiFocusStore } from "../stores/useAiFocusStore";
import { useSettingsAudio, RingtoneType } from "./settings/hooks/useSettingsAudio";
import { useTimerAutoSwitch } from "./timer/useTimerAutoSwitch";

interface CompletedSessionData {
  durationMinutes: number;
  actualSeconds: number;
  overtimeSeconds: number;
  task?: TaskDto | null;
  aiAnalysis: SessionCompleteModalProps["aiAnalysis"];
}

export function TimerCenter() {
  const [showZeroConfirm, setShowZeroConfirm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<CompletedSessionData | null>(null);
  const [completedPomoCount, setCompletedPomoCount] = useState(0);

  const { settings, fetchSettings } = useSettingsStore();
  const { onTimerTick, resetSessionStats, analyzeAndFinalizeSession, isAiEnabled } = useAiFocusStore();
  const { playRingtone, playTickSound, playOvertimeAlert } = useSettingsAudio();

  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    timerType, setTimerType, focusMode, setFocusMode, isRunning, setIsRunning,
    seconds, isOvertime, overtimeSeconds, elapsedSeconds, taskName, setTaskName,
    tickTimer, resetTimer, currentSession, startSession, completeSession, cancelSession
  } = usePomodoroStore();

  const matchedTask = useMemo(() => {
    if (!taskName.trim()) return null;
    return tasks.find((t) => t.title.toLowerCase() === taskName.trim().toLowerCase());
  }, [tasks, taskName]);

  const activeFocusMinutes = useMemo(() => (
    matchedTask?.estimatedMinutes && matchedTask.estimatedMinutes > 0
      ? matchedTask.estimatedMinutes
      : settings.focusDuration || 25
  ), [matchedTask?.estimatedMinutes, settings.focusDuration]);

  const modeDurations: Record<FocusMode, ModeDurationInfo> = useMemo(() => ({
    W: { label: "W", fullName: "Focus", minutes: activeFocusMinutes },
    SB: { label: "SB", fullName: "Break", minutes: settings.shortBreakDuration || 5 },
    LB: { label: "LB", fullName: "Long Break", minutes: settings.longBreakDuration || 15 },
  }), [activeFocusMinutes, settings.shortBreakDuration, settings.longBreakDuration]);

  useEffect(() => {
    if (isAuthenticated) fetchSettings();
  }, [fetchSettings, isAuthenticated]);

  // Cảnh báo nếu người dùng lỡ tay bấm F5 / tải lại trang khi phiên đang chạy
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning || (currentSession && elapsedSeconds > 0)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning, currentSession, elapsedSeconds]);

  useEffect(() => {
    if (!isRunning && elapsedSeconds === 0) {
      const targetDuration = timerType === "stopwatch" ? 0 : modeDurations[focusMode].minutes * 60;
      if (seconds !== targetDuration) resetTimer(targetDuration);
    }
  }, [modeDurations, focusMode, timerType, isRunning, elapsedSeconds, seconds, resetTimer]);

  const handleSelectTab = (tab: "focus" | "break" | "stopwatch") => {
    if (isRunning) return;
    if (tab === "stopwatch") {
      const nextType = timerType === "stopwatch" ? "pomo" : "stopwatch";
      setTimerType(nextType);
      setFocusMode("W");
      resetTimer(nextType === "stopwatch" ? 0 : modeDurations.W.minutes * 60);
    } else {
      const nextMode: FocusMode = tab === "focus" ? "W" : "SB";
      setTimerType("pomo");
      setFocusMode(nextMode);
      resetTimer(modeDurations[nextMode].minutes * 60);
    }
  };

  const initWorkSession = async (targetMode: FocusMode = focusMode) => {
    resetSessionStats();
    await startSession({
      taskId: matchedTask?.id || null,
      mode: timerType === "pomo" ? FocusSessionMode.Pomo : FocusSessionMode.Stopwatch,
      durationMinutes: modeDurations[targetMode].minutes,
    });
    if (matchedTask && matchedTask.status === TaskStatus.Todo) {
      updateTask(matchedTask.id, { ...matchedTask, status: TaskStatus.InProgress, tagIds: matchedTask.tags?.map((t) => t.id) });
    }
  };

  const handleTogglePlay = async () => {
    if (!isRunning) {
      if (!currentSession && elapsedSeconds === 0) await initWorkSession(focusMode);
      setIsRunning(true);
    } else setIsRunning(false);
  };

  const handleReset = async () => {
    setIsRunning(false);
    if (currentSession?.id) await cancelSession(currentSession.id, elapsedSeconds);
    resetTimer(timerType === "stopwatch" ? 0 : modeDurations[focusMode].minutes * 60);
  };

  const executeSaveSession = async () => {
    const plannedSeconds = modeDurations[focusMode].minutes * 60;
    const actual = elapsedSeconds > 0 ? elapsedSeconds : plannedSeconds;
    const ot = overtimeSeconds > 0 ? overtimeSeconds : Math.max(0, actual - plannedSeconds);
    let aiAnalysis = null, finalNote = taskName.trim() || undefined;

    if (currentSession?.id) {
      if (isAiEnabled && actual > 10) {
        aiAnalysis = await analyzeAndFinalizeSession(taskName.trim() || (focusMode === "W" ? "Tự do" : "Break"));
        if (aiAnalysis && typeof window !== "undefined") {
          localStorage.setItem(`pomo_ai_session_${currentSession.id}`, JSON.stringify(aiAnalysis));
          finalNote = JSON.stringify({
            title: taskName.trim() || undefined,
            ai: { score: aiAnalysis.score, grade: aiAnalysis.grade, ph: aiAnalysis.phoneCount, sl: aiAnalysis.sleepCount, lk: aiAnalysis.lookAwayCount, fb: aiAnalysis.conclusion },
          });
        }
      }
      await completeSession(currentSession.id, { actualSeconds: actual, overtimeSeconds: ot, note: finalNote });
    }

    if (focusMode === "W") {
      setCompletedSessionData({ durationMinutes: modeDurations[focusMode].minutes, actualSeconds: actual, overtimeSeconds: ot, task: matchedTask, aiAnalysis });
      setShowCompleteModal(!isAutoBreak);
    }

    if (typeof window !== "undefined" && localStorage.getItem("pomodo_sound_enabled") !== "false") {
      const ring = (localStorage.getItem(focusMode === "W" ? "pomodo_focus_ringtone" : "pomodo_break_ringtone") || "bell") as RingtoneType;
      playRingtone(ring, Number(localStorage.getItem("pomodo_sound_volume") || "80"));
    }

    const isW = focusMode === "W";
    let nextCount = completedPomoCount;
    if (isW) {
      nextCount = completedPomoCount + 1;
      setCompletedPomoCount(nextCount);
    }
    const nextMode: FocusMode = isW ? (nextCount % 4 === 0 ? "LB" : "SB") : "W";
    setFocusMode(nextMode);
    resetTimer(timerType === "stopwatch" && nextMode === "W" ? 0 : modeDurations[nextMode].minutes * 60);
    if (!isW && isAutoFocus) {
      await initWorkSession("W");
    }
    setIsRunning(isW ? isAutoBreak : isAutoFocus);
  };

  const { isAutoBreak, isAutoFocus } = useTimerAutoSwitch({
    isRunning, setIsRunning, focusMode, setFocusMode, isOvertime,
    modeDurations, resetTimer, playRingtone, playTickSound, playOvertimeAlert, onTimerTick,
    tickTimer, executeSaveSession,
    startAutoFocusSession: () => initWorkSession("W"),
    autoStartBreaksSetting: settings.autoStartBreaks,
  });

  const handleConfirmTaskStatus = async (isCompleted: boolean) => {
    if (isCompleted && matchedTask) {
      await updateTask(matchedTask.id, { ...matchedTask, status: TaskStatus.Completed, tagIds: matchedTask.tags?.map((t) => t.id) });
      setTaskName("");
    }
    setShowCompleteModal(false);
  };
  const handleCloseCompleteModal = () => setShowCompleteModal(false);

  const handleStartBreak = () => {
    setShowCompleteModal(false);
    const breakMode: FocusMode = completedPomoCount > 0 && completedPomoCount % 4 === 0 ? "LB" : "SB";
    setFocusMode(breakMode); resetTimer(modeDurations[breakMode].minutes * 60);
    setIsRunning(true);
  };

  const handleManualComplete = () => {
    setIsRunning(false);
    if (elapsedSeconds < 60) setShowZeroConfirm(true);
    else executeSaveSession();
  };

  const formatTime = (totalSecs: number) =>
    `${Math.floor(totalSecs / 60).toString().padStart(2, "0")}:${(totalSecs % 60).toString().padStart(2, "0")}`;

  return (
    <div className="group flex flex-col items-center justify-center w-full max-w-lg mx-auto py-4 sm:py-6 px-4">
      <TimerModeSelector
        timerType={timerType} focusMode={focusMode} modeDurations={modeDurations}
        onSelectTab={handleSelectTab} isRunning={isRunning}
      />

      <TimerDisplay
        timerType={timerType} focusMode={focusMode} seconds={seconds}
        isOvertime={isOvertime} overtimeSeconds={overtimeSeconds}
        isRunning={isRunning} formatTime={formatTime}
      />

      <TimerTaskInput taskName={taskName} onTaskNameChange={setTaskName} isRunning={isRunning} />

      <TimerControls
        isRunning={isRunning} isOvertime={isOvertime} elapsedSeconds={elapsedSeconds}
        onTogglePlay={handleTogglePlay} onReset={handleReset} onManualComplete={handleManualComplete}
      />

      <div className={`w-full max-w-sm flex justify-center transition-opacity duration-300 ${isRunning ? "opacity-40 hover:opacity-100 focus-within:opacity-100 active:opacity-100" : "opacity-100"}`}>
        <AiFocusWidget isTimerRunning={isRunning && focusMode === "W"} />
      </div>

      <ZeroMinuteConfirmModal
        isOpen={showZeroConfirm} elapsedSeconds={elapsedSeconds}
        isBreak={focusMode !== "W"}
        onExit={() => { setShowZeroConfirm(false); handleReset(); }}
        onResume={() => { setShowZeroConfirm(false); setIsRunning(true); }}
        onClose={() => setShowZeroConfirm(false)}
      />

      <SessionCompleteModal
        isOpen={showCompleteModal} onClose={handleCloseCompleteModal}
        durationMinutes={completedSessionData?.durationMinutes || 25}
        actualSeconds={completedSessionData?.actualSeconds || 0}
        overtimeSeconds={completedSessionData?.overtimeSeconds || 0}
        task={completedSessionData?.task} aiAnalysis={completedSessionData?.aiAnalysis}
        onConfirmTaskStatus={handleConfirmTaskStatus} onStartBreak={handleStartBreak}
      />
    </div>
  );
}
