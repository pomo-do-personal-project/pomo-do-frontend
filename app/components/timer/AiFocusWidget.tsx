"use client";

import React, { useState, useEffect } from "react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Power, ChevronDown, ChevronUp, Maximize2, Sparkles, Settings } from "lucide-react";
import { AiFocusVideoPreview } from "./AiFocusVideoPreview";
import { AiFocusControls } from "./AiFocusControls";
import { AiFocusModal } from "./AiFocusModal";
import { AiFocusSettingsModal } from "./AiFocusSettingsModal";
import { getAiFocusStatusInfo } from "./aiFocusStatusHelper";

interface AiFocusWidgetProps {
  isTimerRunning?: boolean;
}

export function AiFocusWidget({ isTimerRunning = false }: AiFocusWidgetProps) {
  const {
    isConnected, isAiEnabled, isConnecting, status, detail,
    activeScreen, totalScreens, distractionCount, getFocusScore, image,
    toggleAiEnabled, addScreen, resetScreens
  } = useAiFocusStore();
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // Khởi tạo trạng thái thu gọn từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pomodo_ai_widget_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("pomodo_ai_widget_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      addScreen().then((ok) => {
        setToastMessage(ok ? "✓ Đã lưu màn hình thành công!" : "✕ Chưa nhận được khuôn mặt, hãy thử lại!");
        setTimeout(() => setToastMessage(null), 2500);
      });
      setCountdown(null);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, addScreen]);

  const handleAddScreen = () => {
    if (!isConnected || countdown !== null) return;
    setCountdown(3);
  };

  const handleReset = async () => {
    if (!isConnected) return;
    const ok = await resetScreens();
    if (ok) {
      setToastMessage("✓ Đã đặt lại màn hình!");
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const statusInfo = getAiFocusStatusInfo(status, isAiEnabled, isConnecting, detail, activeScreen);
  const focusScore = getFocusScore();

  return (
    <div
      className={`w-full max-w-sm mt-3 rounded-2xl flex flex-col transition-all duration-200 ${
        wallpaperUrl
          ? "bg-neutral-950/80 backdrop-blur-xl border border-white/15 text-white shadow-2xl"
          : "bg-white/90 backdrop-blur-xl border border-neutral-200/90 text-neutral-900 shadow-md"
      } ${
        isCollapsed ? "p-2 sm:px-3 sm:py-2.5 gap-0" : "p-3.5 gap-3"
      }`}
    >
      {toastMessage && (
        <div className={`px-3 py-1 mb-2 rounded-xl text-xs font-semibold text-center animate-in fade-in duration-150 backdrop-blur-md ${
          wallpaperUrl ? "bg-white/20 text-white" : "bg-neutral-900 text-white"
        }`}>
          {toastMessage}
        </div>
      )}

      {/* Thanh tiêu đề: Thu gọn hoặc Mở rộng */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex items-center gap-2 cursor-pointer group text-left flex-1 py-0.5"
          title={isCollapsed ? "Bấm để mở rộng khung AI Focus" : "Bấm để thu nhỏ khung AI Focus"}
        >
          <div className="relative flex items-center justify-center">
            <span className={`w-2 h-2 rounded-full ${statusInfo.indicator}`} />
            {isAiEnabled && isConnected && (
              <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span className={`text-xs font-bold transition-colors ${
              wallpaperUrl
                ? "text-white/90 group-hover:text-white"
                : "text-neutral-800 group-hover:text-neutral-950"
            }`}>
              Camera AI Focus
            </span>
          </div>

          {isTimerRunning && isAiEnabled && (
            <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {focusScore}%
            </span>
          )}

          {isCollapsed && isAiEnabled && distractionCount > 0 && (
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/15 px-1.5 py-0.5 rounded">
              {distractionCount} xao nhãng
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          {/* Nút bật tắt nguồn nhanh */}
          <button
            type="button"
            onClick={toggleAiEnabled}
            title={isAiEnabled ? "Tắt Camera AI" : "Bật Camera AI"}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
              isAiEnabled
                ? "bg-emerald-500 text-white shadow-xs"
                : wallpaperUrl
                ? "bg-white/10 hover:bg-white/20 text-white/80 border border-white/10"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200"
            }`}
          >
            <Power size={11} />
            <span>{isAiEnabled ? "Bật" : "Tắt"}</span>
          </button>

          {/* Nút Cài đặt & Hiệu chuẩn Studio */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Cài đặt & Hiệu chuẩn AI"
            className={`p-1 rounded-xl cursor-pointer transition-colors ${
              wallpaperUrl
                ? "text-white/60 hover:text-white hover:bg-white/15"
                : "text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <Settings size={13} />
          </button>

          {/* Nút phóng to toàn màn hình */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsEnlarged(true)}
              title="Phóng to khung hình chi tiết"
              className={`p-1 rounded-xl cursor-pointer transition-colors ${
                wallpaperUrl
                  ? "text-white/60 hover:text-white hover:bg-white/15"
                  : "text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              <Maximize2 size={13} />
            </button>
          )}

          {/* Nút thu nhỏ / mở rộng */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Mở rộng khung AI" : "Thu nhỏ gọn"}
            className={`p-1 rounded-xl cursor-pointer transition-colors ${
              wallpaperUrl
                ? "text-white/60 hover:text-white hover:bg-white/15"
                : "text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* NỘI DUNG CHI TIẾT (KHI MỞ RỘNG) */}
      {!isCollapsed && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-150">
          <AiFocusVideoPreview
            isAiEnabled={isAiEnabled}
            image={image}
            isConnecting={isConnecting}
            borderClass={statusInfo.borderClass}
            countdown={countdown}
            onEnable={toggleAiEnabled}
          />

          {isAiEnabled && (
            <AiFocusControls
              isConnected={isConnected}
              countdown={countdown}
              totalScreens={totalScreens}
              distractionCount={distractionCount}
              onAddScreen={handleAddScreen}
              onReset={handleReset}
            />
          )}
        </div>
      )}

      {/* Modal phóng to toàn màn hình */}
      <AiFocusModal
        isOpen={isEnlarged} onClose={() => setIsEnlarged(false)}
        isAiEnabled={isAiEnabled} image={image} isConnecting={isConnecting}
        borderClass={statusInfo.borderClass} countdown={countdown}
        totalScreens={totalScreens} isConnected={isConnected}
        indicator={statusInfo.indicator} onEnable={toggleAiEnabled}
        onAddScreen={handleAddScreen} onReset={handleReset}
      />

      {/* Modal Cài đặt & Hiệu chuẩn Studio */}
      <AiFocusSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
