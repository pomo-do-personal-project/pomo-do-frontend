"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCategory } from "./types";
import { useTranslation } from "../../stores/useLanguageStore";
import { useSettingsStore } from "../../stores/useSettingsStore";

interface TaskQuickAddProps {
  currentCategory: TaskCategory;
  onAddTask: (title: string) => Promise<void>;
}

export function TaskQuickAdd({ currentCategory, onAddTask }: TaskQuickAddProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAddTask(title.trim());
    setTitle("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className={`w-full mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl text-left cursor-pointer transition-all group backdrop-blur-md border-2 border-dashed ${
          currentCategory === "QuickAdd"
            ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/50 text-amber-800 dark:text-white"
            : wallpaperUrl
            ? "bg-black/20 hover:bg-black/30 border-white/20 hover:border-white/40 text-white shadow-sm"
            : "bg-white hover:bg-neutral-50/90 border-neutral-300 hover:border-neutral-400 text-neutral-800 shadow-2xs"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-105 transition-transform ${
            currentCategory === "QuickAdd"
              ? "bg-amber-500 text-white shadow-xs"
              : wallpaperUrl
              ? "bg-white/20 text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          <Plus size={16} strokeWidth={2.2} />
        </span>
        <span
          className={`text-sm sm:text-base font-medium transition-colors ${
            wallpaperUrl
              ? "text-white/70 group-hover:text-white"
              : "text-neutral-500 group-hover:text-neutral-800"
          }`}
        >
          {currentCategory === "QuickAdd"
            ? t.overviewPanel.quickAddBtn
            : t.tasks.quickAddPlaceholder}
        </span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-colors border-2 ${
          currentCategory === "QuickAdd"
            ? "border-amber-400 bg-amber-500/10"
            : wallpaperUrl
            ? "bg-black/35 backdrop-blur-xl border-white/40"
            : "bg-white border-neutral-300 shadow-md"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            currentCategory === "QuickAdd"
              ? "bg-amber-500 text-white"
              : wallpaperUrl
              ? "bg-white/25 text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          <Plus size={16} strokeWidth={2.2} />
        </span>
        <input
          type="text"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            currentCategory === "QuickAdd"
              ? t.overviewPanel.quickAddInputPlaceholder
              : t.tasks.quickAddPlaceholder
          }
          className={`flex-1 bg-transparent text-sm sm:text-base focus:outline-none font-medium ${
            wallpaperUrl
              ? "text-white placeholder:text-white/50"
              : "text-neutral-900 placeholder:text-neutral-400"
          }`}
        />
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
          className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
            wallpaperUrl
              ? "text-white/60 hover:text-white"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          {t.overviewPanel.cancel}
        </button>
      </div>
    </form>
  );
}
