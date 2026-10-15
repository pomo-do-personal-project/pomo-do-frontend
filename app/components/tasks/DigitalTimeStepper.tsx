"use client";

import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DigitalTimeStepperProps {
  hours: number;
  minutes: number;
  activeUnit: "hh" | "mm";
  setActiveUnit: (unit: "hh" | "mm") => void;
  onAdjustHours: (delta: number) => void;
  onAdjustMinutes: (delta: number) => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>, unit: "hh" | "mm") => void;
}

export function DigitalTimeStepper({
  hours,
  minutes,
  activeUnit,
  setActiveUnit,
  onAdjustHours,
  onAdjustMinutes,
  onWheel,
}: DigitalTimeStepperProps) {
  const format2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-3 py-2 bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl mb-3 shadow-inner">
      {/* Cột Giờ (HH) */}
      <div
        onMouseEnter={() => setActiveUnit("hh")}
        onWheel={(e) => onWheel(e, "hh")}
        className={`flex flex-col items-center p-1.5 rounded-xl transition-all cursor-ns-resize ${
          activeUnit === "hh"
            ? "bg-white dark:bg-neutral-800 shadow-sm border-b-2 border-sky-500 ring-1 ring-sky-500/20"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setActiveUnit("hh");
            onAdjustHours(1);
          }}
          title="Tăng giờ"
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronUp size={16} strokeWidth={2.5} />
        </button>

        <span className="font-mono text-2xl font-black text-neutral-900 dark:text-white px-2">
          {format2(hours)}
        </span>

        <button
          type="button"
          onClick={() => {
            setActiveUnit("hh");
            onAdjustHours(-1);
          }}
          title="Giảm giờ"
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </button>

        <span className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">Giờ</span>
      </div>

      <span className="font-mono text-2xl font-bold text-neutral-400 pb-4">:</span>

      {/* Cột Phút (MM) */}
      <div
        onMouseEnter={() => setActiveUnit("mm")}
        onWheel={(e) => onWheel(e, "mm")}
        className={`flex flex-col items-center p-1.5 rounded-xl transition-all cursor-ns-resize ${
          activeUnit === "mm"
            ? "bg-white dark:bg-neutral-800 shadow-sm border-b-2 border-sky-500 ring-1 ring-sky-500/20"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setActiveUnit("mm");
            onAdjustMinutes(5);
          }}
          title="Tăng 5 phút"
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronUp size={16} strokeWidth={2.5} />
        </button>

        <span className="font-mono text-2xl font-black text-neutral-900 dark:text-white px-2">
          {format2(minutes)}
        </span>

        <button
          type="button"
          onClick={() => {
            setActiveUnit("mm");
            onAdjustMinutes(-5);
          }}
          title="Giảm 5 phút"
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </button>

        <span className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">Phút</span>
      </div>
    </div>
  );
}
