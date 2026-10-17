"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, UserCheck, ShieldAlert } from "lucide-react";
import { AdminMetrics, AdminUserSummary } from "../../../types/admin";
import { adminService } from "../../../services/adminService";
import { DonezoMetricsHero } from "../../../components/admin/DonezoMetricsHero";
import { useTranslation } from "../../../stores/useLanguageStore";

export default function AdminDashboardPage() {
  const { language } = useTranslation();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [m, u] = await Promise.allSettled([
        adminService.getMetrics(),
        adminService.getUsers({ page: 1, pageSize: 6 }),
      ]);

      if (m.status === "fulfilled") setMetrics(m.value);
      if (u.status === "fulfilled") {
        setRecentUsers((u.value.items || []).filter((user) => !user.isAdmin));
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8">
      {/* 1. Header (Clean & Flat) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Tổng quan người dùng, mức độ tương tác và hoạt động trên nền tảng.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#151619] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 2. Donezo 4-Metric Hero Cards (No harsh borders) */}
      <DonezoMetricsHero metrics={metrics} isLoading={isLoading} />

      {/* 3. Recent Users Overview (Clean, Flat, Borderless) */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#151619] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Thành viên Mới Tham Gia
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Những tài khoản đăng ký gần đây nhất trên hệ thống
            </p>
          </div>

          <Link
            href={`/${language}/admin/users`}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Xem tất cả người dùng</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* User Table (Flat, No harsh borders) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
                <th className="py-2.5 px-3">Người dùng</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Ngày tham gia</th>
                <th className="py-2.5 px-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/40">
              {recentUsers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-400">
                    Chưa có thành viên nào.
                  </td>
                </tr>
              )}
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-[11px]">
                        {u.displayName?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {u.displayName || "Thành viên"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400">
                    {u.email}
                  </td>
                  <td className="py-3 px-3 text-neutral-500 dark:text-neutral-400">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.isSuspended
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {u.isSuspended ? "Đang khóa" : "Hoạt động"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
