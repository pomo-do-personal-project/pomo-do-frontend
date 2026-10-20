"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, X, LogOut, Play } from "lucide-react";

interface ZeroMinuteConfirmModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  isBreak?: boolean;
  onExit: () => void;
  onResume: () => void;
  onClose: () => void;
}

export function ZeroMinuteConfirmModal({
  isOpen,
  elapsedSeconds,
  isBreak = false,
  onExit,
  onResume,
  onClose,
}: ZeroMinuteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl flex flex-col gap-4 text-center"
      >
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
            {isBreak ? "Phiên nghỉ ngơi dưới 1 phút" : "Phiên học dưới 1 phút"}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
            {isBreak
              ? "Thời gian nghỉ ngơi dưới 1 phút, bạn có muốn thoát khỏi phiên nghỉ không?"
              : "Phiên học dưới 1 phút sẽ không được lưu vào báo cáo thống kê. Bạn có chắc chắn muốn thoát?"}
          </p>
          <span className="text-xs text-neutral-400 font-mono">
            Thời gian đã trôi qua: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
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
            {isBreak ? "Tiếp tục nghỉ" : "Tiếp tục học"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
