"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, AlertTriangle, X } from "lucide-react";
import { AdminUserSummary } from "../../../types/admin";
import { adminService } from "../../../services/adminService";
import { UserFilterBar } from "../../../components/admin/UserFilterBar";
import { UserTable } from "../../../components/admin/UserTable";
import { UserEmailModal } from "../../../components/admin/UserEmailModal";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSuccessToast, setEmailSuccessToast] = useState<string | null>(null);
  const [isUnsuspendConfirmOpen, setIsUnsuspendConfirmOpen] = useState(false);

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendReasonError, setSuspendReasonError] = useState("");
  const [isBulkSuspending, setIsBulkSuspending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadUsers = useCallback(async () => {
    try {
      setIsUsersLoading(true);
      const isSuspendedParam = statusFilter === "all" ? undefined : statusFilter === "suspended";
      const res = await adminService.getUsers({
        search: debouncedSearch.trim() || undefined,
        isSuspended: isSuspendedParam,
        page,
        pageSize,
      });
      setUsers((res.items || []).filter((u) => !u.isAdmin));
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedUserIds(selectedUserIds.length === users.length ? [] : users.map((u) => u.id));
  };

  const handleSelectByCondition = (condition: "all" | "none" | "active" | "suspended") => {
    if (condition === "all") setSelectedUserIds(users.map((u) => u.id));
    else if (condition === "none") setSelectedUserIds([]);
    else if (condition === "active") setSelectedUserIds(users.filter((u) => !u.isSuspended).map((u) => u.id));
    else if (condition === "suspended") setSelectedUserIds(users.filter((u) => u.isSuspended).map((u) => u.id));
  };

  const handleBulkSuspend = () => {
    if (selectedUserIds.length === 0) return;
    setSuspendReason("");
    setSuspendReasonError("");
    setIsSuspendModalOpen(true);
  };

  const executeBulkSuspend = async () => {
    if (!suspendReason.trim()) {
      setSuspendReasonError("Vui lòng nhập lý do khóa tài khoản.");
      return;
    }
    try {
      setIsBulkSuspending(true);
      setIsUsersLoading(true);
      await Promise.allSettled(
        selectedUserIds.map((id) =>
          adminService.updateUserStatus(id, { isSuspended: true, reason: suspendReason.trim() })
        )
      );
      setSelectedUserIds([]);
      setIsSuspendModalOpen(false);
      setSuspendReason("");
      await loadUsers();
    } finally {
      setIsBulkSuspending(false);
      setIsUsersLoading(false);
    }
  };

  const executeBulkUnsuspend = async () => {
    try {
      setIsUsersLoading(true);
      await Promise.allSettled(
        selectedUserIds.map((id) => adminService.updateUserStatus(id, { isSuspended: false }))
      );
      setSelectedUserIds([]);
      await loadUsers();
      setIsUnsuspendConfirmOpen(false);
    } finally {
      setIsUsersLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <UserFilterBar
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        statusFilter={statusFilter} onStatusFilterChange={(st) => { setStatusFilter(st); setPage(1); }}
        onRefresh={loadUsers} isLoading={isUsersLoading}
      />

      {emailSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{emailSuccessToast}</span>
        </div>
      )}

      <UserTable
        users={users} totalCount={totalCount} currentPage={page} pageSize={pageSize}
        onPageChange={setPage} selectedUserIds={selectedUserIds}
        onToggleSelectUser={handleToggleSelectUser} onToggleSelectAll={handleToggleSelectAll}
        onSelectByCondition={handleSelectByCondition} onRefresh={loadUsers}
        onBulkSuspend={handleBulkSuspend}
        onBulkUnsuspend={() => selectedUserIds.length > 0 && setIsUnsuspendConfirmOpen(true)}
        onSendEmail={() => setIsEmailModalOpen(true)} isLoading={isUsersLoading}
      />

      <UserEmailModal
        isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)}
        selectedUsers={users.filter((u) => selectedUserIds.includes(u.id))}
        availableUsers={users}
        onSendSuccess={(msg) => {
          setEmailSuccessToast(msg);
          setTimeout(() => setEmailSuccessToast(null), 4000);
        }}
      />

      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={isBulkSuspending ? undefined : () => setIsSuspendModalOpen(false)} />
          <div
            role="dialog" aria-modal="true" aria-labelledby="bulk-suspend-title"
            className="relative z-10 w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 id="bulk-suspend-title" className="text-base font-bold text-neutral-900 dark:text-white">
                    Khóa {selectedUserIds.length} tài khoản đã chọn
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Nhập lý do khóa để lưu vào nhật ký kiểm toán hệ thống.
                  </p>
                </div>
              </div>
              <button
                type="button" onClick={() => setIsSuspendModalOpen(false)} disabled={isBulkSuspending}
                aria-label="Đóng" className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <textarea
                rows={3} autoFocus value={suspendReason}
                onChange={(e) => { setSuspendReason(e.target.value); if (suspendReasonError) setSuspendReasonError(""); }}
                placeholder="Nhập lý do khóa tài khoản (ví dụ: Vi phạm điều khoản sử dụng, spam...)"
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
              />
              {suspendReasonError && <p className="text-xs font-medium text-rose-500">{suspendReasonError}</p>}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button" onClick={() => setIsSuspendModalOpen(false)} disabled={isBulkSuspending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button" onClick={executeBulkSuspend} disabled={isBulkSuspending || !suspendReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50"
              >
                {isBulkSuspending ? "Đang xử lý..." : "Xác nhận khóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isUnsuspendConfirmOpen}
        title="Mở khóa tài khoản"
        message={`Bạn có chắc muốn mở khóa cho ${selectedUserIds.length} tài khoản đã chọn? Người dùng sẽ có thể đăng nhập lại bình thường.`}
        confirmText="Mở khóa ngay" cancelText="Hủy bỏ" danger={false}
        onConfirm={executeBulkUnsuspend} onCancel={() => setIsUnsuspendConfirmOpen(false)}
      />
    </div>
  );
}
