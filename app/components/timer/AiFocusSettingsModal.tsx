"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sliders, ShieldCheck } from "lucide-react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";
import { AiFocusVideoPreview } from "./AiFocusVideoPreview";
import { AiSettingsSensitivitySection } from "./AiSettingsSensitivitySection";
import { AiSettingsFeaturesSection } from "./AiSettingsFeaturesSection";
import { AiSettingsMultiScreenSection } from "./AiSettingsMultiScreenSection";

interface AiFocusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiFocusSettingsModal({ isOpen, onClose }: AiFocusSettingsModalProps) {
  const {
    isConnecting,
    isAiEnabled,
    toggleAiEnabled,
    status,
    detail,
    image,
    addScreen,
  } = useAiFocusStore();

  const [mounted, setMounted] = useState(false);
  const [screenCountdown, setScreenCountdown] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  // Countdown xử lý thêm màn hình làm việc
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (screenCountdown !== null && screenCountdown > 0) {
      t = setTimeout(() => setScreenCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    } else if (screenCountdown === 0) {
      addScreen().then((ok) => {
        setFeedback(ok ? "✓ Đã lưu góc màn hình mới thành công!" : "✕ Chưa nhận diện được khuôn mặt, vui lòng nhìn rõ camera!");
        setTimeout(() => setFeedback(null), 3000);
      });
      setScreenCountdown(null);
    }
    return () => clearTimeout(t);
  }, [screenCountdown, addScreen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-settings-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-xl max-h-[88vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-3.5 sm:gap-4 text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sliders size={18} />
            </div>
            <div>
              <h3 id="ai-settings-modal-title" className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Hiệu chuẩn Camera & Màn hình AI
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Kiểm tra góc camera, thiết lập độ nhạy và vùng màn hình làm việc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ cài đặt AI"
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
        <div className="relative w-full shrink-0">
          <AiFocusVideoPreview
            isAiEnabled={isAiEnabled}
            image={image}
            isConnecting={isConnecting}
            borderClass="border-neutral-800"
            countdown={screenCountdown}
            onEnable={toggleAiEnabled}
          />

          {/* Badge trạng thái live */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/10 pointer-events-none">
            <span className={`w-2 h-2 rounded-full ${status === "FOCUSED" ? "bg-emerald-400" : status === "DISTRACTED" ? "bg-rose-400" : "bg-amber-400"}`} />
            <span>{detail || status}</span>
          </div>
        </div>

        {/* ĐIỀU CHỈNH ĐỘ NHẠY AI (SENSITIVITY) */}
        <AiSettingsSensitivitySection />

        {/* CÁC TÍNH NĂNG THÔNG MINH: LÀM MỜ NỀN & CHẾ ĐỘ ĐỌC SÁCH */}
        <AiSettingsFeaturesSection />

        {/* QUẢN LÝ ĐA MÀN HÌNH & VÙNG LÀM VIỆC */}
        <AiSettingsMultiScreenSection
          screenCountdown={screenCountdown}
          onStartAddScreen={() => setScreenCountdown(3)}
        />

        {/* THÔNG TIN KỸ THUẬT VÀ CAM KẾT QUYỀN RIÊNG TƯ */}
        <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              <strong className="text-blue-600 dark:text-blue-400">Cơ chế phát hiện: </strong>
              AI sử dụng mô hình YOLOv8 & FaceMesh phân tích hướng nhìn và phát hiện điện thoại theo thời gian thực kết hợp Selfie Segmentation làm mờ hậu cảnh để triệt tiêu việc nhận nhầm đồ đạc phía sau.
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 border-t border-neutral-200/50 dark:border-neutral-800 pt-1.5 leading-relaxed">
            🔒 <strong>Cam kết quyền riêng tư:</strong> Khung hình camera chỉ được phân tích trực tiếp trên bộ nhớ đệm RAM trong phiên WebSocket của bạn. Dữ liệu hình ảnh được giải phóng ngay lập tức và tuyệt đối không bao giờ được ghi lại hay lưu trữ trên máy chủ.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
