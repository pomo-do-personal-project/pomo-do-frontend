"use client";

import React from "react";
import { X } from "lucide-react";
import { AiFocusVideoPreview } from "./AiFocusVideoPreview";
import { AiFocusControls } from "./AiFocusControls";

interface AiFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAiEnabled: boolean;
  image: string | null;
  isConnecting: boolean;
  borderClass: string;
  countdown: number | null;
  totalScreens: number;
  isConnected: boolean;
  indicator: string;
  onEnable: () => void;
  onAddScreen: () => void;
  onReset: () => void;
}

export function AiFocusModal({
  isOpen,
  onClose,
  isAiEnabled,
  image,
  isConnecting,
  borderClass,
  countdown,
  totalScreens,
  isConnected,
  indicator,
  onEnable,
  onAddScreen,
  onReset,
}: AiFocusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${indicator}`} />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Camera AI Focus (Chế độ phóng to)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Đóng phóng to"
            aria-label="Đóng phóng to"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video feed lớn */}
        <AiFocusVideoPreview
          isAiEnabled={isAiEnabled}
          image={image}
          isConnecting={isConnecting}
          borderClass={borderClass}
          countdown={countdown}
          onEnable={onEnable}
        />

        {/* Điều khiển màn hình */}
        {isAiEnabled && (
          <AiFocusControls
            isConnected={isConnected}
            countdown={countdown}
            totalScreens={totalScreens}
            onAddScreen={onAddScreen}
            onReset={onReset}
          />
        )}
      </div>
    </div>
  );
}
