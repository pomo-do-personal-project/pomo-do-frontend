"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { User, Crown, Bell, Clock, Palette, Volume2, X, Sparkles, ChevronRight, ArrowLeft, LucideIcon } from "lucide-react";
import { AccountTab } from "./settings/tabs/AccountTab";
import { PremiumTab } from "./settings/tabs/PremiumTab";
import { NotificationsTab } from "./settings/tabs/NotificationsTab";
import { DateTimeTab } from "./settings/tabs/DateTimeTab";
import { AppearanceTab } from "./settings/tabs/AppearanceTab";
import { SoundTab } from "./settings/tabs/SoundTab";
import { useTranslation } from "../stores/useLanguageStore";

export type SettingsTab = "account" | "premium" | "notifications" | "date-time" | "appearance" | "sound";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export function SettingsModal({ isOpen, onClose, initialTab = "account" }: SettingsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  // In-Modal Toast State
  const [toast, setToast] = useState<{ message: string; icon?: React.ReactNode } | null>(null);

  const showNotice = (message: string, icon?: React.ReactNode) => {
    setToast({ message, icon });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsMobileDetailOpen(false);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; sub: string; icon: LucideIcon }[] = [
    { id: "account", label: t.settings.tabs.account, sub: user?.displayName || user?.email || "Thông tin & mật khẩu", icon: User },
    { id: "premium", label: t.settings.tabs.premium, sub: "Nâng cấp tính năng cao cấp", icon: Crown },
    { id: "notifications", label: t.settings.tabs.notifications, sub: "Âm thanh & thông báo đẩy", icon: Bell },
    { id: "date-time", label: t.settings.tabs.timer, sub: "Thời lượng Pomodoro & Nghỉ", icon: Clock },
    { id: "appearance", label: t.settings.tabs.appearance, sub: "Chủ đề màu & hình nền", icon: Palette },
    { id: "sound", label: "Âm thanh", sub: "Chuông báo & tích tắc", icon: Volume2 },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Click outside backdrop to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full ${
          isMobileDetailOpen ? "max-w-2xl h-[90vh]" : "max-w-md sm:max-w-lg h-auto max-h-[90vh]"
        } md:max-w-4xl md:h-[88vh] md:max-h-[700px] bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-dialog-title" className="sr-only">{t.nav.settings}</h2>

        {/* Nút đóng modal góc trên bên phải (luôn hiện trên Desktop, ẩn trên mobile khi đang xem trang chi tiết) */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className={`absolute top-4 right-4 z-30 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
            isMobileDetailOpen ? "hidden md:flex" : "flex"
          } items-center justify-center`}
          title={t.common.close}
        >
          <X size={20} />
        </button>

        {/* ======================================================== */}
        {/* CỘT TRÁI / MENU CẤP 1 TRÊN MOBILE                         */}
        {/* ======================================================== */}
        <aside
          className={`w-full md:w-68 md:border-r border-neutral-200 dark:border-neutral-800/80 p-4 pb-6 md:pb-4 flex flex-col bg-white dark:bg-[#1e1e1e] md:bg-neutral-50/90 md:dark:bg-[#191919] shrink-0 overflow-y-auto ${
            isMobileDetailOpen ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex items-center gap-2.5 px-2 py-2 mb-3">
            <span className="font-bold text-lg md:text-base text-neutral-900 dark:text-white tracking-tight">
              {t.nav.settings}
            </span>
          </div>

          <nav className="flex flex-col gap-2 md:gap-1.5">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileDetailOpen(true);
                  }}
                  className={`w-full px-3.5 py-3 md:py-2.5 rounded-2xl md:rounded-xl flex items-center justify-between transition-all cursor-pointer text-left bg-neutral-50/80 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-800/80 ${
                    isActive
                      ? "md:bg-white md:dark:bg-neutral-800 md:text-neutral-900 md:dark:text-white md:shadow-xs md:border md:border-neutral-200/80 md:font-semibold"
                      : "md:bg-transparent md:text-neutral-500 md:hover:text-neutral-900 md:hover:bg-neutral-200/50 md:dark:text-neutral-400 md:dark:hover:text-neutral-200 md:dark:hover:bg-neutral-800/50 md:border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp
                      size={20}
                      strokeWidth={1.75}
                      className={`shrink-0 ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate">{tab.label}</span>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate md:hidden">
                        {tab.sub}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-neutral-400 shrink-0 md:hidden ml-2" />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ======================================================== */}
        {/* CỘT PHẢI / TRANG CHI TIẾT TAB                             */}
        {/* ======================================================== */}
        <main
          className={`flex-1 p-4 sm:p-8 pr-3 sm:pr-8 md:pr-12 overflow-y-auto bg-white dark:bg-[#1e1e1e] flex-col ${
            !isMobileDetailOpen ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header Mobile với nút [← Quay lại Cài đặt] */}
          <div className="flex md:hidden items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileDetailOpen(false)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{t.nav.settings}</span>
            </button>
            <span className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-[180px]">
              {currentTabObj?.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={t.common.close}
            >
              <X size={18} />
            </button>
          </div>

          {activeTab === "account" && <AccountTab showNotice={showNotice} />}
          {activeTab === "premium" && <PremiumTab showNotice={showNotice} />}
          {activeTab === "notifications" && (
            <NotificationsTab userEmail={user?.email} showNotice={showNotice} />
          )}
          {activeTab === "date-time" && <DateTimeTab showNotice={showNotice} />}
          {activeTab === "appearance" && <AppearanceTab showNotice={showNotice} />}
          {activeTab === "sound" && <SoundTab showNotice={showNotice} />}
        </main>

        {/* In-Modal Toast Notification Cao Cấp */}
        {toast && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-sm sm:max-w-md w-[92%] px-4 py-3 bg-[#2a2a2a] text-white border border-neutral-700 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="shrink-0 text-amber-400">
              {toast.icon || <Sparkles size={18} />}
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-snug flex-1">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
