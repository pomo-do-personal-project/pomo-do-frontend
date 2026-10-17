"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";

interface UserFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "suspended";
  onStatusFilterChange: (status: "all" | "active" | "suspended") => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function UserFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isLoading = false,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 bg-white dark:bg-[#151619] rounded-2xl shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          size={16}
          strokeWidth={2}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo email hoặc họ tên người dùng..."
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-[#1C1D21] border-0 rounded-xl text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
        />
      </div>

      {/* Filter and Refresh */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#1C1D21] p-1 rounded-xl">
          <button
            onClick={() => onStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => onStatusFilterChange("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "active"
                ? "bg-[#0e3b2e] text-white shadow-xs font-bold"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Hoạt động
          </button>
          <button
            onClick={() => onStatusFilterChange("suspended")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === "suspended"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400"
            }`}
          >
            Đang khóa
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Tải lại danh sách"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-[#1C1D21] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={15} strokeWidth={2} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
