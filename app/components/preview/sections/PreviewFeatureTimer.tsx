"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronsRight,
  PanelRightClose,
  Timer,
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

export const PreviewFeatureTimer = React.memo(function PreviewFeatureTimer() {
  const [sec3TimerMode, setSec3TimerMode] = useState<"focus" | "break" | "stopwatch">("focus");
  const [sec3TimerSec, setSec3TimerSec] = useState<number>(4 * 60);
  const [sec3IsRunning, setSec3IsRunning] = useState<boolean>(true);
  const [sec3CameraAiActive, setSec3CameraAiActive] = useState<boolean>(true);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (sec3IsRunning) {
      timer = setInterval(() => {
        setSec3TimerSec((prev) => (prev <= 1 ? 4 * 60 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sec3IsRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">
          ĐỒNG HỒ TẬP TRUNG POMODORO
        </span>
        <h2 className="mt-2 text-3xl font-black text-neutral-900 leading-tight">
          Kiểm soát từng phút giây với chu kỳ Focus 4m - 25m & Stopwatch
        </h2>
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          Chia nhỏ công việc thành các khoảng thời gian tập trung sâu. Kết thúc phiên có chuông xoay
          Zen thư giãn, giúp tái tạo năng lượng cho các chu kỳ kế tiếp.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-neutral-700">
          <span className="px-3 py-1.5 bg-white rounded-full border border-neutral-200 shadow-2xs">
            • Chu kỳ Focus (4m/25m) & Break (5m)
          </span>
          <span className="px-3 py-1.5 bg-white rounded-full border border-neutral-200 shadow-2xs">
            • Đếm xuôi Stopwatch
          </span>
          <span className="px-3 py-1.5 bg-white rounded-full border border-neutral-200 shadow-2xs">
            • Mini Timer Header giữ nhịp xuyên suốt ứng dụng
          </span>
        </div>
      </div>

      {/* GIAO DIỆN ĐỘNG ẢNH 3: TIMER CENTER */}
      <div className="rounded-3xl bg-white border border-neutral-200/90 shadow-xl p-6 sm:p-8 relative overflow-hidden transition-all hover:shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-neutral-400 select-none cursor-default">
          <ChevronsRight size={17} className="text-neutral-500 cursor-default" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-neutral-200 bg-white shadow-2xs text-xs font-bold text-neutral-800">
            <Timer size={13} className="text-rose-500" />
            <span>FOCUS:</span>
            <span className="font-mono">{formatTime(sec3TimerSec)}</span>
            <Play size={10} fill="currentColor" className="text-neutral-600" />
          </div>
          <div
            title="Bảng tổng quan"
            className="p-1 rounded-lg text-neutral-400 cursor-default"
          >
            <PanelRightClose size={18} strokeWidth={1.75} />
          </div>
        </div>

        <div className="py-7 flex flex-col items-center text-center">
          {/* Bộ chọn Mode */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-white border border-neutral-200 rounded-2xl shadow-2xs mb-5">
            <button
              type="button"
              onClick={() => {
                setSec3TimerMode("focus");
                setSec3TimerSec(4 * 60);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sec3TimerMode === "focus"
                  ? "bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Flame size={13} className="text-rose-500 fill-rose-500/20" />
              <span>Focus (4m)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSec3TimerMode("break");
                setSec3TimerSec(5 * 60);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sec3TimerMode === "break"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Coffee size={13} />
              <span>Break (5m)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSec3TimerMode("stopwatch");
                setSec3TimerSec(0);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sec3TimerMode === "stopwatch"
                  ? "bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Zap size={13} />
              <span>Stopwatch</span>
            </button>
          </div>

          {/* Mặt số đồng hồ đếm ngược */}
          <div className="font-mono text-7xl sm:text-8xl font-light tracking-tighter text-neutral-900 select-none my-1 relative">
            {formatTime(sec3TimerSec)}
            {sec3IsRunning && (
              <span className="absolute -top-1 -right-4 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>

          {/* Ô gạch chân ghi chú việc */}
          <div className="w-64 max-w-sm border-b border-neutral-300/80 pb-1 mt-2 mb-6 flex items-center justify-center gap-2 text-xs text-neutral-700 font-medium">
            <PenLine size={13} className="text-neutral-400 shrink-0" />
            <span>Hoàn thành MVP Pomo-Do</span>
          </div>

          {/* Nút điều khiển Reset & Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSec3IsRunning(false);
                setSec3TimerSec(sec3TimerMode === "focus" ? 4 * 60 : sec3TimerMode === "break" ? 5 * 60 : 0);
              }}
              title="Đặt lại"
              className="w-11 h-11 rounded-2xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-600 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={() => setSec3IsRunning((prev) => !prev)}
              title="Bắt đầu / Tạm dừng"
              className="w-16 h-11 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm relative group"
            >
              {sec3IsRunning && (
                <span className="absolute -inset-1 rounded-2xl bg-neutral-900/10 animate-ping pointer-events-none" />
              )}
              {sec3IsRunning ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" />
              )}
            </button>
          </div>

          {/* Widget Camera AI Focus */}
          <div className="mt-6 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center gap-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles size={13} className="text-amber-500" />
            <span className="font-bold text-neutral-800">Camera AI Focus</span>
            <button
              type="button"
              onClick={() => setSec3CameraAiActive((prev) => !prev)}
              className="px-2.5 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>⏻</span>
              <span>{sec3CameraAiActive ? "Tắt" : "Bật"}</span>
            </button>
            <Settings size={13} className="text-neutral-400" />
            <ChevronDown size={13} className="text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  );
});
