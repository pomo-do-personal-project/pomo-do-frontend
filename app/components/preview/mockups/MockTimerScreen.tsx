"use client";

import React from "react";
import {
  ChevronsRight,
  PanelRightClose,
  Flame,
  Coffee,
  Zap,
  PenLine,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Settings,
  ChevronDown,
} from "lucide-react";

interface MockTimerScreenProps {
  timerSeconds: number;
  isTimerRunning: boolean;
  activeTimerMode: "focus" | "break" | "stopwatch";
  isCameraAiOn: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSelectTimerMode: (mode: "focus" | "break" | "stopwatch") => void;
  onToggleCameraAi: () => void;
}

export const MockTimerScreen = React.memo(function MockTimerScreen({
  timerSeconds,
  isTimerRunning,
  activeTimerMode,
  isCameraAiOn,
  onToggleTimer,
  onResetTimer,
  onSelectTimerMode,
  onToggleCameraAi,
}: MockTimerScreenProps) {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 justify-between">
      {/* Top Bar */}
      <div className="w-full h-12 px-5 flex items-center justify-between border-b border-neutral-200/60 bg-white select-none cursor-default">
        <div
          title="Mở rộng Sidebar"
          className="p-1.5 rounded-lg text-neutral-400 cursor-default"
        >
          <ChevronsRight size={17} strokeWidth={2} />
        </div>

        <div
          title="Bảng tổng quan"
          className="p-1.5 rounded-lg text-neutral-400 cursor-default"
        >
          <PanelRightClose size={18} strokeWidth={1.75} />
        </div>
      </div>

      {/* VÙNG ĐỒNG HỒ CHÍNH GIỮA MÀN HÌNH */}
      <div className="my-auto py-10 flex flex-col items-center justify-center text-center px-4">
        {/* Mode Selector */}
        <div className="inline-flex items-center gap-2 p-1 bg-white border border-neutral-200 rounded-2xl shadow-2xs mb-6">
          <button
            type="button"
            onClick={() => onSelectTimerMode("focus")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimerMode === "focus"
                ? "bg-rose-50/60 text-neutral-900 border border-rose-300 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Flame size={14} className="text-rose-500 fill-rose-500/20" />
            <span>Focus (4m)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTimerMode("break")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimerMode === "break"
                ? "bg-emerald-50 text-neutral-900 border border-emerald-300 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Coffee size={14} className="text-emerald-500" />
            <span>Break (5m)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTimerMode("stopwatch")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimerMode === "stopwatch"
                ? "bg-blue-50 text-neutral-900 border border-blue-300 shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Zap size={14} className="text-blue-500" />
            <span>Stopwatch</span>
          </button>
        </div>

        {/* MẶT SỐ ĐỒNG HỒ CỰC LỚN */}
        <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-light tracking-tighter text-neutral-900 select-none my-2">
          {formatTime(timerSeconds)}
        </div>

        {/* Ô Ghi Chú / Tác Vụ Gạch Chân */}
        <div className="w-72 max-w-sm mt-3 mb-8 border-b border-neutral-300/80 pb-1 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <PenLine size={13} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Bạn đang làm gì thế này?"
            className="w-full bg-transparent border-none outline-none text-center font-medium text-neutral-800 placeholder:text-neutral-400 placeholder:italic text-xs"
            defaultValue="Hoàn thiện MVP Pomo-Do"
          />
        </div>

        {/* Cụm Nút Điều Khiển */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetTimer}
            title="Đặt lại phiên"
            className="w-12 h-12 rounded-2xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 flex items-center justify-center text-neutral-600 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            onClick={onToggleTimer}
            title={isTimerRunning ? "Tạm dừng" : "Bắt đầu"}
            className="w-16 h-12 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            {isTimerRunning ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
        </div>

        {/* Widget Camera AI Focus Pill Dưới Cùng */}
        <div className="mt-8 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraAiOn ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"
              }`}
            />
            <Sparkles size={13} className="text-amber-500" />
            <span className="font-semibold text-neutral-800">Camera AI Focus</span>
          </div>

          <button
            type="button"
            onClick={onToggleCameraAi}
            className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
              isCameraAiOn
                ? "bg-emerald-100 text-emerald-800"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
            }`}
          >
            {isCameraAiOn ? "Bật" : "Tắt"}
          </button>

          <button
            type="button"
            title="Cài đặt camera"
            className="text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <Settings size={13} />
          </button>

          <ChevronDown size={13} className="text-neutral-400" />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
});
