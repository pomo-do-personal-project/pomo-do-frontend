"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Star,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Bell,
  Waves,
} from "lucide-react";
import { SystemAssetDto } from "../../../types/asset";

interface AssetCardProps {
  asset: SystemAssetDto;
  onEdit: (asset: SystemAssetDto) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AssetCard({
  asset,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
}: AssetCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayAudio = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err: unknown) {
        console.warn("Audio playback unsupported or blocked:", err);
        setIsPlaying(false);
      }
    }
  };

  const isAudio = asset.assetType === "audio_alarm" || asset.assetType === "audio_ambient";

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-[#18191c] ${
        asset.isActive
          ? "border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/50 hover:shadow-md"
          : "border-neutral-200/40 dark:border-neutral-800/40 opacity-60 hover:opacity-100"
      }`}
    >
      {/* Visual / Audio Preview Header */}
      <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-900 overflow-hidden flex items-center justify-center">
        {asset.assetType === "wallpaper" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full p-4 bg-linear-to-br from-emerald-500/10 to-teal-500/10">
            <audio
              ref={audioRef}
              src={asset.url}
              onEnded={() => setIsPlaying(false)}
              onError={() => setIsPlaying(false)}
              preload="none"
            />
            <button
              type="button"
              onClick={togglePlayAudio}
              className={`p-3.5 rounded-full shadow-md transition-all cursor-pointer ${
                isPlaying
                  ? "bg-rose-500 text-white scale-105"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105"
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
            </button>
            <span className="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
              {asset.assetType === "audio_alarm" ? <Bell size={12} /> : <Waves size={12} />}
              {isPlaying ? "Đang nghe thử..." : "Bấm để nghe thử"}
            </span>
          </div>
        )}

        {/* Default Badge */}
        {asset.isDefault && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs">
            <Star size={11} className="fill-white" />
            <span>Mặc định</span>
          </div>
        )}

        {/* Quick Type Icon */}
        <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-black/40 backdrop-blur-xs text-white">
          {asset.assetType === "wallpaper" ? (
            <ImageIcon size={13} />
          ) : asset.assetType === "audio_alarm" ? (
            <Bell size={13} />
          ) : (
            <Waves size={13} />
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
              {asset.name}
            </h4>
          </div>
          {asset.category && (
            <span className="inline-block mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
              {asset.category}
            </span>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={asset.isDefault ? "Tài nguyên mặc định" : "Đặt làm mặc định"}
              onClick={() => onSetDefault(asset.id)}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                asset.isDefault
                  ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                  : "text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Star size={14} className={asset.isDefault ? "fill-amber-500" : ""} />
            </button>

            <button
              type="button"
              title={asset.isActive ? "Tắt kích hoạt" : "Bật kích hoạt"}
              onClick={() => onToggleActive(asset.id)}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                asset.isActive
                  ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {asset.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Chỉnh sửa"
              onClick={() => onEdit(asset)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              title="Xóa tài nguyên"
              onClick={() => onDelete(asset.id)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
