"use client";

import React, { useState, useEffect } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { ThemePalette } from "../../../types/theme";
import { getPaletteDisplayName } from "../../../constants/themePalettes";
import { applyThemePalette, getActiveThemePalette } from "../../../lib/themeManager";
import { useTranslation } from "../../../stores/useLanguageStore";
import { usePaletteStore } from "../../../stores/usePaletteStore";

interface ThemeColorSelectorProps {
  showNotice?: (message: string, icon?: React.ReactNode) => void;
}

export function ThemeColorSelector({ showNotice }: ThemeColorSelectorProps) {
  const { language } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>("terracotta");
  const palettes = usePaletteStore((s) => s.palettes);
  const activePalettes = palettes.filter((p) => p.isActive !== false);

  useEffect(() => {
    const current = getActiveThemePalette();
    if (current) {
      setSelectedId(current.id);
    }
  }, []);

  const handleSelectPalette = (palette: ThemePalette) => {
    setSelectedId(palette.id);
    applyThemePalette(palette);
    const displayName = getPaletteDisplayName(palette, language);
    showNotice?.(
      language === "vi"
        ? `Đã chuyển sang bảng màu: ${displayName}`
        : `Switched to palette: ${displayName}`,
      <Sparkles size={16} className="text-amber-400" />
    );
  };

  return (
    <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2 text-sm">
            <Palette size={16} className="text-indigo-500" />
            <span>{language === "vi" ? "Bảng màu chủ đề" : "Theme Palette"}</span>
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 mt-0.5">
            {language === "vi"
              ? "Chọn tông màu giao diện chuẩn 60-30-10 từ bộ sưu tập Designer Freelance để làm việc tập trung."
              : "Choose a 60-30-10 interface color scheme from the Designer Freelance collection for focused work."}
          </div>
        </div>
      </div>

      {/* Grid of Color Swatches */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {activePalettes.map((palette) => {
          const isSelected = selectedId === palette.id;
          const displayName = getPaletteDisplayName(palette, language);
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => handleSelectPalette(palette)}
              className="group flex flex-col items-center gap-1.5 cursor-pointer text-center focus:outline-hidden"
              title={displayName}
            >
              {/* Swatch Pill showing surfaceBg + accentPrimary dot */}
              <div
                className={`relative w-full aspect-16/10 rounded-xl border transition-all duration-200 flex items-center justify-center shadow-2xs group-hover:-translate-y-0.5 overflow-hidden ${
                  isSelected
                    ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-neutral-100 dark:ring-offset-[#262626] border-transparent scale-102"
                    : "border-black/10 dark:border-white/10 group-hover:border-black/30 dark:group-hover:border-white/30"
                }`}
                style={{ backgroundColor: palette.colors.surfaceBg }}
              >
                {/* 10% Accent Dot */}
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-xs border border-white/20"
                  style={{ backgroundColor: palette.colors.accentPrimary }}
                  title={language === "vi" ? `Nút bấm Accent: ${palette.colors.accentPrimary}` : `Accent button: ${palette.colors.accentPrimary}`}
                />

                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Swatch Label */}
              <span
                className={`text-[11px] truncate max-w-full font-medium transition-colors ${
                  isSelected
                    ? "text-neutral-900 dark:text-white font-semibold"
                    : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
                }`}
              >
                {displayName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
