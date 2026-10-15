"use client";

import React, { useState, useEffect } from "react";
import { useAiFocusStore } from "../../stores/useAiFocusStore";
import { Monitor, RotateCcw, Plus, Power } from "lucide-react";
import { AiFocusVideoPreview } from "./AiFocusVideoPreview";
import { getAiFocusStatusInfo } from "./aiFocusStatusHelper";

interface AiFocusWidgetProps {
  isTimerRunning?: boolean;
}

export function AiFocusWidget({ isTimerRunning = false }: AiFocusWidgetProps) {
  const isConnected = useAiFocusStore((s) => s.isConnected);
  const isAiEnabled = useAiFocusStore((s) => s.isAiEnabled);
  const isConnecting = useAiFocusStore((s) => s.isConnecting);
  const status = useAiFocusStore((s) => s.status);
  const detail = useAiFocusStore((s) => s.detail);
  const activeScreen = useAiFocusStore((s) => s.activeScreen);
  const totalScreens = useAiFocusStore((s) => s.totalScreens);
  const distractionCount = useAiFocusStore((s) => s.distractionCount);
  const getFocusScore = useAiFocusStore((s) => s.getFocusScore);
  const image = useAiFocusStore((s) => s.image);

  const toggleAiEnabled = useAiFocusStore((s) => s.toggleAiEnabled);
  const addScreen = useAiFocusStore((s) => s.addScreen);
  const resetScreens = useAiFocusStore((s) => s.resetScreens);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    <div className="w-full max-w-sm mt-4 p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col gap-3">
      {toastMessage && (
        <div className="px-3 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold text-center animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

      {/* Thanh tiêu đề & Công tắc bật tắt */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusInfo.indicator}`} />
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Camera AI Focus
          </span>
          {isTimerRunning && isAiEnabled && (
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {focusScore}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleAiEnabled}
          title={isAiEnabled ? "Tắt Camera AI" : "Bật Camera AI"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isAiEnabled
              ? "bg-emerald-500 text-white shadow-xs"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          <Power size={13} />
          <span>{isAiEnabled ? "Đang bật" : "Bật camera"}</span>
        </button>
      </div>

      {/* KHUNG MÀN HÌNH CAMERA */}
      <AiFocusVideoPreview
        isAiEnabled={isAiEnabled}
        image={image}
        isConnecting={isConnecting}
        borderClass={statusInfo.borderClass}
        countdown={countdown}
        onEnable={toggleAiEnabled}
      />

      {/* THANH ĐIỀU KHIỂN & ĐA MÀN HÌNH */}
      {isAiEnabled && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Monitor size={13} />
              <span>Đã lưu: <strong>{totalScreens}</strong> màn hình</span>
            </span>
            {distractionCount > 0 && (
              <span className="text-rose-500 font-semibold">{distractionCount} lần xao nhãng</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddScreen}
              disabled={!isConnected || countdown !== null}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                countdown !== null
                  ? "bg-amber-500 text-white animate-pulse"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 cursor-pointer"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {countdown !== null ? <span>Đang đếm {countdown}s...</span> : <><Plus size={13} strokeWidth={2.5} /><span>+ Thêm màn hình này</span></>}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={!isConnected || countdown !== null}
              title="Đặt lại màn hình"
              className="py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
