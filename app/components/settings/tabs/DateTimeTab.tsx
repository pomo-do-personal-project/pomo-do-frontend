"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { usePomodoroStore } from "../../../stores/usePomodoroStore";
import { Timer, Coffee, Check } from "lucide-react";
import { useTranslation } from "../../../stores/useLanguageStore";
import { DurationStepper } from "./DurationStepper";

interface DateTimeTabProps {
  showNotice: (message: string, icon?: React.ReactNode) => void;
}

export function DateTimeTab({ showNotice }: DateTimeTabProps) {
  const { t } = useTranslation();
  const { settings, updateSettings, isSaving } = useSettingsStore();

  const [focusDuration, setFocusDuration] = useState(settings.focusDuration || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration || 5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks || false);
  const [autoStartFocus, setAutoStartFocus] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFocusDuration(settings.focusDuration || 25);
    setShortBreakDuration(settings.shortBreakDuration || 5);
    const savedAutoBreak = localStorage.getItem("pomodo_auto_start_breaks");
    if (savedAutoBreak !== null) {
      setAutoStartBreaks(savedAutoBreak === "true");
    } else {
      setAutoStartBreaks(settings.autoStartBreaks || false);
    }

    const savedAutoFocus = localStorage.getItem("pomodo_auto_start_focus");
    if (savedAutoFocus !== null) setAutoStartFocus(savedAutoFocus === "true");
  }, [settings]);

  // Tự động lưu cài đặt ngay khi người dùng thay đổi
  const persistSettings = async (updates: Partial<{
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
  }>) => {
    try {
      await updateSettings(updates);

      // Đồng bộ ngay lập tức sang runtime Pomodoro Store khi đồng hồ đang ở trạng thái rảnh
      const pomo = usePomodoroStore.getState();
      if (!pomo.isRunning && pomo.elapsedSeconds === 0) {
        if (updates.focusDuration !== undefined && pomo.focusMode === "W") {
          pomo.resetTimer(updates.focusDuration * 60);
        } else if (updates.shortBreakDuration !== undefined && pomo.focusMode !== "W") {
          pomo.resetTimer(updates.shortBreakDuration * 60);
        }
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch {
      showNotice(t.settings.timer.saveError);
    }
  };

  const handleFocusChange = (val: number) => {
    const clamped = Math.max(1, Math.min(180, val));
    setFocusDuration(clamped);
    persistSettings({ focusDuration: clamped });
  };

  const handleBreakChange = (val: number) => {
    const clamped = Math.max(1, Math.min(60, val));
    setShortBreakDuration(clamped);
    persistSettings({ shortBreakDuration: clamped });
  };

  const handleToggleAutoBreak = (checked: boolean) => {
    setAutoStartBreaks(checked);
    localStorage.setItem("pomodo_auto_start_breaks", String(checked));
    persistSettings({ autoStartBreaks: checked });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("pomodo_settings_changed"));
    }
  };

  const handleToggleAutoFocus = (checked: boolean) => {
    setAutoStartFocus(checked);
    localStorage.setItem("pomodo_auto_start_focus", String(checked));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("pomodo_settings_changed"));
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 py-2 animate-in fade-in duration-150">
      {/* HEADER TIÊU ĐỀ KÈM TRẠNG THÁI TỰ ĐỘNG LƯU */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800/80">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {t.settings.timer.title}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.settings.timer.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isSaving ? (
            <span className="text-amber-500 animate-pulse text-[11px] font-mono">Đang lưu...</span>
          ) : savedSuccess ? (
            <span className="text-emerald-500 text-[11px] font-medium animate-in fade-in flex items-center gap-1">
              <Check size={13} strokeWidth={2.5} />
              Đã tự động lưu
            </span>
          ) : (
            <span className="text-neutral-400 text-[11px]">Tự động lưu thay đổi</span>
          )}
        </div>
      </div>

      {/* KHỐI 1: THỜI LƯỢNG TẬP TRUNG & NGHỈ NGƠI */}
      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t.settings.timer.sectionDuration}
        </h3>

        {/* Hàng 1: Tập trung */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Timer size={14} className="text-rose-500 shrink-0" />
              <span>{t.settings.timer.focus}</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.settings.timer.focusDesc}
            </div>
          </div>

          <DurationStepper
            value={focusDuration}
            min={1}
            max={180}
            unitLabel={t.settings.timer.minutes}
            onChange={handleFocusChange}
          />
        </div>

        {/* Hàng 2: Nghỉ ngơi */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Coffee size={14} className="text-teal-500 shrink-0" />
              <span>{t.settings.timer.break}</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.settings.timer.breakDesc}
            </div>
          </div>

          <DurationStepper
            value={shortBreakDuration}
            min={1}
            max={60}
            unitLabel={t.settings.timer.minutes}
            onChange={handleBreakChange}
          />
        </div>
      </div>

      {/* KHỐI 2: TỰ ĐỘNG CHUYỂN PHIÊN */}
      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {t.settings.timer.sectionAuto}
        </h3>

        {/* Tự động chuyển giờ nghỉ */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              {t.settings.timer.autoBreak}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.settings.timer.autoBreakDesc}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoStartBreaks}
              onChange={(e) => handleToggleAutoBreak(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Tự động bắt đầu phiên Focus tiếp theo */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              {t.settings.timer.autoFocus}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {t.settings.timer.autoFocusDesc}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoStartFocus}
              onChange={(e) => handleToggleAutoFocus(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
