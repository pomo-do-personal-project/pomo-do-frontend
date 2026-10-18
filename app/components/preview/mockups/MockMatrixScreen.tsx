"use client";

import React from "react";
import { Plus, GripVertical, Check, X } from "lucide-react";
import { MockTopBar } from "./MockTopBar";

interface MockMatrixScreenProps {
  matrixTasksQ1: string[];
  setMatrixTasksQ1: React.Dispatch<React.SetStateAction<string[]>>;
  timerSeconds?: number;
  isTimerRunning?: boolean;
}

export const MockMatrixScreen = React.memo(function MockMatrixScreen({
  matrixTasksQ1,
  setMatrixTasksQ1,
  timerSeconds,
  isTimerRunning,
}: MockMatrixScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 overflow-y-auto">
      <MockTopBar
        showMiniTimer={true}
        timerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
      />

      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        <h2 className="text-2xl font-black text-neutral-900 mb-6">
          Eisenhower Matrix
        </h2>

        {/* Lưới 4 Ô Ma Trận 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[460px]">
          {/* Ô 1: Khẩn cấp & Quan trọng (Hồng) */}
          <div className="rounded-3xl border-2 border-rose-300 bg-rose-50/30 p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-sm text-neutral-900">
                    Khẩn cấp & Quan trọng
                  </span>
                  <span className="text-xs font-bold text-neutral-500 font-mono">
                    {matrixTasksQ1.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMatrixTasksQ1((prev) => [...prev, "Công việc mới"])}
                  className="w-6 h-6 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 text-xs shadow-2xs cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-[11px] text-neutral-400 block mb-3">Làm ngay</span>

              {/* Task Item bên trong Q1 */}
              <div className="space-y-2 mt-2">
                {matrixTasksQ1.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <GripVertical size={14} className="text-neutral-300" />
                      <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center">
                        <Check size={11} strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-neutral-800">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMatrixTasksQ1((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-neutral-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div />
          </div>

          {/* Ô 2: Không khẩn & Quan trọng (Xanh lam) */}
          <div className="rounded-3xl border-2 border-blue-300 bg-blue-50/30 p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-bold text-sm text-neutral-900">
                    Không khẩn & Quan trọng
                  </span>
                  <span className="text-xs font-bold text-neutral-500 font-mono">0</span>
                </div>
                <button
                  type="button"
                  className="w-6 h-6 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 text-xs shadow-2xs cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-[11px] text-neutral-400 block mb-3">Lên kế hoạch</span>
            </div>

            <div className="my-auto py-8 text-center text-xs text-neutral-400 italic">
              Không có công việc nào
            </div>
            <div />
          </div>

          {/* Ô 3: Khẩn cấp & Không quan trọng (Vàng cam) */}
          <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/30 p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-sm text-neutral-900">
                    Khẩn cấp & Không quan trọng
                  </span>
                  <span className="text-xs font-bold text-neutral-500 font-mono">0</span>
                </div>
                <button
                  type="button"
                  className="w-6 h-6 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 text-xs shadow-2xs cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-[11px] text-neutral-400 block mb-3">Ủy quyền</span>
            </div>

            <div className="my-auto py-8 text-center text-xs text-neutral-400 italic">
              Không có công việc nào
            </div>
            <div />
          </div>

          {/* Ô 4: Không khẩn & Không quan trọng (Xám) */}
          <div className="rounded-3xl border-2 border-neutral-300 bg-neutral-50/40 p-5 flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  <span className="font-bold text-sm text-neutral-900">
                    Không khẩn & Không quan trọng
                  </span>
                  <span className="text-xs font-bold text-neutral-500 font-mono">0</span>
                </div>
                <button
                  type="button"
                  className="w-6 h-6 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-neutral-900 text-xs shadow-2xs cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
              <span className="text-[11px] text-neutral-400 block mb-3">Loại bỏ</span>
            </div>

            <div className="my-auto py-8 text-center text-xs text-neutral-400 italic">
              Không có công việc nào
            </div>
            <div />
          </div>
        </div>
      </div>
    </div>
  );
});
