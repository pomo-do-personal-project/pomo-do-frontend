"use client";

import React, { useState } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { useTranslation } from "../../../stores/useLanguageStore";

interface PreviewPricingProps {
  onOpenAuthModal: (mode: "signin" | "signup") => void;
}

export const PreviewPricing = React.memo(function PreviewPricing({
  onOpenAuthModal,
}: PreviewPricingProps) {
  const { language } = useTranslation();
  const [hasSubscribedPro, setHasSubscribedPro] = useState(false);

  return (
    <section id="mvp-pricing" className="py-24 border-t border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4">
          <ShieldCheck size={14} />
          <span>Chính sách giai đoạn MVP ra mắt</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-neutral-900">
          BẢNG GIÁ DỊCH VỤ
        </h2>
        <p className="mt-2 text-sm text-neutral-500 max-w-xl mx-auto">
          Minh bạch và hoàn toàn miễn phí trải nghiệm. Thông tin trung thực dựa trên hệ thống cài
          đặt gói cước hiện tại của Pomo-Do.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* GÓI HIỆN TẠI: MIỄN PHÍ */}
          <div className="p-8 rounded-3xl bg-neutral-50/80 border-2 border-neutral-900 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
              ĐANG KHẢ DỤNG
            </div>

            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-widest block mb-1">
                GÓI HIỆN TẠI
              </span>
              <h3 className="text-2xl font-black text-neutral-900">
                {language === "vi" ? "Miễn phí" : "Free"}
              </h3>
              <p className="text-xs text-neutral-500 mt-2">
                Dành cho mọi cá nhân mong muốn xây dựng thói quen tập trung kỷ luật.
              </p>

              <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3 text-xs text-neutral-700">
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>Đồng hồ Pomodoro & Stopwatch đầy đủ</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>Ma trận 4 ô Eisenhower kéo thả mượt mà</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>AI Focus Guardian đo lường cơ bản tại máy</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>Bản đồ nhiệt năng suất 7x24h & Streaks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {language === "vi" ? "Hỗ trợ Chế độ ngoại tuyến" : "Offline Mode Support"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => onOpenAuthModal("signup")}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center block"
              >
                Đăng ký miễn phí ngay
              </button>
            </div>
          </div>

          {/* GÓI SẮP RA MẮT: POMODO PRO & PLUS */}
          <div className="p-8 rounded-3xl bg-white border border-neutral-200 shadow-sm flex flex-col justify-between relative opacity-90 hover:opacity-100 transition-opacity">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-neutral-200 text-neutral-700 text-[11px] font-bold">
              SẮP RA MẮT
            </div>

            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                NÂNG TẦM TRẢI NGHIỆM
              </span>
              <h3 className="text-2xl font-black text-neutral-900">Pomodo Pro & Plus</h3>
              <p className="text-xs text-neutral-500 mt-2">
                Mở rộng tối đa tính năng âm thanh môi trường và báo cáo phân tích sâu.
              </p>

              <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3 text-xs text-neutral-600">
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-neutral-400 shrink-0" />
                  <span>Bao gồm tất cả tính năng của gói Miễn phí</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-rose-500 shrink-0" />
                  <span>Âm thanh nền tập trung độc quyền (Lofi, Mưa rơi, Tiếng ồn trắng)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-rose-500 shrink-0" />
                  <span>Không giới hạn màu sắc và thẻ phân loại công việc</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-rose-500 shrink-0" />
                  <span>Báo cáo hiệu suất tập trung chuyên sâu theo tuần/tháng</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={16} className="text-rose-500 shrink-0" />
                  <span>Đồng bộ hóa đám mây đa thiết bị mượt mà</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setHasSubscribedPro(true)}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-center block border ${
                  hasSubscribedPro
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300/80"
                }`}
              >
                {hasSubscribedPro
                  ? "Đã ghi danh nhận thông báo ra mắt!"
                  : "Đăng ký nhận thông báo ra mắt"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
