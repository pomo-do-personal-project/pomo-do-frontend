"use client";

import React from "react";
import { Camera, RefreshCw } from "lucide-react";

interface AiFocusVideoPreviewProps {
  isAiEnabled: boolean;
  image: string | null;
  isConnecting: boolean;
  borderClass: string;
  countdown: number | null;
  onEnable: () => void;
}

export function AiFocusVideoPreview({
  isAiEnabled,
  image,
  isConnecting,
  borderClass,
  countdown,
  onEnable,
}: AiFocusVideoPreviewProps) {
  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950 border-2 transition-all duration-200 flex items-center justify-center ${borderClass}`}
    >
      {isAiEnabled && image ? (
        <img
          src={image}
          alt="AI Camera Feed"
          className="w-full h-full object-cover select-none"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
          {isConnecting ? (
            <>
              <RefreshCw size={22} className="animate-spin text-emerald-400" />
              <span className="text-xs text-neutral-400">Đang khởi động webcam...</span>
            </>
          ) : (
            <>
              <Camera size={26} className="text-neutral-600" />
              <span className="text-xs text-neutral-400">Camera AI đang tắt</span>
              {!isAiEnabled && (
                <button
                  type="button"
                  onClick={onEnable}
                  className="mt-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Bật camera ngay
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Đếm ngược khi hiệu chuẩn thêm màn hình */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1.5">
          <span className="text-4xl font-extrabold text-amber-400 animate-bounce">
            {countdown}
          </span>
          <span className="text-xs text-white px-2.5 py-1 bg-neutral-900 rounded-full font-medium">
            Hãy quay sang màn hình phụ...
          </span>
        </div>
      )}
    </div>
  );
}
