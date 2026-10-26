"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";
import { useTranslation } from "../../stores/useLanguageStore";
import { useAuthStore } from "../../stores/useAuthStore";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const { language } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push(`/${language}`);
    } catch (err: unknown) {
      console.error("Logout failed:", err);
      window.location.href = `/${language}`;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/${language}/admin/dashboard`,
    },
    {
      label: "Người dùng",
      icon: Users,
      href: `/${language}/admin/users`,
    },
    {
      label: "Thông báo",
      icon: Bell,
      href: `/${language}/admin/notifications`,
    },
    {
      label: "Kho tài nguyên",
      icon: Sparkles,
      href: `/${language}/admin/assets`,
    },
  ];

  const isLinkActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#121316] border-r border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header: Pomo-do Content Management System (Không icon) */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <Link
              href={`/${language}/admin/dashboard`}
              className="flex flex-col group select-none"
            >
              <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white block leading-tight group-hover:text-emerald-500 transition-colors">
                Pomo-do
              </span>
              <span className="text-[11px] text-neutral-400 font-medium tracking-tight mt-0.5">
                Content Management System
              </span>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div className="space-y-1.5">
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Menu
            </span>
            <div className="mt-2 space-y-1">
              {menuItems.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#0e3b2e] text-white shadow-xs font-bold"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-emerald-400" : "text-neutral-400"}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: Logout */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group cursor-pointer disabled:opacity-50"
          >
            <LogOut
              size={15}
              className="text-rose-500 dark:text-rose-400 group-hover:scale-105 transition-transform"
            />
            <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
