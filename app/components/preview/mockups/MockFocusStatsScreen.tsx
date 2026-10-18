"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { MockTopBar } from "./MockTopBar";
import { ScreenId } from "../types";

interface MockFocusStatsScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
  demoHeatmapTooltip: boolean;
  timerSeconds?: number;
  isTimerRunning?: boolean;
}

export const MockFocusStatsScreen = React.memo(function MockFocusStatsScreen({
  setActiveScreen,
  demoHeatmapTooltip,
  timerSeconds,
  isTimerRunning,
}: MockFocusStatsScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-neutral-50/50 min-h-0 overflow-y-auto">
      <MockTopBar
        showMiniTimer={true}
        timerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
      />

      <div className="p-5 sm:p-8 max-w-5xl mx-auto w-full flex flex-col items-center">
        {/* Tab Selector Focus vs Task */}
        <div className="inline-flex items-center p-1 bg-neutral-200/70 rounded-2xl border border-neutral-300/80 shadow-2xs mb-7 gap-1">
          <button
            type="button"
            onClick={() => setActiveScreen("stat-focus")}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-neutral-900 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Focus</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
              0h
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen("stat-task")}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Task</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-neutral-300/60 text-neutral-600">
              1/1
            </span>
          </button>
        </div>

        {/* 2 Khối bên trên: Chi tiết phân bổ + Chuỗi ngày liên tục */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
          {/* Card Trái: Chi tiết phân bổ */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between min-h-[220px]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Chi tiết phân bổ
              </h3>

              <div className="flex items-center gap-2">
                <div className="inline-flex p-0.5 bg-neutral-100 rounded-lg text-xs font-semibold">
                  <span className="px-2.5 py-1 bg-white text-neutral-900 rounded-md shadow-2xs font-bold">
                    Tất cả
                  </span>
                  <span className="px-2.5 py-1 text-neutral-500 hover:text-neutral-900 cursor-pointer">
                    Công việc
                  </span>
                  <span className="px-2.5 py-1 text-neutral-500 hover:text-neutral-900 cursor-pointer">
                    Tự do
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-neutral-600 font-semibold bg-neutral-100 px-2.5 py-1 rounded-lg">
                  <ChevronLeft size={13} />
                  <span>Hôm nay</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </div>

            <div className="my-auto py-8 text-center text-xs text-neutral-400 italic">
              Chưa có phiên tập trung nào trong Hôm nay. Hãy bắt đầu đếm giờ ở Tổng quan!
            </div>
          </div>

          {/* Card Phải: Chuỗi ngày liên tục */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-xs flex flex-col items-center justify-center text-center min-h-[220px]">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">
              Chuỗi ngày liên tục
            </h3>

            <div className="my-auto flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-neutral-900 tracking-tighter leading-none mb-1">
                0
              </span>
              <span className="text-xs font-semibold text-neutral-600 flex items-center justify-center gap-1">
                <span>ngày liên tục</span>
                <Flame size={15} className="text-amber-500 fill-amber-500/20" />
              </span>
              <span className="text-[11px] text-neutral-400 mt-2 font-mono">
                Kỷ lục: 2 ngày liên tục
              </span>
            </div>

            <p className="text-[11px] text-neutral-400 mt-2">
              Duy trì thói quen tập trung mỗi ngày!
            </p>
          </div>
        </div>

        {/* Khối bên dưới: Bản đồ nhiệt năng suất (Focus Heatmap 7x24) */}
        <div className="w-full bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-xs relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-emerald-500 fill-emerald-500/20" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  Bản đồ nhiệt năng suất (Focus Heatmap)
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Mật độ tập trung 7 ngày x 24 giờ & Điểm AI từ camera
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-neutral-500 font-semibold">
                <strong className="text-neutral-900 font-bold">0.1h</strong> tập trung
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-500 font-semibold">
                <strong className="text-neutral-900 font-bold">4</strong> phiên
              </span>

              <div className="ml-2 inline-flex p-0.5 bg-neutral-100 rounded-lg text-xs font-semibold">
                <span className="px-2.5 py-1 text-neutral-500 cursor-pointer">7 ngày</span>
                <span className="px-2.5 py-1 bg-neutral-900 text-white rounded-md font-bold shadow-2xs">
                  30 ngày
                </span>
                <span className="px-2.5 py-1 text-neutral-500 cursor-pointer">90 ngày</span>
              </div>
            </div>
          </div>

          {/* Tooltip mô phỏng hover của chuột */}
          {demoHeatmapTooltip && (
            <div className="absolute bottom-24 right-20 bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl z-20 flex items-center gap-2 border border-neutral-700 animate-in fade-in zoom-in-95">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Thứ 5, 19:00 — 1 phiên (45m) • Hạng S (96đ)</span>
            </div>
          )}

          {/* Lưới Heatmap 7x24 */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px]">
              {/* Cột mốc giờ */}
              <div className="flex items-center text-[10px] font-mono text-neutral-400 mb-1.5 pl-7">
                {[
                  "00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h",
                ].map((hr, idx) => (
                  <span key={idx} className="flex-1 text-center">
                    {hr}
                  </span>
                ))}
              </div>

              {/* 7 hàng ngày */}
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, rIdx) => (
                <div key={day} className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-5 text-[10px] font-bold text-neutral-400 select-none">
                    {day}
                  </span>
                  <div className="flex-1 grid grid-cols-24 gap-1">
                    {Array.from({ length: 24 }).map((_, cIdx) => {
                      const isFilledMint =
                        (rIdx === 2 && cIdx === 20) || (rIdx === 3 && cIdx === 19);
                      return (
                        <div
                          key={cIdx}
                          className={`h-4 sm:h-5 rounded-md border transition-all ${
                            isFilledMint
                              ? "bg-emerald-300 border-emerald-400 shadow-2xs"
                              : "bg-neutral-100/90 border-neutral-200/60 hover:border-neutral-300"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
