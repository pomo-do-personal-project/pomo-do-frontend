"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PreviewHeroProps {
  language: string;
  isAuthenticated: boolean;
  onOpenAuthModal: (mode: "signin" | "signup") => void;
}

export const PreviewHero = React.memo(function PreviewHero({
  language,
  isAuthenticated,
  onOpenAuthModal,
}: PreviewHeroProps) {
  return (
    <div className="text-center relative z-10">
      {/* Headline 2 dòng sắc nét với duy nhất 1 thẻ h1 chuẩn SEO */}
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 leading-[1.12]">
        Làm chủ thời gian, <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500">
          Bứt phá năng suất.
        </span>
      </h1>

      <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
        Hệ sinh thái năng suất toàn diện: Từ bấm giờ Pomodoro, danh sách nhiệm vụ Today, phân bổ Ma
        trận ưu tiên 4 ô cho đến phân tích Bản đồ nhiệt Heatmap 7x24h.
      </p>

      {/* Cặp CTA Button */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {!isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => onOpenAuthModal("signup")}
              className="px-7 py-3.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Bắt đầu sử dụng ngay</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#mockup-3d"
              className="px-6 py-3.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-sm rounded-2xl transition-all cursor-pointer shadow-2xs"
            >
              Khám phá giao diện ↓
            </a>
          </>
        ) : (
          <Link
            href={`/${language}`}
            className="px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Mở không gian làm việc của bạn</span>
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
});
