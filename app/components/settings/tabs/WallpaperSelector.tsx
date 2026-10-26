"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Image, Check, Ban, Sparkles } from "lucide-react";
import { SystemAssetDto } from "../../../types/asset";
import { assetService } from "../../../services/assetService";
import { useSettingsStore } from "../../../stores/useSettingsStore";
import {
  extractThemeWithAi,
  applyHarmonizedColors,
} from "../../../lib/colorHarmonizer";
import { applyThemePalette, getActiveThemePalette } from "../../../lib/themeManager";
import { useTranslation } from "../../../stores/useLanguageStore";

interface WallpaperSelectorProps {
  showNotice?: (message: string, icon?: React.ReactNode) => void;
}

export function WallpaperSelector({ showNotice }: WallpaperSelectorProps) {
  const { language } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const [wallpapers, setWallpapers] = useState<SystemAssetDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    assetService
      .getActiveAssets("wallpaper")
      .then((res) => {
        if (isMounted) {
          setWallpapers(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load wallpapers:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectWallpaper = async (url: string | null, name: string) => {
    const success = await updateSettings({ wallpaperUrl: url });
    if (success) {
      if (url) {
        // Tự động trích xuất màu bằng Python AI (CIELAB K-Means++) & đồng bộ CSS
        const { palette } = await extractThemeWithAi(url);
        applyHarmonizedColors(palette);
      } else {
        // Khi bỏ hình nền, khôi phục lại bảng màu chủ đề đã chọn
        const currentPalette = getActiveThemePalette();
        applyThemePalette(currentPalette);
      }

      showNotice?.(
        url
          ? (language === "vi" ? `Đã đồng bộ hình nền & màu sắc: ${name}` : `Synced wallpaper & colors: ${name}`)
          : (language === "vi" ? "Đã chuyển về hình nền tối giản" : "Switched to minimal background"),
        <Sparkles size={16} className="text-amber-400" />
      );
    }
  };

  const categories = useMemo(() => {
    const list = [{ id: "all", label: language === "vi" ? "Tất cả" : "All" }];
    const labels: Record<string, string> = {
      "#cityseries": "City Series 🏙️",
      "#nature": language === "vi" ? "Thiên nhiên 🌲" : "Nature 🌲",
      "#lofi": "Lofi Cozy ☕",
      "#holiday": language === "vi" ? "Lễ hội 🎃" : "Holiday 🎃",
      "#cyberpunk": "Cyberpunk ⚡",
      "#minimal": language === "vi" ? "Tối giản 🍃" : "Minimal 🍃",
    };

    const added = new Set<string>();
    wallpapers.forEach((w) => {
      const cat = (w.category || "").trim();
      if (cat && !added.has(cat.toLowerCase())) {
        added.add(cat.toLowerCase());
        list.push({
          id: cat,
          label: labels[cat.toLowerCase()] || cat,
        });
      }
    });
    return list;
  }, [wallpapers, language]);

  const filteredWallpapers =
    selectedCategory === "all"
      ? wallpapers
      : wallpapers.filter(
          (w) => (w.category || "").trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        );

  return (
    <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Image size={15} className="text-emerald-500" />
            <span>{language === "vi" ? "Hình nền bàn làm việc" : "Workspace Wallpaper"}</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === "vi"
              ? "Lựa chọn không gian làm việc truyền cảm hứng từ Kho Tài Nguyên Hệ Thống."
              : "Choose an inspiring workspace background from the System Asset Library."}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                  : "bg-neutral-200/60 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-video rounded-xl bg-neutral-200 dark:bg-neutral-700/60 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {/* Default (No Wallpaper / Minimal) Option */}
          {selectedCategory === "all" && (
            <button
              type="button"
              onClick={() => handleSelectWallpaper(null, language === "vi" ? "Mặc định" : "Default")}
              className={`group relative aspect-video rounded-xl border flex flex-col items-center justify-center p-2 transition-all cursor-pointer overflow-hidden ${
                !settings.wallpaperUrl
                  ? "border-emerald-500 bg-white dark:bg-neutral-800 shadow-md ring-2 ring-emerald-500/30"
                  : "border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/40 hover:border-neutral-300"
              }`}
            >
              <Ban size={18} className="text-neutral-400 mb-1" />
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                {language === "vi" ? "Không dùng ảnh" : "No wallpaper"}
              </span>
              {!settings.wallpaperUrl && (
                <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </button>
          )}

          {/* Catalog Wallpapers */}
          {filteredWallpapers.map((wp) => {
            const isSelected = settings.wallpaperUrl === wp.url;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => handleSelectWallpaper(wp.url, wp.name)}
                className={`group relative aspect-video rounded-xl border transition-all cursor-pointer overflow-hidden text-left ${
                  isSelected
                    ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "border-neutral-200/80 dark:border-neutral-700/80 hover:border-neutral-400"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wp.thumbnailUrl || wp.url}
                  alt={wp.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                  <span className="text-[10px] font-semibold text-white leading-tight line-clamp-1 drop-shadow-xs">
                    {wp.name}
                  </span>
                  {wp.category && (
                    <span className="text-[9px] text-emerald-300 font-medium mt-0.5">
                      {wp.category}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
