"use client";

import React, { useEffect } from "react";
import { Clock, X, LogOut, Play } from "lucide-react";

interface ZeroMinuteConfirmModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  onExit: () => void;
  onResume: () => void;
  onClose: () => void;
}

export function ZeroMinuteConfirmModal({
  isOpen,
  elapsedSeconds,
  onExit,
  onResume,
  onClose,
}: ZeroMinuteConfirmModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl flex flex-col gap-4 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
          <Clock size={28} className="animate-pulse" />
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Phiên học dưới 1 phút
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
            Những phiên dưới 1 phút thì hệ thống sẽ không lưu, bạn có muốn thoát không?
          </p>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            (Thời gian hiện tại: {elapsedSeconds} giây)
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-rose-500/10 text-neutral-700 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-rose-500/20 dark:text-neutral-300 dark:hover:text-rose-400 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut size={15} />
            Thoát (Không lưu)
          </button>
          <button
            type="button"
            onClick={onResume}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Play size={14} className="fill-current" />
            Tiếp tục học
          </button>
        </div>
      </div>
    </div>
  );
}
