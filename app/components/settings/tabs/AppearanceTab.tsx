"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useTranslation, Language, translations } from "../../../stores/useLanguageStore";

interface AppearanceTabProps {
  showNotice?: (message: string, icon?: React.ReactNode) => void;
}

export function AppearanceTab({ showNotice }: AppearanceTabProps) {
  const { t, language, setLanguage } = useTranslation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const handleToggleTheme = (mode: "light" | "dark") => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
      showNotice?.(t.settings.appearance.noticeThemeDark);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
      showNotice?.(t.settings.appearance.noticeThemeLight);
    }
  };

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

      {/* MỤC 1: CHỦ ĐỀ GIAO DIỆN (THEME) */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 sm:p-5 flex items-center justify-between text-sm">
        <div>
          <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sun size={15} className="text-amber-500" />
            <span>{t.settings.appearance.themeTitle}</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isDark ? t.settings.appearance.themeDarkDesc : t.settings.appearance.themeLightDesc}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-transparent dark:bg-transparent rounded-xl">
          <button
            type="button"
            onClick={() => handleToggleTheme("light")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !isDark
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40"
            }`}
          >
            <Sun size={14} />
            <span>{t.settings.appearance.light}</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleTheme("dark")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? "bg-neutral-700 text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40"
            }`}
          >
            <Moon size={14} />
            <span>{t.settings.appearance.dark}</span>
          </button>
        </div>
      </div>

      {/* MỤC 2: NGÔN NGỮ HIỂN THỊ (LANGUAGE) */}
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
