"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { usePomodoroStore } from "../../../stores/usePomodoroStore";
import { Button } from "../../ui/Button";
import { Timer, Coffee, ChevronUp, ChevronDown } from "lucide-react";

import { useTranslation } from "../../../stores/useLanguageStore";

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
    setAutoStartBreaks(settings.autoStartBreaks || false);

    const savedAutoFocus = localStorage.getItem("pomodo_auto_start_focus");
    if (savedAutoFocus !== null) setAutoStartFocus(savedAutoFocus === "true");
  }, [settings]);

  const handleSaveTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        focusDuration,
        shortBreakDuration,
        longBreakDuration: settings.longBreakDuration || 15,
        autoStartBreaks,
      });
      localStorage.setItem("pomodo_auto_start_focus", String(autoStartFocus));

      // Đồng bộ ngay lập tức sang runtime Pomodoro Store khi đồng hồ đang ở trạng thái rảnh
      const pomo = usePomodoroStore.getState();
      if (!pomo.isRunning && pomo.elapsedSeconds === 0) {
        if (pomo.focusMode === "W") {
          pomo.resetTimer(focusDuration * 60);
        } else {
          pomo.resetTimer(shortBreakDuration * 60);
        }
      }

      setSavedSuccess(true);
      showNotice(t.settings.timer.saved);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      showNotice(t.settings.timer.saveError);
    }
  };

  return (
    <form onSubmit={handleSaveTimer} className="max-w-xl mx-auto flex flex-col gap-5 py-2 animate-in fade-in duration-150">
      {/* HEADER TIÊU ĐỀ */}
      <div className="pb-1 border-b border-neutral-200 dark:border-neutral-800/80">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {t.settings.timer.title}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t.settings.timer.subtitle}
        </p>
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

          <div className="relative group flex items-center gap-1 py-1 px-1.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors">
            <input
              type="number"
              min="1"
              max="180"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 text-right font-mono font-bold text-sm bg-transparent border-none text-neutral-900 dark:text-white focus:outline-none p-0 select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            {/* Nút lên / xuống cùng màu nền, chỉ hiện khi di chuột vào */}
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={() => setFocusDuration((prev) => Math.min(180, prev + 1))}
                className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent transition-colors cursor-pointer leading-none"
                title="+1 min"
                aria-label="+1 min"
              >
                <ChevronUp size={11} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setFocusDuration((prev) => Math.max(1, prev - 1))}
                className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent transition-colors cursor-pointer leading-none"
                title="-1 min"
                aria-label="-1 min"
              >
                <ChevronDown size={11} strokeWidth={2.5} />
              </button>
            </div>

            <span className="text-xs text-neutral-500 dark:text-neutral-400 select-none">
              {t.settings.timer.minutes}
            </span>
          </div>
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

          <div className="relative group flex items-center gap-1 py-1 px-1.5 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50 transition-colors">
            <input
              type="number"
              min="1"
              max="60"
              value={shortBreakDuration}
              onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-10 text-right font-mono font-bold text-sm bg-transparent border-none text-neutral-900 dark:text-white focus:outline-none p-0 select-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            {/* Nút lên / xuống cùng màu nền, chỉ hiện khi di chuột vào */}
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={() => setShortBreakDuration((prev) => Math.min(60, prev + 1))}
                className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent transition-colors cursor-pointer leading-none"
                title="+1 min"
                aria-label="+1 min"
              >
                <ChevronUp size={11} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setShortBreakDuration((prev) => Math.max(1, prev - 1))}
                className="p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-transparent transition-colors cursor-pointer leading-none"
                title="-1 min"
                aria-label="-1 min"
              >
                <ChevronDown size={11} strokeWidth={2.5} />
              </button>
            </div>

            <span className="text-xs text-neutral-500 dark:text-neutral-400 select-none">
              {t.settings.timer.minutes}
            </span>
          </div>
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
              onChange={(e) => setAutoStartBreaks(e.target.checked)}
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
              onChange={(e) => setAutoStartFocus(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSaving}
          className="min-w-[100px] bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold shadow-xs"
        >
          {isSaving ? t.settings.timer.saving : savedSuccess ? `✓ ${t.settings.timer.saved}` : t.settings.timer.save}
        </Button>
      </div>
    </form>
  );
}
