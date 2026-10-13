"use client";

import React from "react";
import { TaskCategory } from "./types";
import { CalendarDays, FastForward, Zap, Calendar, LucideIcon } from "lucide-react";

interface TaskSidebarProps {
  currentCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  categoryCounts: {
    Today: number;
    Upcoming: number;
    QuickAdd: number;
    Calendar: number;
  };
  allTags: string[];
  totalTasks: number;
}

const CATEGORY_ITEMS: {
  id: TaskCategory;
  label: string;
  icon: LucideIcon;
  color: string;
}[] = [
  { id: "Today", label: "Today", icon: CalendarDays, color: "text-neutral-900 dark:text-white" },
  { id: "Upcoming", label: "Upcoming", icon: FastForward, color: "text-blue-500" },
  { id: "QuickAdd", label: "Quick Add", icon: Zap, color: "text-amber-500 font-bold" },
  { id: "Calendar", label: "Calendar", icon: Calendar, color: "text-neutral-400" },
];

export function TaskSidebar({
  currentCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  categoryCounts,
  allTags,
  totalTasks,
}: TaskSidebarProps) {
  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between px-2 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Categories
        </h2>
      </div>

      <nav className="flex flex-col gap-1 mb-6">
        {CATEGORY_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentCategory === item.id;
          const count = categoryCounts[item.id] || 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? item.id === "QuickAdd"
                    ? "bg-amber-500 text-white font-bold shadow-xs"
                    : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <IconComponent size={16} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? "bg-black/20 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Tags / Custom Lists Filter */}
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Tags & Lists
        </h3>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
        <button
          onClick={() => onSelectTag("All")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
            selectedTag === "All"
              ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 shrink-0" />
          <span className="truncate">Tất cả ({totalTasks})</span>
        </button>

        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
              selectedTag === tag
                ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
            <span className="truncate">{tag}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
