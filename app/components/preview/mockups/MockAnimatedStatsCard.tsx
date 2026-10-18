"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronsRight,
  Timer,
  Play,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface MockAnimatedStatsCardProps {
  timerSec?: number;
}

export const MockAnimatedStatsCard = React.memo(function MockAnimatedStatsCard({
  timerSec = 4 * 60,
}: MockAnimatedStatsCardProps) {
  const [section3StatTab, setSection3StatTab] = useState<"focus" | "task">("focus");

  useEffect(() => {
    const tabInterval = setInterval(() => {
      setSection3StatTab((prev) => (prev === "focus" ? "task" : "focus"));
    }, 5500);

    return () => clearInterval(tabInterval);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-3xl bg-white border border-neutral-200/90 shadow-xl p-6 sm:p-7 relative overflow-hidden transition-all hover:shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
        <ChevronsRight size={17} className="text-neutral-500" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-neutral-200 bg-white shadow-2xs text-xs font-bold text-neutral-800">
          <Timer size={13} className="text-rose-500" />
          <span>FOCUS:</span>
          <span className="font-mono">{formatTime(timerSec)}</span>
          <Play size={10} fill="currentColor" className="text-neutral-600" />
        </div>
        <div className="w-6" />
      </div>

      {/* Nút Tab chuyển đổi Focus vs Task */}
      <div className="flex items-center justify-center mb-5">
        <div className="inline-flex p-1 bg-neutral-100 rounded-2xl border border-neutral-200/90 text-xs gap-1">
          <button
            type="button"
            onClick={() => setSection3StatTab("focus")}
            className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              section3StatTab === "focus"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Focus</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
              0h
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSection3StatTab("task")}
            className={`px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              section3StatTab === "task"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Task</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
              1/1
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TAB FOCUS */}
      {section3StatTab === "focus" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">Chi tiết phân bổ</span>
                <div className="flex items-center gap-1 text-[10px]">
                  <div className="flex bg-neutral-200/60 p-0.5 rounded-md">
                    <span className="px-1.5 py-0.5 bg-white rounded shadow-2xs font-bold text-neutral-900">
                      Tất cả
                    </span>
                    <span className="px-1.5 py-0.5 text-neutral-500">Công việc</span>
                    <span className="px-1.5 py-0.5 text-neutral-500">Tự do</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-600 font-semibold">
                    <ChevronLeft size={10} />
                    <span>Hôm nay</span>
                    <ChevronRight size={10} />
                  </div>
                </div>
              </div>
              <div className="my-auto py-3 text-center text-[10px] text-neutral-400 italic">
                Chưa có phiên tập trung nào trong Hôm nay. Hãy bắt đầu đếm giờ ở Tổng quan!
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col items-center justify-center text-center">
              <span className="font-bold text-neutral-900 text-xs">Chuỗi ngày liên tục</span>
              <span className="text-3xl font-black text-neutral-900 mt-1">0</span>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <span>ngày liên tục</span>
                <Flame size={12} className="text-amber-500 fill-amber-500/20 animate-pulse" />
              </span>
              <span className="text-[9px] text-neutral-400 mt-1 font-mono">
                kỷ lục: 2 ngày liên tục
              </span>
            </div>
          </div>

          {/* Bản đồ nhiệt Focus Heatmap 7x24 */}
          <div className="p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 relative">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Flame size={15} className="text-emerald-500 fill-emerald-500/20" />
                  <span className="font-bold text-neutral-900 text-xs">
                    Bản đồ nhiệt năng suất (Focus Heatmap)
                  </span>
                </div>
                <span className="text-[9px] text-neutral-400 block mt-0.5">
                  Mật độ tập trung 7 ngày x 24 giờ & Điểm AI từ camera
                </span>
              </div>
              <span className="text-[10px] font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                0.1h tập trung • 4 phiên
              </span>
            </div>

            {/* Ma trận 7 hàng x 24 cột giờ */}
            <div className="space-y-1">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, rIdx) => (
                <div key={day} className="flex items-center gap-1">
                  <span className="w-4 text-[9px] font-bold text-neutral-400">{day}</span>
                  <div className="flex-1 grid grid-cols-24 gap-0.5">
                    {Array.from({ length: 24 }).map((_, cIdx) => {
                      const isMint =
                        (rIdx === 3 && cIdx === 19) || (rIdx === 4 && cIdx === 18);
                      return (
                        <div
                          key={cIdx}
                          className={`h-2.5 rounded-xs transition-all ${
                            isMint
                              ? "bg-emerald-400 shadow-xs animate-pulse ring-1 ring-emerald-300"
                              : "bg-white border border-neutral-200/60"
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
      )}

      {/* VIEW 2: TAB TASK */}
      {section3StatTab === "task" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <span className="font-bold text-neutral-900 block">Phân bổ Ma trận Eisenhower</span>
                    <span className="text-[9px] text-neutral-400">Tỷ lệ và mức độ ưu tiên theo 4 góc</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                    1 việc
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]">
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <div>Q1: Khẩn cấp & Quan trọng: 1 (100%)</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <div>Q2: Quan trọng & Không khẩn: 0 (0%)</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <div>Q3: Khẩn cấp & Không quan trọng: 0 (0%)</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                    <div>Q4: Không khẩn & Không quan trọng: 0 (0%)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 font-bold text-neutral-900 text-xs">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Tiến độ Hoàn thành</span>
              </div>
              <div className="relative w-14 h-14 my-1.5 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="11" fill="transparent" className="text-neutral-200" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="11" fill="transparent" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" className="text-emerald-500 animate-pulse" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-neutral-900">100%</span>
                  <span className="text-[7px] text-neutral-400 font-semibold">1/1 đã xong</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[7px] font-bold text-neutral-500 w-full mt-1">
                <div className="p-0.5 rounded bg-emerald-50 text-emerald-700">1 XONG</div>
                <div className="p-0.5 rounded bg-neutral-100">0 LÀM</div>
                <div className="p-0.5 rounded bg-neutral-100">0 CHƯA</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
