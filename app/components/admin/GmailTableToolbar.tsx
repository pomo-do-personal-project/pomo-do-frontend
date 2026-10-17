"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  MoreVertical,
  ChevronDown,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  SquarePen,
} from "lucide-react";
import { AdminUserSummary } from "../../types/admin";

interface GmailTableToolbarProps {
  users: AdminUserSummary[];
  selectedUserIds: string[];
  onToggleSelectAll: () => void;
  onSelectByCondition: (condition: "all" | "none" | "active" | "suspended") => void;
  onRefresh: () => void;
  isLoading?: boolean;
  onBulkSuspend?: () => void;
  onBulkUnsuspend?: () => void;
  onSendEmail?: () => void;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function GmailTableToolbar({
  users,
  selectedUserIds,
  onToggleSelectAll,
  onSelectByCondition,
  onRefresh,
  isLoading = false,
  onBulkSuspend,
  onBulkUnsuspend,
  onSendEmail,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}: GmailTableToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;
  const isPartiallySelected = selectedUserIds.length > 0 && !isAllSelected;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startRecord = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/60 bg-white dark:bg-[#151619] select-none text-neutral-600 dark:text-neutral-400">
      {/* Left Toolbar Icons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* 1. Master Checkbox + Dropdown Chevron (Gmail Style) */}
        <div ref={dropdownRef} className="relative inline-flex items-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <button
            type="button"
            onClick={onToggleSelectAll}
            title={isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            className="p-1.5 rounded-l-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 cursor-pointer flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-[4px] border border-neutral-400 dark:border-neutral-600 flex items-center justify-center transition-colors">
              {isAllSelected && <div className="w-2.5 h-2.5 bg-[#0e3b2e] dark:bg-emerald-400 rounded-[2px]" />}
              {isPartiallySelected && <div className="w-2 h-0.5 bg-[#0e3b2e] dark:bg-emerald-400" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Tùy chọn chọn dòng"
            className="p-1 pr-1.5 rounded-r-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 cursor-pointer text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <ChevronDown size={13} />
          </button>

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-[#1C1D21] rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 py-1 z-30 text-xs">
              <button
                type="button"
                onClick={() => { onSelectByCondition("all"); setIsDropdownOpen(false); }}
                className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => { onSelectByCondition("none"); setIsDropdownOpen(false); }}
                className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Không chọn
              </button>
              <button
                type="button"
                onClick={() => { onSelectByCondition("active"); setIsDropdownOpen(false); }}
                className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Đang hoạt động
              </button>
              <button
                type="button"
                onClick={() => { onSelectByCondition("suspended"); setIsDropdownOpen(false); }}
                className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Đang bị khóa
              </button>
            </div>
          )}
        </div>

        {/* 2. Refresh Icon (Gmail Style ↻) */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Làm mới"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <RotateCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>

        {/* 3. Action Icons when items are selected */}
        {selectedUserIds.length > 0 && (
          <>
            <div className="h-4 w-px bg-neutral-200 dark:border-neutral-800 mx-1" />
            <button
              type="button"
              onClick={onSendEmail}
              title={`Soạn gửi email cho ${selectedUserIds.length} người dùng đã chọn`}
              className="p-2 rounded-lg hover:bg-blue-500/10 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <SquarePen size={15} />
            </button>
            <button
              type="button"
              onClick={onBulkSuspend}
              title={`Khóa ${selectedUserIds.length} tài khoản đã chọn`}
              className="p-2 rounded-lg hover:bg-rose-500/10 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <UserX size={15} />
            </button>
            <button
              type="button"
              onClick={onBulkUnsuspend}
              title={`Mở khóa ${selectedUserIds.length} tài khoản đã chọn`}
              className="p-2 rounded-lg hover:bg-emerald-500/10 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <UserCheck size={15} />
            </button>
            <span className="text-[11px] font-medium text-neutral-400 px-1">
              ({selectedUserIds.length})
            </span>
          </>
        )}

        {/* 4. More Options Icon (Gmail Style ⋮) */}
        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            title="Thao tác khác"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <MoreVertical size={15} />
          </button>

          {isMoreOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#1C1D21] rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800 py-1 z-30 text-xs">
              <button
                type="button"
                onClick={() => { onSelectByCondition("none"); setIsMoreOpen(false); }}
                className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
              <button
                type="button"
                onClick={() => { onRefresh(); setIsMoreOpen(false); }}
                className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Tải lại danh sách
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Gmail Pagination (1-15 trên 50 < >) */}
      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          {startRecord} - {endRecord} trên {totalCount}
        </span>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            title="Trang trước"
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            title="Trang sau"
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
