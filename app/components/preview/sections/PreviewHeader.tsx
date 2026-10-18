"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, ArrowRight, ChevronDown, Settings, LogOut } from "lucide-react";
import { Logo } from "../../Logo";
import { useAuthStore } from "../../../stores/useAuthStore";

interface PreviewHeaderProps {
  language: string;
  setLanguage: (lang: "vi" | "en") => void;
  onOpenAuthModal: (mode: "signin" | "signup") => void;
}

export const PreviewHeader = React.memo(function PreviewHeader({
  language,
  setLanguage,
  onOpenAuthModal,
}: PreviewHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-neutral-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo Pomo-Do */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${language}/preview`}
            className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
          >
            <Logo size={34} />
          </Link>
        </div>

        {/* Menu Điều Hướng */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-600">
          <a href="#mockup-3d" className="hover:text-rose-600 transition-colors">
            5 Giao diện cốt lõi
          </a>
          <a href="#features" className="hover:text-rose-600 transition-colors">
            Tính năng nổi bật
          </a>
          <a href="#mvp-pricing" className="hover:text-rose-600 transition-colors">
            Gói MVP Miễn phí
          </a>
        </nav>

        {/* Cụm Tiện ích & Nút Auth */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer border border-neutral-200/60"
            aria-label="Thay đổi ngôn ngữ"
          >
            <Globe size={14} />
            <span className="uppercase">{language}</span>
          </button>

          <div className="h-5 w-px bg-neutral-200 hidden sm:block" />

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal("signin")}
                className="px-4 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal("signup")}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Bắt đầu miễn phí</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 relative">
              <Link
                href={`/${language}`}
                className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Vào ứng dụng</span>
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-expanded={showUserDropdown}
                  aria-label="Menu tài khoản"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-bold text-neutral-800 hidden md:inline">
                    {user?.displayName || user?.email || "Tài khoản"}
                  </span>
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>

                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white rounded-2xl border border-neutral-200 shadow-2xl z-20 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-900">
                          {user?.displayName || "Người dùng"}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        href={`/${language}`}
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Settings size={14} className="text-neutral-400" />
                        <span>Vào không gian làm việc</span>
                      </Link>

                      <div className="my-1 border-t border-neutral-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
