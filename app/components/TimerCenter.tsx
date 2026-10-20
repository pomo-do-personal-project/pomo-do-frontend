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
    LB: { label: "LB", fullName: "Break", minutes: settings.shortBreakDuration || 5 },
  }), [activeFocusMinutes, settings.shortBreakDuration]);

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
      const targetDuration = modeDurations[focusMode].minutes * 60;
      if (seconds !== targetDuration) resetTimer(targetDuration);
    }
  }, [modeDurations, focusMode, isRunning, elapsedSeconds, seconds, resetTimer]);

  const handleSelectTab = (tab: "focus" | "break" | "stopwatch") => {
    const isSw = tab === "stopwatch";
    const nextMode = tab === "focus" ? "W" : "SB";
    if (isSw) setTimerType(timerType === "stopwatch" ? "pomo" : "stopwatch");
    else setFocusMode(nextMode);
    resetTimer(modeDurations[isSw ? focusMode : nextMode].minutes * 60);
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

        if (matchedTask && (matchedTask.status === TaskStatus.Todo || matchedTask.status === TaskStatus.Completed)) {
          updateTask(matchedTask.id, {
            ...matchedTask,
            status: TaskStatus.InProgress,
            tagIds: matchedTask.tags?.map((t) => t.id),
          });
        }
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

        // Phát tiếng tích tắc đồng hồ nếu người dùng bật trong Cài đặt
        if (typeof window !== "undefined") {
          const isTicking = localStorage.getItem("pomodo_ticking_enabled") === "true";
          if (isTicking) {
            const vol = Number(localStorage.getItem("pomodo_ticking_volume") || "60");
            playTickSound(vol);
          }
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, tickTimer, focusMode, modeDurations, onTimerTick, playTickSound]);

  const [localSettingsVersion, setLocalSettingsVersion] = useState(0);

  useEffect(() => {
    const handleSettingsChange = () => {
      setLocalSettingsVersion((v) => v + 1);
    };
    window.addEventListener("storage", handleSettingsChange);
    window.addEventListener("pomodo_settings_changed", handleSettingsChange);
    return () => {
      window.removeEventListener("storage", handleSettingsChange);
      window.removeEventListener("pomodo_settings_changed", handleSettingsChange);
    };
  }, []);

  // Đọc cài đặt tự động chuyển phiên từ Store và localStorage (ưu tiên giá trị lưu mới nhất)
  const isAutoBreak = useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodo_auto_start_breaks");
      if (saved !== null) return saved === "true";
    }
    return Boolean(settings.autoStartBreaks);
  }, [settings.autoStartBreaks, localSettingsVersion]);

  const isAutoFocus = useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodo_auto_start_focus");
      if (saved !== null) return saved === "true";
    }
    return false;
  }, [settings, localSettingsVersion]);

  const isAutoSwitchingRef = React.useRef(false);
  const prevIsOvertimeRef = React.useRef(isOvertime);

  // Theo dõi tự động chuyển phiên khi hết thời gian (vừa chạm 00:00 / bắt đầu Overtime)
  useEffect(() => {
    if (!isRunning || isAutoSwitchingRef.current) return;

    // 1. Khi đang trong phiên Tập trung (W) mà hết thời gian quy định
    if (focusMode === "W" && isOvertime) {
      isAutoSwitchingRef.current = true;
      executeSaveSession().finally(() => {
        setTimeout(() => {
          isAutoSwitchingRef.current = false;
        }, 1000);
      });
    }
    // 2. Khi đang trong phiên Nghỉ ngơi (SB/LB) mà hết giờ nghỉ
    else if (focusMode !== "W" && isOvertime) {
      isAutoSwitchingRef.current = true;
      const nextDuration = modeDurations["W"].minutes * 60;
      setFocusMode("W");
      resetTimer(nextDuration);

      // Phát chuông báo hết giờ nghỉ
      if (typeof window !== "undefined") {
        const isSoundEnabled = localStorage.getItem("pomodo_sound_enabled") !== "false";
        if (isSoundEnabled) {
          const ring = (localStorage.getItem("pomodo_break_ringtone") || "zen") as RingtoneType;
          const soundVol = Number(localStorage.getItem("pomodo_sound_volume") || "80");
          playRingtone(ring, soundVol);
        }
      }

      if (isAutoFocus) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }

      setTimeout(() => {
        isAutoSwitchingRef.current = false;
      }, 1000);
    }

    prevIsOvertimeRef.current = isOvertime;
  }, [isOvertime, isRunning, focusMode, isAutoBreak, isAutoFocus, modeDurations]);

  const handleReset = async () => {
    setIsRunning(false);
    if (currentSession?.id) await cancelSession(currentSession.id, elapsedSeconds);
    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  const executeSaveSession = async () => {
    const plannedSeconds = modeDurations[focusMode].minutes * 60;
    const actual = elapsedSeconds > 0 ? elapsedSeconds : plannedSeconds;
    const ot = overtimeSeconds > 0 ? overtimeSeconds : Math.max(0, actual - plannedSeconds);

    let aiAnalysis = null;
    let finalNote = taskName.trim() || undefined;

    if (currentSession?.id) {
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
    }

    if (focusMode === "W") {
      setCompletedSessionData({
        durationMinutes: modeDurations[focusMode].minutes,
        actualSeconds: actual,
        overtimeSeconds: ot,
        task: matchedTask,
        aiAnalysis,
      });

      // Nếu bật "Tự động chuyển giờ nghỉ" thì khỏi hiện modal thông báo hỏi có muốn chuyển không
      // Còn không bật thì mới thông báo (hiện popup hỏi người dùng)
      if (!isAutoBreak) {
        setShowCompleteModal(true);
      } else {
        setShowCompleteModal(false);
      }
    }

    // Phát chuông thông báo hoàn thành phiên
    if (typeof window !== "undefined") {
      const isSoundEnabled = localStorage.getItem("pomodo_sound_enabled") !== "false";
      if (isSoundEnabled) {
        const ring = (localStorage.getItem(focusMode === "W" ? "pomodo_focus_ringtone" : "pomodo_break_ringtone") || "bell") as RingtoneType;
        const soundVol = Number(localStorage.getItem("pomodo_sound_volume") || "80");
        playRingtone(ring, soundVol);
      }
    }

    const isW = focusMode === "W";
    const nextMode: FocusMode = isW ? "SB" : "W";
    setFocusMode(nextMode);
    resetTimer(modeDurations[nextMode].minutes * 60);

    if (isW) {
      if (isAutoBreak) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      if (isAutoFocus) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  };

  const handleConfirmTaskStatus = async (isCompleted: boolean) => {
    if (isCompleted && matchedTask) {
      await updateTask(matchedTask.id, {
        ...matchedTask,
        status: TaskStatus.Completed,
        tagIds: matchedTask.tags?.map((t) => t.id),
      });
      setTaskName("");
    }
    setShowCompleteModal(false);
  };

  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
  };

  const handleStartBreak = () => {
    setShowCompleteModal(false);
    setFocusMode("SB");
    resetTimer(modeDurations["SB"].minutes * 60);
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

      <div className={`w-full max-w-sm flex justify-center transition-opacity duration-300 ${isRunning ? "opacity-30 group-hover:opacity-100" : "opacity-100"}`}>
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
