"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

interface PreviewCTAProps {
  language: string;
  isAuthenticated: boolean;
  onOpenAuthModal: (mode: "signin" | "signup") => void;
}

export const PreviewCTA = React.memo(function PreviewCTA({
  language,
  isAuthenticated,
  onOpenAuthModal,
}: PreviewCTAProps) {
  return (
    <section className="py-20 border-t border-neutral-200 bg-neutral-50/40 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-5">
          <Zap size={14} />
          <span>Khởi đầu hành trình năng suất đỉnh cao</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
          Sẵn sàng làm chủ sự tập trung của bạn?
        </h2>

        <p className="mt-4 text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
          Trải nghiệm trọn vẹn bộ công cụ Pomodoro, Ma trận 4 ô, Thống kê Heatmap 7x24 và Trợ lý AI
          Focus Guardian ngay hôm nay mà không mất bất kỳ chi phí nào.
        </p>

        <div className="mt-8 flex justify-center">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => onOpenAuthModal("signup")}
              className="px-8 py-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2.5"
            >
              <span>Bắt đầu trải nghiệm ngay (Miễn phí)</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <Link
              href={`/${language}`}
              className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2.5"
            >
              <span>Vào ứng dụng làm việc ngay</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
});
