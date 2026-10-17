"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Clock, X, ArrowRight, Award, ShieldCheck } from "lucide-react";
import { TaskDto } from "../../types/api";

export interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  durationMinutes: number;
  actualSeconds: number;
  overtimeSeconds: number;
  task?: TaskDto | null;
  aiAnalysis?: {
    score: number;
    grade: string;
    phoneCount: number;
    sleepCount: number;
    lookAwayCount: number;
    conclusion?: string;
  } | null;
  onConfirmTaskStatus: (isCompleted: boolean) => void;
  onStartBreak: () => void;
}

export function SessionCompleteModal({
  isOpen,
  onClose,
  durationMinutes,
  actualSeconds,
  overtimeSeconds,
  task,
  aiAnalysis,
  onConfirmTaskStatus,
  onStartBreak,
}: SessionCompleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actualMinutes = Math.max(1, Math.round(actualSeconds / 60));
  const otMinutes = Math.round(overtimeSeconds / 60);

  const handleMarkCompleted = () => {
    onConfirmTaskStatus(true);
    onClose();
  };

  const handleKeepPending = () => {
    onConfirmTaskStatus(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl flex flex-col gap-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Header & Celebration */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Award size={26} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              Hoàn thành phiên tập trung!
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Đã ghi nhận: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{actualMinutes} phút</span>
              {otMinutes > 0 && <span className="text-amber-500 font-semibold"> (+{otMinutes}m OT)</span>}
            </p>
          </div>
        </div>

        {/* AI Focus Report Badge (if available) */}
        {aiAnalysis && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Điểm tập trung AI:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {aiAnalysis.score}%
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Hạng {aiAnalysis.grade}
                </span>
              </div>
            </div>
            {aiAnalysis.conclusion && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {aiAnalysis.conclusion}
              </p>
            )}
          </div>
        )}

        {/* Task Summary (if task was linked) */}
        {task ? (
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Công việc vừa thực hiện
            </span>
            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {task.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span>Tiến độ: <strong className="text-neutral-800 dark:text-neutral-200">{task.completedPomodoros + 1}/{task.estimatedPomodoros || 1}</strong> Pomodoro</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 text-xs text-center">
            Phiên làm việc tự do không gắn công việc cụ thể.
          </div>
        )}

        {/* Footer Actions: Exactly 2 Big Clean Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {task ? (
            <>
              <button
                type="button"
                onClick={handleKeepPending}
                className="py-3 px-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Clock size={15} className="text-neutral-400 shrink-0" />
                <span>Tiếp tục sau</span>
              </button>
              <button
                type="button"
                onClick={handleMarkCompleted}
                className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <CheckCircle2 size={16} className="shrink-0" />
                <span>✓ Đã xong việc</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartBreak();
                }}
                className="py-3 px-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <span>Nghỉ giải lao</span>
                <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
