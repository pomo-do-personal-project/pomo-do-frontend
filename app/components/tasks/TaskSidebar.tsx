"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TaskCategory } from "./types";
import { CalendarDays, FastForward, Zap, Calendar, LucideIcon, Plus } from "lucide-react";
import { useTagStore } from "../../stores/useTagStore";
import { TagManagerModal } from "./TagManagerModal";

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
  { id: "Today", label: "Hôm nay", icon: CalendarDays, color: "text-neutral-900 dark:text-white" },
  { id: "Upcoming", label: "Sắp tới", icon: FastForward, color: "text-blue-500" },
  { id: "QuickAdd", label: "Quick Add", icon: Zap, color: "text-amber-500 font-bold" },
  { id: "Calendar", label: "Lịch biểu", icon: Calendar, color: "text-neutral-400" },
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
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const { tags: storedTags, fetchTags } = useTagStore();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const displayTags = useMemo(() => {
    const list: { name: string; colorHex?: string }[] = storedTags.map((t) => ({
      name: t.name,
      colorHex: t.colorHex,
    }));
    allTags.forEach((name) => {
      if (!list.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        list.push({ name, colorHex: "#6366f1" });
      }
    });
    return list;
  }, [storedTags, allTags]);

  return (
    <>
      <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Danh mục
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
            Thẻ phân loại
          </h3>
          <button
            type="button"
            onClick={() => setIsTagManagerOpen(true)}
            title="Quản lý thẻ phân loại (Thêm, Sửa, Xóa)"
            className="p-1 px-2 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs hover:scale-105 active:scale-95"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Thêm thẻ</span>
          </button>
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

          {displayTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onSelectTag(tag.name)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                selectedTag === tag.name
                  ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
              }`}
            >
              <span
                style={{ backgroundColor: tag.colorHex || "#10B981" }}
                className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-2xs"
              />
              <span className="truncate flex-1">{tag.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        onSelectTag={onSelectTag}
      />
    </>
  );
}
