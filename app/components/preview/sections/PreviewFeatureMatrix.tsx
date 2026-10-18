"use client";

import React from "react";
import { MockAnimatedMatrixCard } from "../mockups/MockAnimatedMatrixCard";

interface PreviewFeatureMatrixProps {
  timerSec?: number;
}

export const PreviewFeatureMatrix = React.memo(function PreviewFeatureMatrix({
  timerSec = 4 * 60,
}: PreviewFeatureMatrixProps) {
  return (
    <div id="matrix" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* GIAO DIỆN ĐỘNG: MA TRẬN EISENHOWER */}
      <MockAnimatedMatrixCard timerSec={timerSec} />

      {/* CỘT NỘI DUNG 4 Ô CHI TIẾT */}
      <div className="order-1 lg:order-2">
        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          MA TRẬN ƯU TIÊN EISENHOWER
        </span>
        <h2 className="mt-2 text-3xl font-black text-neutral-900 leading-tight">
          Phân loại công việc trực quan, thoát khỏi bẫy &ldquo;chữa cháy&rdquo;
        </h2>
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          Đừng để cả ngày chỉ loay hoay trong áp lực. Ma trận Eisenhower trong Pomo-Do giúp bạn kéo thả
          công việc vào đúng 4 góc phần tư, hiển thị cảnh báo thông minh nếu Q1 bị quá tải và hướng bạn
          đầu tư 80% thời gian vào Q2 để tạo bước ngoặt lớn.
        </p>

        {/* 4 Ô PHÂN LOẠI CHI TIẾT VỚI CSS VECTOR DOTS */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border-l-4 border-l-rose-500 border border-neutral-200 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>Ô 1: LÀM NGAY</span>
            </div>
            <div className="text-[11px] font-bold text-rose-600 mb-1">Khẩn cấp & Quan trọng</div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Xử lý ngay các việc cấp bách, deadline trong ngày.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-l-4 border-l-blue-500 border border-neutral-200 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <span>Ô 2: LÊN LỊCH</span>
            </div>
            <div className="text-[11px] font-bold text-blue-600 mb-1">Quan trọng, Không gấp</div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Vùng đất vàng dài hạn: Học tập, nghiên cứu và kế hoạch.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-l-4 border-l-amber-500 border border-neutral-200 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Ô 3: ỦY QUYỀN</span>
            </div>
            <div className="text-[11px] font-bold text-amber-600 mb-1">Gấp, Không quan trọng</div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Các việc gián đoạn hoặc bàn giao cho thành viên khác.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border-l-4 border-l-neutral-400 border border-neutral-200 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" />
              <span>Ô 4: LOẠI BỎ</span>
            </div>
            <div className="text-[11px] font-bold text-neutral-600 mb-1">Không gấp, Không quan trọng</div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Lướt mạng vô định, loại bỏ triệt để thói quen trì hoãn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
