"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Button } from "./ui/Button";
import { Settings, X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, isSaving, isLoading } = useSettingsStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [focusDuration, setFocusDuration] = useState(settings.focusDuration || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration || 15);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFocusDuration(settings.focusDuration || 25);
      setShortBreakDuration(settings.shortBreakDuration || 5);
      setLongBreakDuration(settings.longBreakDuration || 15);
      setAutoStartBreaks(settings.autoStartBreaks || false);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateSettings({
      focusDuration: Number(focusDuration),
      shortBreakDuration: Number(shortBreakDuration),
      longBreakDuration: Number(longBreakDuration),
      autoStartBreaks,
    });

    if (success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm shadow-xs">
              <Settings size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Timer Settings
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAuthenticated
                  ? "Đồng bộ trực tiếp với tài khoản backend"
                  : "Lưu tạm trên trình duyệt (Đăng nhập để đồng bộ)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng cài đặt"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Durations Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Thời lượng chu kỳ (Phút)
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Focus duration */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60 flex flex-col items-center">
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Focus (W)
                </span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center font-mono font-bold text-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl py-1 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <span className="text-[10px] text-neutral-400 mt-1">phút</span>
              </div>

              {/* Short break duration */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60 flex flex-col items-center">
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Short Break
                </span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center font-mono font-bold text-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl py-1 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <span className="text-[10px] text-neutral-400 mt-1">phút</span>
              </div>

              {/* Long break duration */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60 flex flex-col items-center">
                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Long Break
                </span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center font-mono font-bold text-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl py-1 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
                <span className="text-[10px] text-neutral-400 mt-1">phút</span>
              </div>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="flex items-center justify-between cursor-pointer py-2 group">
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Tự động chuyển phiên nghỉ
                </div>
                <div className="text-[11px] text-neutral-400">
                  Tự động kích hoạt đếm giờ nghỉ sau khi kết thúc Pomodoro
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer accent-neutral-900 dark:accent-white"
              />
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="min-w-[90px]"
            >
              {isSaving ? (
                "Đang lưu..."
              ) : savedSuccess ? (
                "✓ Đã lưu"
              ) : (
                "Lưu cài đặt"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
