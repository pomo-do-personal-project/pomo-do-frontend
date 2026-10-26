"use client";

import React from "react";
import { Image, Bell, Waves } from "lucide-react";
import { AssetType } from "../../../types/asset";

interface AssetTypeSelectorProps {
  value: AssetType;
  onChange: (type: AssetType) => void;
}

export function AssetTypeSelector({ value, onChange }: AssetTypeSelectorProps) {
  const options = [
    { id: "wallpaper", label: "Hình nền", icon: Image },
    { id: "audio_alarm", label: "Chuông báo", icon: Bell },
    { id: "audio_ambient", label: "Âm môi trường", icon: Waves },
  ] as const;

  return (
    <div>
      <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
        Loại tài nguyên
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((item) => {
          const Icon = item.icon;
          const selected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id as AssetType)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                selected
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
