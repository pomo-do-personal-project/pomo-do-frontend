"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useTranslation, Language, translations } from "../../../stores/useLanguageStore";

import { WallpaperSelector } from "./WallpaperSelector";
import { ThemeColorSelector } from "./ThemeColorSelector";

interface AppearanceTabProps {
  showNotice?: (message: string, icon?: React.ReactNode) => void;
}

export function AppearanceTab({ showNotice }: AppearanceTabProps) {
  const { t, language, setLanguage } = useTranslation();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/(vi|en)/, `/${lang}`);
      window.history.replaceState(null, "", newPath || `/${lang}`);
      document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
    if (lang === "vi") {
      showNotice?.(translations.vi.settings.appearance.noticeLangVi);
    } else {
      showNotice?.(translations.en.settings.appearance.noticeLangEn);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 py-2 animate-in fade-in duration-150">
      {/* HEADER TIÊU ĐỀ */}
      <div className="pb-1 border-b border-neutral-200 dark:border-neutral-800/80">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {t.settings.appearance.title}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {t.settings.appearance.subtitle}
        </p>
      </div>

      {/* MỤC 1: BẢNG MÀU CHỦ ĐỀ (THEME PALETTES - PHONG CÁCH TICKTICK) */}
      <ThemeColorSelector showNotice={showNotice} />

      {/* MỤC 2: HÌNH NỀN BÀN LÀM VIỆC (WALLPAPER CATALOG) */}
      <WallpaperSelector showNotice={showNotice} />

      {/* MỤC 3: NGÔN NGỮ HIỂN THỊ (LANGUAGE) */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 sm:p-5 flex items-center justify-between text-sm">
        <div>
          <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe size={15} className="text-blue-500" />
            <span>{t.settings.appearance.langTitle}</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.settings.appearance.langDesc}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-transparent dark:bg-transparent rounded-xl">
          <button
            type="button"
            onClick={() => handleSelectLanguage("vi")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              language === "vi"
                ? "bg-neutral-700 text-white dark:bg-neutral-700 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40"
            }`}
          >
            <span>Tiếng Việt</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectLanguage("en")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              language === "en"
                ? "bg-neutral-700 text-white dark:bg-neutral-700 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40"
            }`}
          >
            <span>English</span>
          </button>
        </div>
      </div>
    </div>
  );
}
