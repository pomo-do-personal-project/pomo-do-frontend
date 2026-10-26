"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Waves, Check } from "lucide-react";
import { SystemAssetDto } from "../../../types/asset";
import { assetService } from "../../../services/assetService";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useTranslation } from "../../../stores/useLanguageStore";
import { AudioOptionCard, formatLocalizedAssetName } from "./AudioOptionCard";

interface SoundTabProps {
  showNotice?: (message: string, icon?: React.ReactNode) => void;
}

export function SoundTab({ showNotice }: SoundTabProps) {
  const { language } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const [alarms, setAlarms] = useState<SystemAssetDto[]>([]);
  const [ambients, setAmbients] = useState<SystemAssetDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Audio preview state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      assetService.getActiveAssets("audio_alarm"),
      assetService.getActiveAssets("audio_ambient"),
    ])
      .then(([alarmsRes, ambientsRes]) => {
        if (isMounted) {
          setAlarms(alarmsRes);
          setAmbients(ambientsRes);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load audio assets:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handleTogglePreview = (id: string, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => setPlayingId(null);
      audio.play().then(() => setPlayingId(id)).catch((err) => {
        console.warn("Audio preview blocked or failed:", err);
        setPlayingId(null);
      });
    }
  };

  const handleSelectAlarm = async (url: string, name: string) => {
    const success = await updateSettings({ alarmSoundUrl: url });
    if (success) {
      const localizedName = formatLocalizedAssetName(name, language);
      showNotice?.(
        language === "vi" ? `Đã chọn chuông báo: ${localizedName}` : `Selected alarm: ${localizedName}`,
        <Bell size={16} />
      );
    }
  };

  const handleSelectAmbient = async (url: string | null, name: string) => {
    const success = await updateSettings({ ambientSoundUrl: url });
    if (success) {
      const localizedName = formatLocalizedAssetName(name, language);
      showNotice?.(
        url
          ? (language === "vi" ? `Đã chọn âm môi trường: ${localizedName}` : `Selected ambient sound: ${localizedName}`)
          : (language === "vi" ? "Đã tắt âm môi trường" : "Muted ambient sound"),
        <Waves size={16} />
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 py-2 animate-in fade-in duration-150 text-xs">
      {/* Header */}
      <div className="pb-1 border-b border-neutral-200 dark:border-neutral-800/80">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {language === "vi" ? "Âm thanh & Chuông báo" : "Sounds & Alerts"}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
          {language === "vi"
            ? "Cá nhân hóa âm thanh chuông báo kết thúc phiên Pomodoro và âm thanh môi trường tĩnh lặng."
            : "Customize completion chimes and tranquil ambient background sounds."}
        </p>
      </div>

      {/* SECTION 1: CHUÔNG BÁO HOÀN THÀNH PHIÊN */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-amber-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
            {language === "vi" ? "Chuông báo kết thúc phiên" : "Session Alarm Chimes"}
          </h3>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400">
          {language === "vi"
            ? "Chọn âm thanh chuông ngân nga dịu êm nhắc nhở bạn nghỉ ngơi hoặc quay lại bàn làm việc."
            : "Choose a gentle chime to remind you to take a break or return to work."}
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-700/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {alarms.map((alarm) => (
              <AudioOptionCard
                key={alarm.id}
                asset={alarm}
                isSelected={settings.alarmSoundUrl === alarm.url || (!settings.alarmSoundUrl && alarm.isDefault)}
                isPlaying={playingId === alarm.id}
                onSelect={() => handleSelectAlarm(alarm.url, alarm.name)}
                onTogglePlay={(e) => {
                  e.stopPropagation();
                  handleTogglePreview(alarm.id, alarm.url);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ÂM THANH MÔI TRƯỜNG NỀN */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Waves size={16} className="text-teal-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
            {language === "vi" ? "Âm thanh môi trường tập trung" : "Focus Ambient Sounds"}
          </h3>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400">
          {language === "vi"
            ? "Âm thanh thiên nhiên hoặc quán cafe phát liên tục giúp bạn cách ly tiếng ồn và tập trung sâu."
            : "Continuous nature or cafe sounds to block background noise and enhance deep focus."}
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-700/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div
              onClick={() => handleSelectAmbient(null, language === "vi" ? "Tắt" : "Mute")}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                !settings.ambientSoundUrl
                  ? "border-emerald-500 bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-emerald-500/30"
                  : "border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/40 hover:border-neutral-300"
              }`}
            >
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {language === "vi" ? "Không phát âm thanh môi trường" : "No ambient sound"}
              </span>
              {!settings.ambientSoundUrl && (
                <div className="p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>

            {ambients.map((ambient) => (
              <AudioOptionCard
                key={ambient.id}
                asset={ambient}
                isSelected={settings.ambientSoundUrl === ambient.url}
                isPlaying={playingId === ambient.id}
                onSelect={() => handleSelectAmbient(ambient.url, ambient.name)}
                onTogglePlay={(e) => {
                  e.stopPropagation();
                  handleTogglePreview(ambient.id, ambient.url);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
