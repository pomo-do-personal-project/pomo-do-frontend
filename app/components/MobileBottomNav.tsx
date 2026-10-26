"use client";

import React from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Grid2X2,
  BarChart3,
  Settings,
} from "lucide-react";
import { useTranslation } from "../stores/useLanguageStore";
import { useSettingsStore } from "../stores/useSettingsStore";

interface MobileBottomNavProps {
  activeItem: string;
  onSelectItem: (id: string) => void;
  onOpenSettings: () => void;
}

export function MobileBottomNav({
  activeItem,
  onSelectItem,
  onOpenSettings,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);

  const isEn = t.nav.dashboard?.toLowerCase().includes("dashboard") || false;
  const navItems = [
    { id: "dashboard", label: "Focus", icon: LayoutDashboard },
    { id: "task", label: isEn ? "Tasks" : "Công việc", icon: CheckSquare },
    { id: "matrix", label: isEn ? "Matrix" : "Ma trận", icon: Grid2X2 },
    { id: "statistic", label: isEn ? "Stats" : "Thống kê", icon: BarChart3 },
    { id: "settings", label: isEn ? "Settings" : "Cài đặt", icon: Settings },
  ];

  return (
    <nav
      aria-label="Điều hướng chính di động"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t select-none transition-all duration-200 px-2 flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)] ${
        wallpaperUrl
          ? "bg-black/60 backdrop-blur-2xl border-white/15 text-white shadow-2xl"
          : "bg-white/95 backdrop-blur-xl border-neutral-200 text-neutral-800 shadow-lg"
      }`}
      style={{
        backgroundColor: wallpaperUrl ? undefined : "var(--surface-elevated, #ffffff)",
        borderColor: wallpaperUrl ? undefined : "var(--border-subtle, #e2e8f0)",
      }}
    >
      {navItems.map((item) => {
        const isActive = activeItem === item.id;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === "settings") {
                onOpenSettings();
              } else {
                onSelectItem(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-all duration-150 active:scale-95 ${
              isActive
                ? "font-bold"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              color: isActive
                ? "var(--accent-primary, #e26a45)"
                : wallpaperUrl
                ? "#ffffff"
                : "var(--text-muted, #64748b)",
            }}
          >
            <div className="relative">
              <IconComponent size={20} strokeWidth={isActive ? 2.3 : 1.75} />
              {isActive && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--accent-primary, #e26a45)" }}
                />
              )}
            </div>
            <span className="text-[10px] mt-1 truncate max-w-[72px] tracking-tight text-center">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
