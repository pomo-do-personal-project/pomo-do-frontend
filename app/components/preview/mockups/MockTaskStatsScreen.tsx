"use client";

import React from "react";
import { Grid2X2, Layers } from "lucide-react";
import { MockTopBar } from "./MockTopBar";
import { MockTaskDonutCard } from "./MockTaskDonutCard";
import { ScreenId } from "../types";

interface MockTaskStatsScreenProps {
  setActiveScreen: (screen: ScreenId) => void;
  timerSeconds?: number;
  isTimerRunning?: boolean;
}

export const MockTaskStatsScreen = React.memo(function MockTaskStatsScreen({
  setActiveScreen,
  timerSeconds,
  isTimerRunning,
}: MockTaskStatsScreenProps) {
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
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Focus</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-neutral-300/60 text-neutral-600">
              0h
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen("stat-task")}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-neutral-900 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Task</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 font-bold">
              1/1
            </span>
          </button>
        </div>

        {/* 2 Khối trên: Phân bổ Ma trận + Tiến độ Hoàn thành */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
          {/* Card Trái: Phân bổ Ma trận Eisenhower */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Grid2X2 size={14} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                    Phân bổ Ma trận Eisenhower
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-semibold">
                  1 việc
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4">
                Tỷ lệ và mức độ ưu tiên theo 4 góc phần tư
              </p>

              {/* 4 Ô ma trận thu nhỏ với CSS vector dots chuẩn UI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span>Q1: Khẩn cấp & Quan trọng</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      1 (100%)
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Làm ngay (Do first)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span>Q2: Quan trọng & Không khẩn</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      0 (0%)
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Lên kế hoạch (Schedule)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Q3: Khẩn cấp & Không quan trọng</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      0 (0%)
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Ủy quyền (Delegate)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" />
                      <span>Q4: Không khẩn & Không quan trọng</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-900 font-mono">
                      0 (0%)
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Loại bỏ (Don&apos;t do)
                  </span>
                </div>
              </div>
            </div>

            {/* Alert banner chân card */}
            <div className="mt-4 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <span>
                <strong>Đánh giá ma trận:</strong> Cảnh báo: Đang bị quá tải chữa cháy ở Q1. Hãy
                chủ động chuyển việc sang Q2.
              </span>
            </div>
          </div>

          {/* Card Phải: Tiến độ Hoàn thành */}
          <MockTaskDonutCard />
        </div>

        {/* Khối dưới: Phân bổ & Năng suất theo Thẻ nhãn */}
        <div className="w-full bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers size={14} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                Phân bổ & Năng suất theo Thẻ nhãn
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-semibold">
              1 danh mục
            </span>
          </div>
          <p className="text-xs text-neutral-400 mb-5">
            Tiến độ công việc theo từng danh mục phân loại
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/70">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span className="font-bold text-neutral-800">#Chưa gắn thẻ</span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-600 text-[10px] font-semibold">
                    1 việc
                  </span>
                </div>
                <span className="font-mono font-bold text-neutral-700 text-xs">
                  1/1 (100%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
