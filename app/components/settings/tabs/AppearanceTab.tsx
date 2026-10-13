"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function AppearanceTab() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const handleToggleTheme = (mode: "light" | "dark") => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 py-2 animate-in fade-in duration-150">
      {/* HEADER TIÊU ĐỀ APPEARANCE */}
      <div className="pb-1 border-b border-neutral-200 dark:border-neutral-800/80">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Appearance</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Tùy chỉnh chủ đề giao diện hiển thị cho ứng dụng
        </p>
      </div>

      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm">
        <div>
          <div className="font-medium text-neutral-900 dark:text-white">Giao diện (Theme Mode)</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isDark ? "Đang sử dụng chế độ Tối (Dark)" : "Đang sử dụng chế độ Sáng (Light)"}
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/80 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => handleToggleTheme("light")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !isDark
                ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Sun size={14} />
            <span>Sáng</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleTheme("dark")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? "bg-neutral-800 text-white shadow-xs border border-neutral-700"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Moon size={14} />
            <span>Tối</span>
          </button>
        </div>
      </div>
    </div>
  );
}
