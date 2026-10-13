"use client";

import React from "react";
import { RingtoneType } from "../hooks/useSettingsAudio";
import { Volume2, VolumeX, Play, Briefcase, Coffee } from "lucide-react";

interface NotificationSoundCardProps {
  soundEnabled: boolean;
  soundVolume: number;
  focusRingtone: RingtoneType;
  breakRingtone: RingtoneType;
  onToggleSound: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onSelectFocusRingtone: (ringtone: RingtoneType) => void;
  onSelectBreakRingtone: (ringtone: RingtoneType) => void;
  onPlayRingtone: (type: RingtoneType, volume: number) => void;
}

export function NotificationSoundCard({
  soundEnabled,
  soundVolume,
  focusRingtone,
  breakRingtone,
  onToggleSound,
  onVolumeChange,
  onSelectFocusRingtone,
  onSelectBreakRingtone,
  onPlayRingtone,
}: NotificationSoundCardProps) {
  return (
    <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-5">
      {/* Sound Enabled Switch */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Volume2 size={16} className="text-neutral-500 dark:text-neutral-300" />
            <span>Âm thanh chuông báo kết thúc phiên</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Phát chuông thông báo khi hoàn thành phiên Pomodoro hoặc hết giờ nghỉ
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onToggleSound(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {soundEnabled && (
        <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80 flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Master Volume */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 font-medium mb-1.5">
              <span>Âm lượng chuông thông báo:</span>
              <span className="font-mono text-neutral-900 dark:text-white font-bold">{soundVolume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onVolumeChange(soundVolume === 0 ? 80 : 0)}
                aria-label={soundVolume === 0 ? "Bật chuông thông báo" : "Tắt chuông thông báo"}
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {soundVolume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                onMouseUp={() => onPlayRingtone(focusRingtone, soundVolume)}
                onTouchEnd={() => onPlayRingtone(focusRingtone, soundVolume)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Focus Ringtone */}
          <div>
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-amber-500 dark:text-amber-400" />
                <span>Chuông hoàn thành Focus (Làm việc):</span>
              </span>
              <button
                type="button"
                onClick={() => onPlayRingtone(focusRingtone, soundVolume)}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200 dark:border-transparent"
              >
                <Play size={11} fill="currentColor" />
                <span>Nghe thử Focus</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "bell", label: "Classic Bell", icon: "🔔" },
                { id: "zen", label: "Zen Bowl", icon: "🧘" },
                { id: "digital", label: "Digital Beep", icon: "⚡" },
                { id: "marimba", label: "Soft Marimba", icon: "🎶" },
              ].map((r) => {
                const isSelected = focusRingtone === r.id;
                return (
                  <button
                    key={`focus-${r.id}`}
                    type="button"
                    onClick={() => {
                      onSelectFocusRingtone(r.id as RingtoneType);
                      onPlayRingtone(r.id as RingtoneType, soundVolume);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-neutral-900 dark:text-white dark:bg-neutral-800 dark:border-amber-500/60 shadow-xs"
                        : "bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="text-xs font-semibold truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Break Ringtone */}
          <div>
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coffee size={14} className="text-teal-500 dark:text-teal-400" />
                <span>Chuông hết giờ nghỉ (Quay lại làm):</span>
              </span>
              <button
                type="button"
                onClick={() => onPlayRingtone(breakRingtone, soundVolume)}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200 dark:border-transparent"
              >
                <Play size={11} fill="currentColor" />
                <span>Nghe thử Break</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "bell", label: "Classic Bell", icon: "🔔" },
                { id: "zen", label: "Zen Bowl", icon: "🧘" },
                { id: "digital", label: "Digital Beep", icon: "⚡" },
                { id: "marimba", label: "Soft Marimba", icon: "🎶" },
              ].map((r) => {
                const isSelected = breakRingtone === r.id;
                return (
                  <button
                    key={`break-${r.id}`}
                    type="button"
                    onClick={() => {
                      onSelectBreakRingtone(r.id as RingtoneType);
                      onPlayRingtone(r.id as RingtoneType, soundVolume);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-teal-500/10 border-teal-500 text-neutral-900 dark:text-white dark:bg-neutral-800 dark:border-teal-500/60 shadow-xs"
                        : "bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="text-xs font-semibold truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
