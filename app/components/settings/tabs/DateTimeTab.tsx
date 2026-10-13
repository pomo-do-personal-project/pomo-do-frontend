"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { usePomodoroStore } from "../../../stores/usePomodoroStore";
import { Button } from "../../ui/Button";
import { Sparkles, ArrowRight, Coffee, Palmtree, Timer } from "lucide-react";

interface DateTimeTabProps {
  showNotice: (message: string, icon?: React.ReactNode) => void;
}

export function DateTimeTab({ showNotice }: DateTimeTabProps) {
  const { settings, updateSettings, isSaving } = useSettingsStore();

  const [focusDuration, setFocusDuration] = useState(settings.focusDuration || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration || 15);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks || false);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [autoStartFocus, setAutoStartFocus] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFocusDuration(settings.focusDuration || 25);
    setShortBreakDuration(settings.shortBreakDuration || 5);
    setLongBreakDuration(settings.longBreakDuration || 15);
    setAutoStartBreaks(settings.autoStartBreaks || false);

    const savedInterval = localStorage.getItem("pomodo_long_break_interval");
    if (savedInterval !== null) setLongBreakInterval(Number(savedInterval));

    const savedAutoFocus = localStorage.getItem("pomodo_auto_start_focus");
    if (savedAutoFocus !== null) setAutoStartFocus(savedAutoFocus === "true");
  }, [settings]);

  // Tính toán thời gian thực theo số phút và số phiên đang nhập
  const totalFocusMinutes = longBreakInterval * focusDuration;
  const shortBreakCount = Math.max(0, longBreakInterval - 1);
  const totalShortBreakMinutes = shortBreakCount * shortBreakDuration;
  const totalCycleMinutes = totalFocusMinutes + totalShortBreakMinutes;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h}h ${m}m`;
  };

  const handleSaveTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        autoStartBreaks,
      });
      localStorage.setItem("pomodo_long_break_interval", String(longBreakInterval));
      localStorage.setItem("pomodo_auto_start_focus", String(autoStartFocus));

      // Đồng bộ ngay lập tức sang runtime Pomodoro Store khi đồng hồ đang ở trạng thái rảnh
      const pomo = usePomodoroStore.getState();
      if (!pomo.isRunning && pomo.elapsedSeconds === 0) {
        if (pomo.focusMode === "W") {
          pomo.resetTimer(focusDuration * 60);
        } else if (pomo.focusMode === "SB") {
          pomo.resetTimer(shortBreakDuration * 60);
        } else if (pomo.focusMode === "LB") {
          pomo.resetTimer(longBreakDuration * 60);
        }
      }

      setSavedSuccess(true);
      showNotice("Đã lưu cấu hình thời lượng Pomodoro thành công!");
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      showNotice("Không thể lưu cấu hình, vui lòng thử lại.");
    }
  };

  return (
    <form onSubmit={handleSaveTimer} className="max-w-xl mx-auto flex flex-col gap-5 py-2 animate-in fade-in duration-150">
      {/* HEADER TIÊU ĐỀ DATE & TIME */}
      <div className="pb-1 border-b border-neutral-200 dark:border-neutral-800/80">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Date & Time</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Cấu hình thời lượng tập trung, chu kỳ nghỉ dài và quy tắc tự động chuyển phiên
        </p>
      </div>

      {/* KHỐI 1: THỜI LƯỢNG CHU KỲ & CHU KỲ NGHỈ DÀI */}
      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Thời lượng chu kỳ Pomodoro & Chu kỳ nghỉ dài
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Focus */}
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/60 flex flex-col items-center shadow-xs">
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 text-center">
              Focus / 1 Pomo
            </span>
            <input
              type="number"
              min="1"
              max="180"
              value={focusDuration}
              onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center font-mono font-bold text-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg py-1 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
            />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">phút / Pomo</span>
          </div>

          {/* Short Break */}
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/60 flex flex-col items-center shadow-xs">
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Short Break</span>
            <input
              type="number"
              min="1"
              max="60"
              value={shortBreakDuration}
              onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center font-mono font-bold text-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg py-1 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
            />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">phút</span>
          </div>

          {/* Long Break */}
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/60 flex flex-col items-center shadow-xs">
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1.5">Long Break</span>
            <input
              type="number"
              min="1"
              max="60"
              value={longBreakDuration}
              onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center font-mono font-bold text-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg py-1 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
            />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">phút</span>
          </div>

          {/* 3. Long Break Interval */}
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-900/80 border border-amber-500/50 flex flex-col items-center relative shadow-xs">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1.5 text-center">
              Chu kỳ nghỉ dài
            </span>
            <input
              type="number"
              min="1"
              max="12"
              value={longBreakInterval}
              onChange={(e) => setLongBreakInterval(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              className="w-full text-center font-mono font-bold text-lg bg-neutral-100 dark:bg-neutral-800 border border-amber-300 dark:border-neutral-700 rounded-lg py-1 text-amber-600 dark:text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Pomo (phiên)</span>
          </div>
        </div>

        {/* Dynamic Timeline Preview & Explanation */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-neutral-900/70 border border-amber-200/80 dark:border-neutral-800 flex flex-col gap-2.5">
          <div className="text-[11px] text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
            <Sparkles size={14} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              Cứ sau mỗi <strong className="text-amber-700 dark:text-amber-300 font-bold">{longBreakInterval} Pomo</strong> (tương đương <strong className="text-neutral-900 dark:text-white font-bold">{formatMinutes(totalFocusMinutes)}</strong> tập trung, tổng chu kỳ <strong className="text-neutral-900 dark:text-white font-bold">~{formatMinutes(totalCycleMinutes)}</strong> gồm {shortBreakCount} lần nghỉ ngắn), hệ thống sẽ kích hoạt 1 lần nghỉ dài (<strong className="text-emerald-600 dark:text-emerald-400 font-bold">{longBreakDuration} phút</strong>).
            </div>
          </div>

          {/* Mini Visual Chain Flow */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono select-none">
            {Array.from({ length: longBreakInterval }).map((_, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold shadow-2xs flex items-center gap-1">
                  <Timer size={11} className="text-rose-500 shrink-0" />
                  <span>{focusDuration}m</span>
                </span>
                {idx < longBreakInterval - 1 && (
                  <>
                    <ArrowRight size={10} className="text-neutral-400 shrink-0" />
                    <span className="px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-medium flex items-center gap-1">
                      <Coffee size={11} className="text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{shortBreakDuration}m</span>
                    </span>
                    <ArrowRight size={10} className="text-neutral-400 shrink-0" />
                  </>
                )}
              </React.Fragment>
            ))}
            <ArrowRight size={10} className="text-neutral-400 shrink-0" />
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs flex items-center gap-1">
              <Palmtree size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Nghỉ dài {longBreakDuration}m</span>
            </span>
          </div>
        </div>
      </div>

      {/* KHỐI 2: TỰ ĐỘNG CHUYỂN PHIÊN */}
      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Tự động chuyển phiên (Automation)
        </h3>

        {/* Tự động chuyển giờ nghỉ */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">Tự động chuyển giờ nghỉ (Auto-start Breaks)</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Bắt đầu đếm giờ nghỉ ngay khi kết thúc phiên tập trung</div>
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
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">Tự động bắt đầu Focus tiếp theo (Auto-start Pomodoros)</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Tự động bắt đầu phiên làm việc mới ngay sau khi hết giờ nghỉ</div>
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
          {isSaving ? "Đang lưu..." : savedSuccess ? "✓ Đã lưu" : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}
