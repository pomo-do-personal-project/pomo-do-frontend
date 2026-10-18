"use client";

import React from "react";
import { CheckCircle2, CheckSquare } from "lucide-react";

export const MockTaskDonutCard = React.memo(function MockTaskDonutCard() {
  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={15} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            Tiến độ Hoàn thành
          </h3>
        </div>

        {/* Vòng tròn Donut Chart SVG */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-neutral-100"
                strokeWidth="9"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-emerald-500"
                strokeWidth="9"
                strokeDasharray="251.2"
                strokeDashoffset="0"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-neutral-900">100%</span>
              <span className="text-[10px] text-neutral-400 font-semibold">1/1 đã xong</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
            <div className="p-2 rounded-xl bg-neutral-50">
              <span className="block font-black text-neutral-900 text-sm">1</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                ĐÃ XONG
              </span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-50">
              <span className="block font-black text-neutral-900 text-sm">0</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                ĐANG LÀM
              </span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-50">
              <span className="block font-black text-neutral-900 text-sm">0</span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">
                CHƯA BẮT ĐẦU
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <CheckSquare size={13} className="text-emerald-500" />
          <span>Tiến trình nhiệm vụ con:</span>
        </span>
        <span className="font-mono font-bold text-neutral-700">0/0 (0%)</span>
      </div>
    </div>
  );
});
