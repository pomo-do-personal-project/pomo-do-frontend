"use client";

import React, { useState, useEffect } from "react";
import { X, Sliders, ShieldCheck, Monitor, RotateCcw, Plus } from "lucide-react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";

interface AiFocusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiFocusSettingsModal({ isOpen, onClose }: AiFocusSettingsModalProps) {
  const {
    isConnected,
    isAiEnabled,
    status,
    detail,
    image,
    totalScreens,
    addScreen,
    resetScreens,
  } = useAiFocusStore();

  const [screenCountdown, setScreenCountdown] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Countdown xử lý thêm màn hình làm việc
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (screenCountdown !== null && screenCountdown > 0) {
      t = setTimeout(() => setScreenCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    } else if (screenCountdown === 0) {
      addScreen().then((ok) => {
        setFeedback(ok ? "✓ Đã lưu góc màn hình mới thành công!" : "✕ Không phát hiện khuôn mặt, hãy nhìn thẳng!");
        setTimeout(() => setFeedback(null), 3000);
      });
      setScreenCountdown(null);
    }
    return () => clearTimeout(t);
  }, [screenCountdown, addScreen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-3.5 sm:gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Hiệu chuẩn Camera & Màn hình AI
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Kiểm tra góc camera và thiết lập các màn hình làm việc của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {feedback && (
          <div className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold text-center animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Khung Live Camera & HUD Preview */}
        <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
          {image && isAiEnabled ? (
            <img
              src={image}
              alt="Live HUD Preview"
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="text-center p-4 text-xs text-neutral-500">
              {isAiEnabled ? "Đang chờ luồng camera..." : "Camera AI đang tắt. Vui lòng bật camera ở ngoài widget."}
            </div>
          )}

          {/* Badge trạng thái live */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === "FOCUSED" ? "bg-emerald-400" : status === "DISTRACTED" ? "bg-rose-400" : "bg-amber-400"}`} />
            <span>{detail || status}</span>
          </div>

          {/* Countdown Overlay khi thêm màn hình */}
          {screenCountdown !== null && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
              <span className="text-4xl font-extrabold text-amber-400 animate-bounce">
                {screenCountdown}
              </span>
              <span className="text-xs font-semibold text-white">
                Nhìn tập trung vào màn hình hoặc vị trí cần lưu...
              </span>
            </div>
          )}
        </div>

        {/* QUẢN LÝ ĐA MÀN HÌNH & VÙNG LÀM VIỆC */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor size={15} className="text-emerald-500" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Vùng làm việc (Đã lưu: {totalScreens} màn hình)
              </span>
            </div>
            <button
              type="button"
              onClick={resetScreens}
              disabled={!isConnected || totalScreens === 0}
              className="text-[11px] text-neutral-500 hover:text-rose-500 flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Đặt lại</span>
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Bạn có thể dùng nhiều màn hình hoặc vừa nhìn laptop vừa đọc tài liệu trên bàn. Hãy nhìn vào góc làm việc đó và bấm nút thêm.
          </p>

          <button
            type="button"
            disabled={!isConnected || screenCountdown !== null}
            onClick={() => setScreenCountdown(3)}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>{screenCountdown !== null ? `Nhìn vào màn hình mới (${screenCountdown}s)...` : "+ Thêm màn hình hiện tại (3s)"}</span>
          </button>
        </div>

        {/* THÔNG TIN BẢO VỆ KÉP & LỌC MẮT KÍNH TỰ ĐỘNG */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
            <strong className="text-emerald-600 dark:text-emerald-400">Bảo vệ kép tự động: </strong>
            AI tự động phân biệt và bỏ qua mắt kính cận theo thời gian thực. Hệ thống áp dụng góc nhìn rộng tự nhiên (±28°), bộ đệm 2.0s chống chớp giật, và bắt buộc có bàn tay cầm điện thoại để không bao giờ báo nhầm.
          </div>
        </div>
      </div>
    </div>
  );
}
