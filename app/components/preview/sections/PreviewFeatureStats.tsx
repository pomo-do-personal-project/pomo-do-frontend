"use client";

import React from "react";
import { Check } from "lucide-react";
import { MockAnimatedStatsCard } from "../mockups/MockAnimatedStatsCard";

interface PreviewFeatureStatsProps {
  timerSec?: number;
}

export const PreviewFeatureStats = React.memo(function PreviewFeatureStats({
  timerSec = 4 * 60,
}: PreviewFeatureStatsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
          BÁO CÁO & TRỰC QUAN HÓA NĂNG SUẤT
        </span>
        <h2 className="mt-2 text-3xl font-black text-neutral-900 leading-tight">
          Bản đồ nhiệt 7 ngày x 24 giờ & Theo dõi chuỗi ngày Streaks
        </h2>
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          Trực quan hóa chính xác khung giờ vàng bạn làm việc hiệu quả nhất trong tuần. Từng ô màu xanh
          mint và ngọc lục bảo sáng lên tương ứng với mỗi phiên Pomodoro hoàn tất, tiếp thêm cảm hứng để
          duy trì chuỗi ngày tập trung kỷ luật.
        </p>

        <div className="mt-5 space-y-2 text-xs font-semibold text-neutral-700">
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-emerald-500 shrink-0" />
            <span>Ma trận 168 ô (7 ngày x 24 giờ) trực quan sắc nét</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-emerald-500 shrink-0" />
            <span>Theo dõi số giờ tập trung thực tế và kỷ lục chuỗi Streaks</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-emerald-500 shrink-0" />
            <span>Biểu đồ Donut tỷ lệ hoàn thành công việc và thống kê thẻ nhãn</span>
          </div>
        </div>
      </div>

      {/* GIAO DIỆN ĐỘNG ẢNH 1 & 2: THỐNG KÊ FOCUS & TASK */}
      <MockAnimatedStatsCard timerSec={timerSec} />
    </div>
  );
});
