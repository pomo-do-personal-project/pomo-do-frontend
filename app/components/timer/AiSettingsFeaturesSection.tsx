"use client";

import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";

export function AiSettingsFeaturesSection() {
  const { deskReadingMode, setDeskReadingMode, blurBackground, setBlurBackground } = useAiFocusStore();

  return (
    <div className="flex flex-col gap-3">
      {/* TÍNH NĂNG LÀM MỜ HẬU CẢNH (BACKGROUND BLUR) */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>Làm mờ hậu cảnh (Background Blur)</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                Mới
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
              Tự động phân tách người và làm mờ toàn bộ không gian phía sau (balo, cặp xách, ghế tựa, giường tủ). Vừa bảo vệ riêng tư vừa ngăn chặn triệt để camera AI nhận nhầm đồ đạc là điện thoại.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={blurBackground}
          onClick={() => setBlurBackground(!blurBackground)}
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
            blurBackground ? "bg-amber-500 justify-end" : "bg-neutral-300 dark:bg-neutral-700 justify-start"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
        </button>
      </div>

      {/* CHẾ ĐỘ ĐỌC SÁCH / TÀI LIỆU TRÊN BÀN */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <BookOpen size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Chế độ đọc sách / tài liệu trên bàn
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
              Chỉ bật khi bạn cần cúi đầu đọc sách giấy hoặc ghi chép. Khi tắt, hệ thống sẽ cảnh báo nếu bạn cúi gằm mặt để tránh việc lén dùng điện thoại trong lòng.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={deskReadingMode}
          onClick={() => setDeskReadingMode(!deskReadingMode)}
          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
            deskReadingMode ? "bg-amber-500 justify-end" : "bg-neutral-300 dark:bg-neutral-700 justify-start"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
        </button>
      </div>
    </div>
  );
}

