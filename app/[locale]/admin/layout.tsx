"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslation } from "../../stores/useLanguageStore";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { AdminTopNav } from "../../components/admin/AdminTopNav";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isNotificationDetail = Boolean(
    pathname?.includes("/admin/notifications/") &&
    pathname.split("/admin/notifications/")[1]?.length > 0
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const redirectUrl = pathname ? encodeURIComponent(pathname) : "";
      router.push(`/${language}?auth=signin${redirectUrl ? `&redirect=${redirectUrl}` : ""}`);
    }
  }, [mounted, isAuthenticated, pathname, language, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 text-xs gap-3">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-amber-500 rounded-full animate-spin" />
        <span>Đang kiểm tra quyền quản trị...</span>
      </div>
    );
  }

  // Client-side Guard: Đã đăng nhập nhưng không có đặc quyền IsAdmin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Truy cập bị từ chối
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
          Tài khoản <span className="font-semibold text-neutral-700 dark:text-neutral-300">{user?.email || "hiện tại"}</span> không có đặc quyền Quản trị viên. Vui lòng đăng nhập bằng tài khoản quản trị được cấp phép.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/${language}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:opacity-90 transition-all shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Quay lại Trang chủ</span>
          </Link>
          <button
            onClick={async () => {
              await logout();
              router.push(`/${language}?auth=signin`);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all shadow-xs cursor-pointer"
          >
            <LogIn size={14} />
            <span>Đổi tài khoản khác</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0C0D0E] text-neutral-900 dark:text-neutral-100 flex">
      {/* 1. Left Donezo Sidebar (Fixed) */}
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Viewport Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <AdminTopNav onMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main
          className={
            isNotificationDetail
              ? "flex-1 w-full flex flex-col p-0 m-0 overflow-y-auto"
              : "flex-1 p-4 md:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
