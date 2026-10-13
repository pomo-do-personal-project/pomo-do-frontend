"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  isOvertime: boolean;
  elapsedSeconds: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onManualComplete: () => void;
}

export function TimerControls({
  isRunning,
  isOvertime,
  elapsedSeconds,
  onTogglePlay,
  onReset,
  onManualComplete,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Reset / Cancel Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
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
        onClick={onTogglePlay}
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

      {/* Checkmark Complete Session Button */}
      {(isRunning || isOvertime || elapsedSeconds > 0) && (
        <Button
          variant="secondary"
          size="icon"
          onClick={onManualComplete}
          title={
            isOvertime
              ? "Dừng & Lưu thời gian Overtime vào Backend"
              : "Hoàn thành & Lưu phiên vào Backend"
          }
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
  );
}
