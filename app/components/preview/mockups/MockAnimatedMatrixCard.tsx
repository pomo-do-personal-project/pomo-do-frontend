"use client";

import React, { useState, useEffect } from "react";
import { ChevronsRight, Timer, Play, GripVertical, Check, X } from "lucide-react";

interface MockAnimatedMatrixCardProps {
  timerSec?: number;
}

export const MockAnimatedMatrixCard = React.memo(function MockAnimatedMatrixCard({
  timerSec = 4 * 60,
}: MockAnimatedMatrixCardProps) {
  const [matrixAnimPhase, setMatrixAnimPhase] = useState<number>(0);

  useEffect(() => {
    const matrixInterval = setInterval(() => {
      setMatrixAnimPhase((prev) => (prev + 1) % 5);
    }, 2500);

    return () => clearInterval(matrixInterval);
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="order-2 lg:order-1 rounded-3xl bg-white border border-neutral-200/90 shadow-xl p-6 sm:p-7 relative overflow-hidden transition-all hover:shadow-2xl">
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

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-neutral-900">Eisenhower Matrix</h3>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>Kéo thả động trực quan</span>
        </span>
      </div>

      {/* Lưới 4 Ô Phần Tư 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Q1 Hồng: Khẩn cấp & Quan trọng */}
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/40 p-4 flex flex-col justify-between min-h-[145px] transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-bold text-neutral-900 text-xs">
                  Khẩn cấp & Quan trọng
                </span>
                <span className="text-xs font-bold text-neutral-500 font-mono">
                  {matrixAnimPhase <= 1 ? "1" : "0"}
                </span>
              </div>
              <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-bold">
                +
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 block mb-2.5">Làm ngay</span>

            {matrixAnimPhase <= 1 ? (
              <div
                className={`p-2.5 rounded-xl bg-white border shadow-2xs flex items-center justify-between text-xs transition-all duration-500 ${
                  matrixAnimPhase === 1
                    ? "border-rose-400 shadow-md ring-2 ring-rose-200 scale-102"
                    : "border-neutral-200/90"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical size={13} className="text-neutral-400" />
                  <div className="w-4 h-4 rounded bg-emerald-400 flex items-center justify-center text-white">
                    <Check size={10} strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold text-neutral-800">Task</span>
                </div>
                <X size={12} className="text-neutral-300" />
              </div>
            ) : (
              <div className="my-auto py-3 text-center text-xs text-neutral-400 italic">
                Không có công việc nào
              </div>
            )}
          </div>
        </div>

        {/* Q2 Xanh lam: Không khẩn & Quan trọng */}
        <div className="rounded-2xl border-2 border-blue-300 bg-blue-50/40 p-4 flex flex-col justify-between min-h-[145px] transition-all">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-neutral-900 text-xs">
                  Không khẩn & Quan trọng
                </span>
                <span className="text-xs font-bold text-neutral-500 font-mono">
                  {matrixAnimPhase >= 2 ? "1" : "0"}
                </span>
              </div>
              <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-bold">
                +
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 block mb-2">Lên kế hoạch</span>

            {matrixAnimPhase >= 2 ? (
              <div
                className={`p-2.5 rounded-xl bg-white border shadow-2xs flex items-center justify-between text-xs transition-all duration-500 animate-in fade-in zoom-in-95 ${
                  matrixAnimPhase === 4
                    ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                    : "border-blue-300 ring-2 ring-blue-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical size={13} className="text-blue-400" />
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-white transition-all ${
                      matrixAnimPhase === 4
                        ? "bg-emerald-500 scale-110 shadow-2xs"
                        : "bg-emerald-400"
                    }`}
                  >
                    <Check size={10} strokeWidth={2.5} />
                  </div>
                  <span
                    className={`font-semibold transition-all ${
                      matrixAnimPhase === 4
                        ? "text-emerald-700 line-through"
                        : "text-neutral-800"
                    }`}
                  >
                    Task (Kế hoạch Q2)
                  </span>
                </div>
                <X size={12} className="text-neutral-300" />
              </div>
            ) : (
              <div className="my-auto py-3 text-center text-xs text-neutral-400 italic">
                Không có công việc nào
              </div>
            )}
          </div>
          <div />
        </div>

        {/* Q3 Vàng cam: Khẩn cấp & Không quan trọng */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-4 flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-neutral-900 text-xs">
                  Khẩn cấp & Không quan trọng
                </span>
                <span className="text-xs font-bold text-neutral-500 font-mono">0</span>
              </div>
              <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-bold">
                +
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 block mb-2">Ủy quyền</span>
          </div>
          <div className="my-auto py-3 text-center text-xs text-neutral-400 italic">
            Không có công việc nào
          </div>
          <div />
        </div>

        {/* Q4 Xám: Không khẩn & Không quan trọng */}
        <div className="rounded-2xl border-2 border-neutral-300 bg-neutral-50/60 p-4 flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                <span className="font-bold text-neutral-900 text-xs">
                  Không khẩn & Không quan trọng
                </span>
                <span className="text-xs font-bold text-neutral-500 font-mono">0</span>
              </div>
              <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-600 font-bold">
                +
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 block mb-2">Loại bỏ</span>
          </div>
          <div className="my-auto py-3 text-center text-xs text-neutral-400 italic">
            Không có công việc nào
          </div>
          <div />
        </div>
      </div>
    </div>
  );
});
