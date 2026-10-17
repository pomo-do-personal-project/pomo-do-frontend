"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { AdminUserSummary } from "../../../types/admin";
import { adminService } from "../../../services/adminService";
import { UserFilterBar } from "../../../components/admin/UserFilterBar";
import { UserTable } from "../../../components/admin/UserTable";
import { UserEmailModal } from "../../../components/admin/UserEmailModal";

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
      const isSuspendedParam =
        statusFilter === "all" ? undefined : statusFilter === "suspended";

      const res = await adminService.getUsers({
        search: debouncedSearch.trim() || undefined,
        isSuspended: isSuspendedParam,
        page,
        pageSize,
      });

      const nonAdminUsers = (res.items || []).filter((u) => !u.isAdmin);
      setUsers(nonAdminUsers);
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

  // Selection handlers
  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((u) => u.id));
    }
  };

  const handleSelectByCondition = (condition: "all" | "none" | "active" | "suspended") => {
    if (condition === "all") {
      setSelectedUserIds(users.map((u) => u.id));
    } else if (condition === "none") {
      setSelectedUserIds([]);
    } else if (condition === "active") {
      setSelectedUserIds(users.filter((u) => !u.isSuspended).map((u) => u.id));
    } else if (condition === "suspended") {
      setSelectedUserIds(users.filter((u) => u.isSuspended).map((u) => u.id));
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUserIds.length === 0) return;
    const reason = prompt(`Nhập lý do khóa cho ${selectedUserIds.length} tài khoản đã chọn:`);
    if (!reason?.trim()) return;

    try {
      setIsUsersLoading(true);
      await Promise.allSettled(
        selectedUserIds.map((id) =>
          adminService.updateUserStatus(id, { isSuspended: true, reason: reason.trim() })
        )
      );
      setSelectedUserIds([]);
      await loadUsers();
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleBulkUnsuspend = async () => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Bạn có chắc muốn mở khóa cho ${selectedUserIds.length} tài khoản đã chọn?`)) {
      return;
    }

    try {
      setIsUsersLoading(true);
      await Promise.allSettled(
        selectedUserIds.map((id) =>
          adminService.updateUserStatus(id, { isSuspended: false })
        )
      );
      setSelectedUserIds([]);
      await loadUsers();
    } finally {
      setIsUsersLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* 2. Flat Filter Bar */}
      <UserFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        onRefresh={loadUsers}
        isLoading={isUsersLoading}
      />

      {emailSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{emailSuccessToast}</span>
        </div>
      )}

      {/* 3. Borderless User Table with Integrated Gmail Toolbar */}
      <UserTable
        users={users}
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        selectedUserIds={selectedUserIds}
        onToggleSelectUser={handleToggleSelectUser}
        onToggleSelectAll={handleToggleSelectAll}
        onSelectByCondition={handleSelectByCondition}
        onRefresh={loadUsers}
        onBulkSuspend={handleBulkSuspend}
        onBulkUnsuspend={handleBulkUnsuspend}
        onSendEmail={() => setIsEmailModalOpen(true)}
        isLoading={isUsersLoading}
      />

      {/* 4. Send Email Modal with exact Gmail Compose Box */}
      <UserEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        selectedUsers={users.filter((u) => selectedUserIds.includes(u.id))}
        availableUsers={users}
        onSendSuccess={(msg) => {
          setEmailSuccessToast(msg);
          setTimeout(() => setEmailSuccessToast(null), 4000);
        }}
      />
    </div>
  );
}
