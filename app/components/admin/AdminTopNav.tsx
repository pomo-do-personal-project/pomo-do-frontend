"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslation } from "../../stores/useLanguageStore";

interface AdminTopNavProps {
  onMenuToggle?: () => void;
}

export function AdminTopNav({ onMenuToggle }: AdminTopNavProps) {
  const router = useRouter();
  const { language } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push(`/${language}/preview`);
    } catch (err: unknown) {
      console.error("Logout failed:", err);
      window.location.href = `/${language}/preview`;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "AD";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-[#121316]/80 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800 px-4 md:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label="Mở menu quản trị"
              className="lg:hidden p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Right: Admin Profile (Donezo Format: Photo + Name + Email) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 pl-1 py-1 pr-2 rounded-full select-none">
            <div className="w-8 h-8 rounded-full bg-[#0e3b2e] text-emerald-300 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shadow-2xs">
              {getInitials(user?.displayName, user?.email)}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                {user?.displayName || "Admin"}
              </span>
              <span className="text-[10px] text-neutral-400 leading-tight">
                {user?.email || "admin@pomo-do.com"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Đăng xuất"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
