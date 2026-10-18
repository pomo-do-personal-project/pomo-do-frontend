"use client";

import React from "react";
import { Logo } from "../../Logo";
import { ScreenId } from "../types";

interface PreviewFooterProps {
  onSelectScreen: (screen: ScreenId, stepIdx: number) => void;
}

export const PreviewFooter = React.memo(function PreviewFooter({
  onSelectScreen,
}: PreviewFooterProps) {
  return (
    <footer className="py-14 bg-white border-t border-neutral-200 text-xs text-neutral-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo iconOnly size={28} />
            <div>
              <span className="font-extrabold text-sm text-neutral-900">POMO-DO</span>
              <p className="text-[11px] text-neutral-400">
                Hệ thống Pomodoro & Quản lý công việc thông minh.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-neutral-600 font-medium">
            <button
              type="button"
              onClick={() => onSelectScreen("timer", 0)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Đồng hồ Pomodoro
            </button>
            <button
              type="button"
              onClick={() => onSelectScreen("task", 6)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Nhiệm vụ Today
            </button>
            <button
              type="button"
              onClick={() => onSelectScreen("matrix", 10)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Ma trận 4 ô
            </button>
            <button
              type="button"
              onClick={() => onSelectScreen("stat-focus", 14)}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              Bản đồ nhiệt
            </button>
            <a href="#mvp-pricing" className="hover:text-rose-600 transition-colors">
              Bảng giá MVP
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 Pomo-Do Team. Bảo lưu mọi quyền.</p>
          <p className="text-neutral-400">
            Hệ thống quản lý thời gian Pomodoro và gia tăng hiệu suất công việc.
          </p>
        </div>
      </div>
    </footer>
  );
});
