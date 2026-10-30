"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Camera, Pencil, Check, X, KeyRound, ShieldAlert } from "lucide-react";

import { useTranslation } from "../../../stores/useLanguageStore";

interface AccountTabProps {
  showNotice: (message: string, icon?: React.ReactNode) => void;
}

export function AccountTab({ showNotice }: AccountTabProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const userFullName = user?.displayName || (user as { fullName?: string } | null)?.fullName || "";
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(userFullName);

  const handleSaveName = () => {
    if (!editName.trim()) return;
    useAuthStore.setState((s) => ({
      user: s.user ? { ...s.user, displayName: editName.trim() } : null,
    }));
    setIsEditingName(false);
    showNotice("Đã cập nhật tên hiển thị!");
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-4 py-2 animate-in fade-in duration-150">
      {/* Khối Avatar tròn lớn + Hover camera overlay */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1">
        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 font-bold text-3xl flex items-center justify-center shadow-md select-none">
            {userFullName ? userFullName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}
          </div>
          <div
            onClick={() =>
              showNotice(
                t.settings.premium.trialNotice
              )
            }
            title={t.settings.account.displayName}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <Camera size={22} strokeWidth={2} />
          </div>
        </div>

        {/* Tên hiển thị + Nút sửa tên ✏️ */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2.5 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 text-emerald-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title={t.tasks.saveSubtask}
              >
                <Check size={16} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title={t.tasks.cancelSubtask}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {userFullName}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditName(userFullName);
                  setIsEditingName(true);
                }}
                title={t.settings.account.displayName}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <Pencil size={14} strokeWidth={2} />
              </button>
            </>
          )}
        </div>

        {/* Subtitle vàng cam */}
        <span className="text-xs font-semibold text-amber-500 mt-1 tracking-wide">
          {t.settings.tabs.premium}
        </span>
      </div>

      {/* CARD 1: Email & Password */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 flex flex-col gap-3.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">{t.settings.account.email}</span>
          <span className="text-neutral-800 dark:text-neutral-200 font-medium select-all">
            {user?.email || ""}
          </span>
        </div>

        <div className="border-t border-neutral-200/80 dark:border-neutral-800/80" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">{t.settings.account.password}</span>
          <button
            type="button"
            onClick={() =>
              showNotice(
                t.auth.forgotPasswordLink,
                <KeyRound size={18} className="text-blue-500 dark:text-blue-400" />
              )
            }
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline cursor-pointer font-medium"
          >
            {t.settings.account.changePassword}
          </button>
        </div>
      </div>

      {/* CARD 2: Google */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400 font-medium">{t.settings.account.googleAccount}</span>
        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
          {userFullName}
        </span>
      </div>

      {/* CARD 3: Manage Account (Delete Account) */}
      <div className="bg-neutral-100/70 dark:bg-[#262626] rounded-2xl p-4 flex items-center justify-between text-sm">
        <span className="text-neutral-500 dark:text-neutral-400 font-medium">{t.settings.account.manageAccount}</span>
        <button
          type="button"
          onClick={() =>
            showNotice(
              t.settings.account.deleteAccountDesc,
              <ShieldAlert size={18} className="text-rose-400" />
            )
          }
          className="text-rose-500 hover:text-rose-400 hover:underline cursor-pointer font-medium"
        >
          {t.settings.account.deleteAccount}
        </button>
      </div>
    </div>
  );
}
