"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

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

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4 text-left"
      >
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
    </div>,
    document.body
  );
}
