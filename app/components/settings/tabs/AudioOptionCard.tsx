"use client";

import React from "react";
import { Play, Pause, Check } from "lucide-react";
import { SystemAssetDto } from "../../../types/asset";
import { useTranslation } from "../../../stores/useLanguageStore";

interface AudioOptionCardProps {
  asset: SystemAssetDto;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onTogglePlay: (e: React.MouseEvent) => void;
}

export function formatLocalizedAssetName(name: string, language: string): string {
  if (!name) return "";
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return language === "vi" ? match[1].trim() : match[2].trim();
  }
  if (language === "en") {
    if (name.includes("Chuông chùa Zen")) return "Zen Temple Bell";
    if (name.includes("Chuông điện tử")) return "Soft Digital Chime";
    if (name.includes("Tiếng chim rừng")) return "Morning Forest Birds";
  }
  return name;
}

export function AudioOptionCard({
  asset,
  isSelected,
  isPlaying,
  onSelect,
  onTogglePlay,
}: AudioOptionCardProps) {
  const { language } = useTranslation();
  const displayName = formatLocalizedAssetName(asset.name, language);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "border-emerald-500 bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-emerald-500/30"
          : "border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/40 hover:border-neutral-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isPlaying
              ? "bg-rose-500 text-white"
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-emerald-500 hover:text-white"
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
        </button>
        <div>
          <div className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
            <span>{displayName}</span>
            {asset.isDefault && (
              <span className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                {language === "vi" ? "Mặc định" : "Default"}
              </span>
            )}
          </div>
          {asset.category && (
            <span className="text-[10px] text-neutral-400">{asset.category}</span>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="p-1 rounded-full bg-emerald-500 text-white shadow-xs">
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}
