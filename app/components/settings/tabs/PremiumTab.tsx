"use client";

import React from "react";
import { Crown, Sparkles } from "lucide-react";

interface PremiumTabProps {
  showNotice: (message: string, icon?: React.ReactNode) => void;
}

export function PremiumTab({ showNotice }: PremiumTabProps) {
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 py-4 animate-in fade-in duration-150">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <Crown size={22} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Pomodo Pro & Plus</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
            Nâng tầm trải nghiệm tập trung với đầy đủ âm thanh nền, thống kê biểu đồ nâng cao và không giới hạn thẻ phân loại.
          </p>
        </div>
      </div>

      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-3 text-xs">
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <Sparkles size={14} className="text-amber-500" />
          <span>Âm thanh nền tập trung độc quyền (Lofi, Mưa rơi, White Noise)</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <Sparkles size={14} className="text-amber-500" />
          <span>Không giới hạn màu sắc và thẻ Tags phân loại công việc</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
          <Sparkles size={14} className="text-amber-500" />
          <span>Báo cáo hiệu suất tập trung chuyên sâu theo tuần/tháng</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          showNotice(
            "Chương trình trải nghiệm dùng thử miễn phí sẽ mở sớm trong bản cập nhật tới.",
            <Sparkles size={18} className="text-amber-500" />
          )
        }
        className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-amber-600 dark:text-amber-400 font-bold text-sm rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 border border-amber-500/30"
      >
        <Sparkles size={16} />
        <span>Coming Soon (Sắp ra mắt)</span>
      </button>
    </div>
  );
}
