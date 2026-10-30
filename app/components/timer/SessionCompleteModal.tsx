"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Clock, X, ArrowRight, Award, ShieldCheck, Coffee } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [isTaskDone, setIsTaskDone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsTaskDone(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const actualMinutes = Math.max(1, Math.round(actualSeconds / 60));
  const otMinutes = Math.round(overtimeSeconds / 60);

  const handleStayPaused = () => {
    if (task) {
      onConfirmTaskStatus(isTaskDone);
    }
    onClose();
  };

  const handleStartBreakNow = () => {
    if (task) {
      onConfirmTaskStatus(isTaskDone);
    }
    onClose();
    onStartBreak();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleStayPaused} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl flex flex-col gap-5 text-left"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleStayPaused}
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
                Điểm tự phản tư AI (Cá nhân):
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
            <div className="text-[10px] text-neutral-400 border-t border-neutral-200/40 dark:border-neutral-700/40 pt-1.5">
              Chỉ số tham khảo cá nhân giúp bạn tối ưu thói quen học tập, không dùng để xếp hạng cạnh tranh.
            </div>
          </div>
        )}

        {/* Task Summary (if task was linked) */}
        {task ? (
          <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Công việc vừa thực hiện
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Tiến độ: <strong className="text-neutral-800 dark:text-neutral-200">{task.completedPomodoros + 1}/{task.estimatedPomodoros || 1}</strong> Pomodoro
              </span>
            </div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {task.title}
            </p>
            <button
              type="button"
              onClick={() => setIsTaskDone((prev) => !prev)}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                isTaskDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className={isTaskDone ? "text-emerald-500" : "text-neutral-400"} />
                Đánh dấu công việc đã hoàn thành
              </span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${isTaskDone ? "bg-emerald-500 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"}`}>
                {isTaskDone ? "ĐÃ XONG" : "CHƯA XONG"}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 text-xs text-center">
            Phiên làm việc tự do không gắn công việc cụ thể.
          </div>
        )}

        {/* Question: Thông báo hỏi có muốn chuyển sang giờ nghỉ hay không */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <Coffee size={16} className="text-emerald-500 shrink-0" />
          <span>Bạn có muốn chuyển sang giờ nghỉ giải lao ngay bây giờ không?</span>
        </div>

        {/* Footer Actions: 2 Big Clean Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleStayPaused}
            className="py-3 px-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-center"
          >
            Để sau (Chưa nghỉ)
          </button>
          <button
            type="button"
            onClick={handleStartBreakNow}
            className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <span>Chuyển sang giờ nghỉ</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
