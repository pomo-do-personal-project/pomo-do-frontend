"use client";

import React from "react";
import Link from "next/link";
import { AdminUserSummary } from "../../types/admin";
import { useTranslation } from "../../stores/useLanguageStore";
import { GmailTableToolbar } from "./GmailTableToolbar";

interface UserTableProps {
  users: AdminUserSummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  selectedUserIds?: string[];
  onToggleSelectUser?: (userId: string) => void;
  onToggleSelectAll?: () => void;
  onSelectByCondition?: (condition: "all" | "none" | "active" | "suspended") => void;
  onRefresh?: () => void;
  onBulkSuspend?: () => void;
  onBulkUnsuspend?: () => void;
  onSendEmail?: () => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  selectedUserIds = [],
  onToggleSelectUser,
  onToggleSelectAll,
  onSelectByCondition,
  onRefresh,
  onBulkSuspend,
  onBulkUnsuspend,
  onSendEmail,
  isLoading = false,
}: UserTableProps) {
  const { language } = useTranslation();

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa có";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-[#151619] rounded-3xl overflow-hidden shadow-xs">
      {/* 1. Gmail Style Top Action Toolbar ([ ] ▾  ↻  ⋮) */}
      <GmailTableToolbar
        users={users}
        selectedUserIds={selectedUserIds}
        onToggleSelectAll={onToggleSelectAll || (() => {})}
        onSelectByCondition={onSelectByCondition || (() => {})}
        onRefresh={onRefresh || (() => {})}
        isLoading={isLoading}
        onBulkSuspend={onBulkSuspend}
        onBulkUnsuspend={onBulkUnsuspend}
        onSendEmail={onSendEmail}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />

      {/* 2. User Table List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
              <th className="py-3 px-4 w-10"></th>
              <th className="py-3 px-3">Người dùng</th>
              <th className="py-3 px-4">Ngày tham gia</th>
              <th className="py-3 px-4">Hoạt động gần nhất</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-5 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40 text-neutral-900 dark:text-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const initials = user.displayName
                  ? user.displayName.slice(0, 2).toUpperCase()
                  : user.email.slice(0, 2).toUpperCase();
                const isSelected = selectedUserIds.includes(user.id);

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-neutral-100/80 dark:bg-neutral-800/50"
                        : "hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    {/* Checkbox vuông từng dòng */}
                    <td className="py-3.5 px-4 w-10">
                      <button
                        type="button"
                        onClick={() => onToggleSelectUser && onToggleSelectUser(user.id)}
                        aria-label={`Chọn ${user.displayName || user.email}`}
                        className="w-4 h-4 rounded-[4px] border border-neutral-400 dark:border-neutral-600 flex items-center justify-center cursor-pointer transition-colors hover:border-neutral-600 dark:hover:border-neutral-400"
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 bg-[#0e3b2e] dark:bg-emerald-400 rounded-[2px]" />
                        )}
                      </button>
                    </td>

                    {/* User Identity */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 dark:text-white truncate block">
                            {user.displayName || "Chưa đặt tên"}
                          </span>
                          <span className="text-neutral-400 text-[11px] block truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Join Date */}
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {formatDateTime(user.lastActiveAt)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        href={`/${language}/admin/users/${user.id}`}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-[#1C1D21] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all inline-block cursor-pointer"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
