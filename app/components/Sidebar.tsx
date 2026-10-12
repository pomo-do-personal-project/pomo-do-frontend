"use client";

import React, { useState } from "react";
import { Logo } from "./Logo";
import { useAuthStore } from "../stores/useAuthStore";
import {
  LayoutDashboard,
  CheckSquare,
  Grid2X2,
  BarChart3,
  User as UserIcon,
  LogOut,
  ChevronsLeft,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem?: string;
  onSelectItem?: (id: string) => void | Promise<void>;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number; className?: string }>;
}

export function Sidebar({
  isOpen,
  onToggle,
  activeItem = "dashboard",
  onSelectItem,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [showUserMenu, setShowUserMenu] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const topItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard / Timer", icon: LayoutDashboard },
    { id: "task", label: "Task List", icon: CheckSquare },
    { id: "matrix", label: "Eisenhower Matrix", icon: Grid2X2 },
    { id: "statistic", label: "Statistics & Reports", icon: BarChart3 },
  ];

  const isUserLoggedIn = mounted && isAuthenticated && !!user;

  // Lấy 2 ký tự đầu hoặc chữ cái đầu của tên
  const userInitials = React.useMemo(() => {
    if (!user) return "U";
    if (user.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return user.displayName.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  }, [user]);

  const handleAccountClick = () => {
    if (!isUserLoggedIn) {
      // Chưa đăng nhập -> Mở modal Auth
      onSelectItem?.("info");
    } else {
      // Đã đăng nhập -> Bật/tắt menu popup chứa nút Logout
      setShowUserMenu((prev) => !prev);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    onSelectItem?.("logout");
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-r border-neutral-200/80 dark:border-neutral-800/80 select-none shadow-sm transition-[width] duration-300 ease-in-out ${isOpen ? "w-18 visible" : "w-0 overflow-hidden invisible border-none"
        }`}
    >
      {/* Top Header: Logo Image + Collapse Toggle on hover (h-14 match Top Header) */}
      <div className="h-14 w-18 flex items-center justify-center border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0 relative">
        <button
          onClick={onToggle}
          title="Thu gọn Sidebar"
          aria-label="Thu gọn Sidebar"
          className="w-10 h-10 relative flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-85 active:scale-95 transition-all group"
        >
          <div className="w-full h-full p-0.5 group-hover:opacity-10 transition-opacity duration-200 flex items-center justify-center">
            <Logo iconOnly size={36} />
          </div>
          {/* Collapse indicator with Lucide minimal stroke that reveals on hover */}
          <span className="hidden group-hover:flex absolute inset-0 items-center justify-center text-neutral-800 dark:text-neutral-100">
            <ChevronsLeft size={20} strokeWidth={2} />
          </span>
        </button>
      </div>

      {/* Top Navigation Items (overflow-visible so tooltips pop out clearly) */}
      <div className="flex-1 py-4 w-18 flex flex-col items-center gap-2 overflow-visible">
        {topItems.map((item) => {
          const isActive = activeItem === item.id;
          const IconComponent = item.icon;

          return (
            <div key={item.id} className="relative group flex justify-center">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onSelectItem?.(item.id);
                }}
                aria-label={item.label}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
              >
                <IconComponent size={22} strokeWidth={isActive ? 2 : 1.75} />
              </button>

              {/* Tooltip positioned outside of the sidebar */}
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
                {item.label}
                <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-neutral-900 dark:border-r-neutral-100" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation: Account & Logout */}
      <div className="py-3 w-18 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col items-center gap-2 overflow-visible shrink-0 relative">
        {/* Account Button / Avatar */}
        <div className="relative group flex justify-center">
          <button
            onClick={handleAccountClick}
            aria-label={isUserLoggedIn ? `User ${user?.displayName || user?.email}` : "Sign in / Register"}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer overflow-hidden border-2 ${isUserLoggedIn
              ? "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs hover:border-emerald-600 active:scale-95"
              : "border-dashed border-neutral-400 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
          >
            {isUserLoggedIn ? (
              user?.avatarUrl ? (
                /* Avatar Image nếu có */
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Chữ viết tắt của tên nếu chưa có avatar */
                <span className="text-xs font-black tracking-wider">
                  {userInitials}
                </span>
              )
            ) : (
              /* Icon Auth / Chưa đăng nhập (Minimal stroke User Icon) */
              <UserIcon size={20} strokeWidth={1.75} />
            )}
          </button>

          {/* Tooltip hiển thị khi hover nếu menu popup chưa mở */}
          {!showUserMenu && (
            <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
              {isUserLoggedIn ? `${user?.displayName || user?.email} (Tùy chọn)` : "Đăng ký / Đăng nhập"}
              <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-neutral-900 dark:border-r-neutral-100" />
            </div>
          )}

          {/* User Popover Menu (Hiện ra khi đã đăng nhập và bấm vào icon) */}
          {isUserLoggedIn && showUserMenu && (
            <>
              {/* Overlay vô hình để bấm ra ngoài là đóng menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              <div className="absolute left-[calc(100%+12px)] bottom-0 w-56 p-3 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-900 dark:border-white shadow-2xl z-50 flex flex-col gap-2.5 animate-in fade-in slide-in-from-left-2 duration-150">
                {/* Thông tin user vắn tắt */}
                <div className="px-2 py-1 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <div className="text-xs font-extrabold text-neutral-900 dark:text-white truncate">
                    {user?.displayName || "User"}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {user?.email}
                  </div>
                </div>

                {/* Nút Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer group/btn"
                >
                  <span>Logout</span>
                  <LogOut size={16} strokeWidth={1.75} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
