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
  ChevronRight,
  Sparkles,
  Settings,
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
              ? "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600 active:scale-95"
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
                /* Chữ viết tắt với nền tím tròn chuẩn theo ảnh mẫu */
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold select-none shadow-xs">
                  {userInitials}
                </div>
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

          {/* User Popover Menu 4 mục (Chuẩn phong cách dark card cao cấp) */}
          {isUserLoggedIn && showUserMenu && (
            <>
              {/* Overlay vô hình bắt sự kiện click ra ngoài để đóng menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              <div className="absolute left-[calc(100%+12px)] bottom-0 w-64 p-1.5 bg-white dark:bg-[#202123] text-neutral-900 dark:text-neutral-100 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 shadow-2xl z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-left-2 duration-150 select-none">
                {/* 1. Header: Avatar tím + Tên + Free + Chevron */}
                <div
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                      {userInitials}
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {user?.displayName || "User"}
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
                        Free
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2} className="text-neutral-400 dark:text-neutral-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Đường kẻ phân cách */}
                <div className="my-1 border-t border-neutral-200/80 dark:border-neutral-700/60" />

                {/* 2. Mục Premiums */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectItem?.("premiums");
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 flex items-center gap-3 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer text-left"
                >
                  <Sparkles size={16} strokeWidth={1.75} className="text-neutral-500 dark:text-neutral-400" />
                  <span>Premiums</span>
                </button>

                {/* 3. Mục Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectItem?.("settings");
                  }}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 flex items-center gap-3 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer text-left"
                >
                  <Settings size={16} strokeWidth={1.75} className="text-neutral-500 dark:text-neutral-400" />
                  <span>Settings</span>
                </button>

                {/* Đường kẻ phân cách */}
                <div className="my-1 border-t border-neutral-200/80 dark:border-neutral-700/60" />

                {/* 4. Mục Log out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-2.5 py-2 rounded-xl hover:bg-rose-500/10 text-neutral-700 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-3 text-xs font-semibold transition-colors cursor-pointer text-left group"
                >
                  <LogOut size={16} strokeWidth={1.75} className="text-neutral-500 dark:text-neutral-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
