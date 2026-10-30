"use client";

import React from "react";
import { TaskCategory } from "./types";
import { CalendarDays, FastForward, Zap, Calendar, LucideIcon } from "lucide-react";

interface SidebarCategoryNavProps {
  currentCategory: TaskCategory;
  categoryCounts: {
    Today: number;
    Upcoming: number;
    QuickAdd: number;
    Calendar: number;
  };
  wallpaperUrl?: string | null;
  onSelectCategory: (cat: TaskCategory) => void;
}

const CATEGORY_ITEMS: {
  id: TaskCategory;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "Today", label: "Hôm nay", icon: CalendarDays },
  { id: "Upcoming", label: "Sắp tới", icon: FastForward },
  { id: "QuickAdd", label: "Quick Add", icon: Zap },
  { id: "Calendar", label: "Lịch biểu", icon: Calendar },
];

export function SidebarCategoryNav({
  currentCategory,
  categoryCounts,
  wallpaperUrl,
  onSelectCategory,
}: SidebarCategoryNavProps) {
  return (
    <nav className="flex flex-col gap-1 mb-6">
      {CATEGORY_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentCategory === item.id;
        const count = categoryCounts[item.id] || 0;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectCategory(item.id)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
              isActive
                ? item.id === "QuickAdd"
                  ? "bg-amber-500 text-white font-bold shadow-md ring-1 ring-amber-400/50"
                  : wallpaperUrl
                  ? "bg-white/20 text-white font-semibold shadow-xs backdrop-blur-md ring-1 ring-white/25"
                  : "bg-white text-neutral-900 font-semibold shadow-xs border border-neutral-200/80"
                : wallpaperUrl
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <IconComponent size={16} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                isActive
                  ? wallpaperUrl
                    ? "bg-black/20 text-white"
                    : "bg-neutral-100 text-neutral-700 font-bold"
                  : wallpaperUrl
                  ? "bg-white/10 text-white/70"
                  : "bg-neutral-200/60 text-neutral-600"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

