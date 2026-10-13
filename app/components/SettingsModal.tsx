"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { User, Crown, Bell, Clock, Palette, X, Sparkles, LucideIcon } from "lucide-react";
import { AccountTab } from "./settings/tabs/AccountTab";
import { PremiumTab } from "./settings/tabs/PremiumTab";
import { NotificationsTab } from "./settings/tabs/NotificationsTab";
import { DateTimeTab } from "./settings/tabs/DateTimeTab";
import { AppearanceTab } from "./settings/tabs/AppearanceTab";

export type SettingsTab = "account" | "premium" | "notifications" | "date-time" | "appearance";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

export function SettingsModal({ isOpen, onClose, initialTab = "account" }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const user = useAuthStore((s) => s.user);

  // In-Modal Toast State
  const [toast, setToast] = useState<{ message: string; icon?: React.ReactNode } | null>(null);

  const showNotice = (message: string, icon?: React.ReactNode) => {
    setToast({ message, icon });
  };

  // Tự động tắt Toast sau 3.5 giây
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
    { id: "account", label: "Tài khoản (Account)", icon: User },
    { id: "premium", label: "Gói Premium", icon: Crown },
    { id: "notifications", label: "Thông báo (Notifications)", icon: Bell },
    { id: "date-time", label: "Thời gian (Date & Time)", icon: Clock },
    { id: "appearance", label: "Giao diện (Appearance)", icon: Palette },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl h-[88vh] max-h-[700px] bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-dialog-title" className="sr-only">Cài đặt ứng dụng</h2>

        {/* Nút đóng modal góc trên bên phải */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cài đặt"
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Đóng cài đặt"
        >
          <X size={20} />
        </button>

        {/* ======================================================== */}
        {/* CỘT TRÁI: SIDEBAR CÁC DANH MỤC CÀI ĐẶT                   */}
        {/* ======================================================== */}
        <aside className="w-full md:w-68 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800/80 p-3.5 sm:p-4 flex flex-col bg-neutral-50/90 dark:bg-[#191919] shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-3">
            <span className="font-bold text-base text-neutral-900 dark:text-white tracking-tight">Cài đặt</span>
          </div>

          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap text-left ${
                    isActive
                      ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/80 dark:border-transparent font-semibold"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <IconComp
                    size={18}
                    strokeWidth={1.75}
                    className={`shrink-0 ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}
                  />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ======================================================== */}
        {/* CỘT PHẢI: NỘI DUNG TỪNG TAB                               */}
        {/* ======================================================== */}
        <main className="flex-1 p-5 sm:p-8 pr-3 sm:pr-5 overflow-y-auto bg-white dark:bg-[#1e1e1e]">
          {activeTab === "account" && <AccountTab showNotice={showNotice} />}
          {activeTab === "premium" && <PremiumTab showNotice={showNotice} />}
          {activeTab === "notifications" && (
            <NotificationsTab userEmail={user?.email} showNotice={showNotice} />
          )}
          {activeTab === "date-time" && <DateTimeTab showNotice={showNotice} />}
          {activeTab === "appearance" && <AppearanceTab />}
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
