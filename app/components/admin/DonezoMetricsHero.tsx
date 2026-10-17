"use client";

import React from "react";
import { ArrowUpRight, Users, UserCheck, Activity, ShieldAlert } from "lucide-react";
import { AdminMetrics } from "../../types/admin";

interface DonezoMetricsHeroProps {
  metrics: AdminMetrics | null;
  isLoading?: boolean;
}

export function DonezoMetricsHero({ metrics, isLoading = false }: DonezoMetricsHeroProps) {
  const totalUsers = metrics?.totalUsers ?? 0;
  const activeToday = metrics?.activeUsersToday ?? 0;
  const activeRate = metrics?.activeRatePercentage ?? 0;
  const suspended = metrics?.suspendedUsers ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Hero Card: Tổng Thành Viên (Donezo Forest Green Style) */}
      <div className="p-6 rounded-3xl bg-[#0e3b2e] text-white shadow-sm shadow-emerald-950/20 flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-200/90 tracking-wide uppercase">
            Tổng Thành Viên
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-4xl font-extrabold tracking-tight text-white">
            {isLoading ? "..." : totalUsers}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300/90">
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[10px]">
            Hệ thống
          </span>
          <span>Người dùng đăng ký</span>
        </div>
      </div>

      {/* 2. Hoạt Động Hôm Nay (DAU) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#151619] shadow-xs flex flex-col justify-between group hover:scale-[1.01] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
            Hoạt Động Hôm Nay
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCheck size={16} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {isLoading ? "..." : activeToday}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
            Trong ngày
          </span>
          <span>Chỉ số DAU hoạt động</span>
        </div>
      </div>

      {/* 3. Tỷ Lệ Gắn Bó (DAU / Total) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#151619] shadow-xs flex flex-col justify-between group hover:scale-[1.01] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
            Tỷ Lệ Gắn Bó
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={16} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {isLoading ? "..." : `${activeRate}%`}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
            Hiệu suất
          </span>
          <span>Tỷ lệ DAU trên tổng thành viên</span>
        </div>
      </div>

      {/* 4. Tài Khoản Bị Khóa */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#151619] shadow-xs flex flex-col justify-between group hover:scale-[1.01] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
            Tài Khoản Bị Khóa
          </span>
          <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldAlert size={16} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {isLoading ? "..." : suspended}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-[10px]">
            Bảo mật
          </span>
          <span>Vi phạm hoặc tạm khóa</span>
        </div>
      </div>
    </div>
  );
}
