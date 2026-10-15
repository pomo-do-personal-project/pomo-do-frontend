"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCategory } from "./types";
import { useTranslation } from "../../stores/useLanguageStore";

interface TaskQuickAddProps {
  currentCategory: TaskCategory;
  onAddTask: (title: string) => Promise<void>;
}

export function TaskQuickAdd({ currentCategory, onAddTask }: TaskQuickAddProps) {
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
        className={`w-full mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl text-left cursor-pointer transition-all group shadow-2xs border-2 border-dashed ${
          currentCategory === "QuickAdd"
            ? "bg-amber-50/40 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border-amber-300 dark:border-amber-700"
            : "bg-neutral-100/50 hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-105 transition-transform ${
            currentCategory === "QuickAdd"
              ? "bg-amber-500 text-white"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          }`}
        >
          <Plus size={16} strokeWidth={2.2} />
        </span>
        <span
          className={`text-sm sm:text-base font-medium transition-colors ${
            currentCategory === "QuickAdd"
              ? "text-amber-800 dark:text-amber-300"
              : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200"
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
        className={`flex items-center gap-3 px-4 py-3 bg-transparent border-2 rounded-2xl shadow-2xs transition-colors ${
          currentCategory === "QuickAdd"
            ? "border-amber-500"
            : "border-neutral-900 dark:border-white"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
            currentCategory === "QuickAdd"
              ? "bg-amber-500 text-white"
              : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
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
          className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none font-medium"
        />
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-2 py-1 rounded cursor-pointer"
        >
          {t.overviewPanel.cancel}
        </button>
      </div>
    </form>
  );
}
