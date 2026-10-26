"use client";

import React from "react";
import { Search, Plus, Image, Bell, Waves, Filter, Palette } from "lucide-react";
import { AssetType } from "../../../types/asset";

interface AssetFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: "all" | AssetType;
  onTypeChange: (type: "all" | AssetType) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusChange: (status: "all" | "active" | "inactive") => void;
  onOpenCreateModal: () => void;
  onOpenThemeStudio?: () => void;
  onOpenAiStudio?: () => void;
}

export function AssetFilterBar({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  statusFilter,
  onStatusChange,
  onOpenCreateModal,
  onOpenThemeStudio,
  onOpenAiStudio,
}: AssetFilterBarProps) {
  const handleOpenStudio = onOpenThemeStudio || onOpenAiStudio;
  const typeTabs = [
    { id: "all", label: "Tất cả", icon: Filter },
    { id: "wallpaper", label: "Hình nền", icon: Image },
    { id: "audio_alarm", label: "Chuông báo", icon: Bell },
    { id: "audio_ambient", label: "Âm thanh môi trường", icon: Waves },
  ] as const;

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-[#18191c] p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
          {typeTabs.map((tab) => {
            const Icon = tab.icon;
            const active = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTypeChange(tab.id as "all" | AssetType)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Theme Studio & Add Manual */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {handleOpenStudio && (
            <button
              type="button"
              onClick={handleOpenStudio}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Palette size={15} />
              <span>Phối màu Theme 🎨</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm thủ công</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc hashtag (#Lofi, #Nature)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 text-xs self-end sm:self-auto">
          <span className="text-neutral-400 font-medium mr-1">Trạng thái:</span>
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {status === "all" ? "Tất cả" : status === "active" ? "Đang bật" : "Đã tắt"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
