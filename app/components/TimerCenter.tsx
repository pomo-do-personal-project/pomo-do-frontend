"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/Button";
import { StopwatchDial } from "./StopwatchDial";
import { Play, Pause, RotateCcw, Check, ChevronDown, X, PenLine } from "lucide-react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { FocusSessionMode, TaskStatus } from "../types/api";

type TimerType = "pomo" | "stopwatch";
type FocusMode = "W" | "SB" | "LB";

export function TimerCenter() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Zustand Settings Store (đồng bộ từ Backend hoặc cache)
  const settings = useSettingsStore((s) => s.settings);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  // Dynamic mode durations derived from user settings
  const modeDurations: Record<FocusMode, { label: string; fullName: string; minutes: number }> = {
    W: { label: "W", fullName: "Work / Focus", minutes: settings.focusDuration || 25 },
    SB: { label: "SB", fullName: "Short Break", minutes: settings.shortBreakDuration || 5 },
    LB: { label: "LB", fullName: "Long Break", minutes: settings.longBreakDuration || 15 },
  };

  // Zustand Pomodoro Global Store (duy trì trạng thái xuyên suốt mọi màn hình)
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

  // Zustand Task store
  const tasks = useTaskStore((s) => s.tasks);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zustand Auth Store
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fetch settings when component mounts (chỉ gọi khi đã đăng nhập)
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [fetchSettings, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update timer duration when user explicitly changes mode or timer type
  const handleSelectMode = (mode: FocusMode) => {
    setFocusMode(mode);
    setIsDropdownOpen(false);
    resetTimer(modeDurations[mode].minutes * 60);
  };

  const handleSelectTimerType = (type: TimerType) => {
    setTimerType(type);
    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  // Handle Play / Pause logic with Backend Pomodoro API
  const handleTogglePlay = async () => {
    if (!isRunning) {
      // Nếu chưa có session (bắt đầu mới)
      if (!currentSession && elapsedSeconds === 0) {
        const plannedMinutes = modeDurations[focusMode].minutes;
        const matchedTask = tasks.find((t) => t.title.toLowerCase() === taskName.trim().toLowerCase());

        await startSession({
          taskId: matchedTask?.id || null,
          mode: timerType === "pomo" ? FocusSessionMode.Pomo : FocusSessionMode.Stopwatch,
          durationMinutes: plannedMinutes,
        });
      }

      setIsRunning(true);
    } else {
      // Tạm dừng
      setIsRunning(false);
    }
  };

  // Timer Tick chuẩn 1 giây được điều phối bởi Global Zustand Store
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tickTimer(modeDurations[focusMode].minutes);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, focusMode, tickTimer, modeDurations]);

  // Hủy phiên hoặc Reset
  const handleReset = async () => {
    setIsRunning(false);

    // Nếu đang có session dở dang, gọi cancel lên backend
    if (currentSession?.id) {
      await cancelSession(currentSession.id, elapsedSeconds);
    }

    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  // Người dùng ấn DỪNG / HOÀN THÀNH: Lưu actualSeconds và overtimeSeconds chính xác về Backend
  const handleManualComplete = async () => {
    setIsRunning(false);

    if (currentSession?.id) {
      const plannedSeconds = modeDurations[focusMode].minutes * 60;
      const actual = elapsedSeconds;
      const ot = overtimeSeconds > 0
        ? overtimeSeconds
        : Math.max(0, actual - plannedSeconds);

      await completeSession(currentSession.id, {
        actualSeconds: actual,
        overtimeSeconds: ot,
        note: taskName.trim() || undefined,
      });

      setNotificationMsg(
        `✓ Đã hoàn tất & lưu: ${Math.round(actual / 60)}m ${ot > 0 ? `(+${Math.round(ot / 60)}m Overtime)` : ""}`
      );
      setTimeout(() => setNotificationMsg(null), 3500);
    }

    resetTimer(modeDurations[focusMode].minutes * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-6 px-4">
      {/* Thông báo kết quả hoàn thành phiên */}
      {notificationMsg && (
        <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-200 shadow-xs">
          {notificationMsg}
        </div>
      )}

      {/* 1. Timer Type Selector (Pomo vs Stopwatch) */}
      <div className="flex items-center justify-center w-full max-w-sm mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs">
          <button
            onClick={() => handleSelectTimerType("pomo")}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              timerType === "pomo"
                ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Pomo
          </button>
          <button
            onClick={() => handleSelectTimerType("stopwatch")}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              timerType === "stopwatch"
                ? "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* 2. Focus Mode Selection Frame (Áp dụng cho cả Pomo và Stopwatch) */}
      <div className="relative mb-6" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center justify-between gap-3 px-5 py-2 bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xs hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer min-w-[100px]"
        >
          <span className="font-bold text-neutral-900 dark:text-white tracking-wider">
            {focusMode}
          </span>
          <ChevronDown size={14} strokeWidth={2} className={`text-neutral-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Options */}
        {isDropdownOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {(["W", "SB", "LB"] as FocusMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleSelectMode(mode)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                  focusMode === mode
                    ? "bg-neutral-100 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                }`}
              >
                <span className="font-bold">{mode}</span>
                <span className="text-neutral-400 text-[11px]">
                  {modeDurations[mode].fullName} ({modeDurations[mode].minutes}m)
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Timer In The Center: Switch between Pomo Digital Box & Stopwatch Circular Dial */}
      {timerType === "stopwatch" ? (
        <div className={`w-full py-6 px-6 bg-white/60 dark:bg-neutral-800/40 backdrop-blur-sm border rounded-3xl shadow-sm flex flex-col items-center justify-center mb-8 relative transition-colors ${
          isOvertime
            ? "border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20 shadow-rose-500/10"
            : "border-neutral-200/80 dark:border-neutral-800"
        }`}>
          {/* Overtime Pulsing Indicator */}
          {isOvertime && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Đang tính Overtime: +{formatTime(overtimeSeconds)}</span>
            </div>
          )}

          <StopwatchDial
            seconds={seconds}
            isOvertime={isOvertime}
            overtimeSeconds={overtimeSeconds}
            label={isOvertime ? "OVERTIME" : isRunning ? "FOCUSING..." : "FOCUS TIME"}
          />
        </div>
      ) : (
        <div className={`w-full py-8 px-6 bg-white/60 dark:bg-neutral-800/40 backdrop-blur-sm border rounded-3xl shadow-sm flex flex-col items-center justify-center mb-8 relative transition-colors ${
          isOvertime
            ? "border-rose-500/50 bg-rose-500/5 dark:bg-rose-950/20 shadow-rose-500/10"
            : "border-neutral-200/80 dark:border-neutral-800"
        }`}>
          {/* Overtime Pulsing Indicator */}
          {isOvertime && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Đang tính Overtime: +{formatTime(overtimeSeconds)}</span>
            </div>
          )}

          <span className={`font-mono text-7xl sm:text-8xl font-light tracking-tighter select-none ${
            isOvertime ? "text-rose-600 dark:text-rose-400 font-normal" : "text-neutral-900 dark:text-white"
          }`}>
            {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(seconds)}
          </span>
        </div>
      )}

      {/* 4. Task Name Input: Tối giản với icon PenLine, loại bỏ chữ placeholder gây xao nhãng */}
      <div className="w-full max-w-sm mb-10 flex flex-col items-center relative">
        <div className="w-full relative flex items-center justify-center group">
          {/* Icon bút tinh tế mờ bên trái, click để focus */}
          <span className="absolute left-2 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 pointer-events-none transition-colors">
            <PenLine size={15} strokeWidth={1.75} />
          </span>

          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder=""
            aria-label="Tên nhiệm vụ"
            className="w-full text-center bg-transparent border-b-2 border-neutral-300/80 dark:border-neutral-700/80 focus:border-neutral-900 dark:focus:border-white py-2 px-9 text-base font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none transition-colors"
          />

          {/* Nút xóa nhanh nội dung khi có chữ */}
          {taskName && (
            <button
              type="button"
              onClick={() => setTaskName("")}
              className="absolute right-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer transition-colors"
              title="Xóa tên task"
              aria-label="Xóa tên task"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* 5. Play / Stop (Reset) / Complete Buttons */}
      <div className="flex items-center gap-6">
        {/* Reset / Cancel Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          title="Reset Timer / Hủy phiên"
          aria-label="Đặt lại bộ đếm hoặc hủy phiên"
          className="w-12 h-12 rounded-2xl hover:rotate-[-45deg] transition-transform text-neutral-600 dark:text-neutral-300"
        >
          <RotateCcw size={20} strokeWidth={1.75} />
        </Button>

        {/* Main Play / Pause Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleTogglePlay}
          aria-label={isRunning ? "Tạm dừng" : "Bắt đầu"}
          className={`w-20 h-14 rounded-2xl shadow-md flex items-center justify-center ${
            isOvertime ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
          }`}
        >
          {isRunning ? (
            <Pause size={22} strokeWidth={2} />
          ) : (
            <Play size={22} strokeWidth={2} className="translate-x-0.5 fill-current" />
          )}
        </Button>

        {/* Checkmark Complete Session Button: Khi đang chạy hoặc đang trong chế độ Overtime thì hiển thị nút Lưu & Kết thúc phiên */}
        {(isRunning || isOvertime || elapsedSeconds > 0) && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handleManualComplete}
            title={isOvertime ? "Dừng & Lưu thời gian Overtime vào Backend" : "Hoàn thành & Lưu phiên vào Backend"}
            aria-label="Hoàn thành và lưu phiên làm việc"
            className={`w-12 h-12 rounded-2xl transition-all ${
              isOvertime
                ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-md scale-105 animate-bounce"
                : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border-emerald-500/30"
            }`}
          >
            <Check size={22} strokeWidth={2.2} />
          </Button>
        )}
      </div>
    </div>
  );
}
