"use client";

import React from "react";
import { Clock, Mail } from "lucide-react";
import { useTranslation } from "../../../stores/useLanguageStore";

interface NotificationEmailReportCardProps {
  userEmail?: string;
  emailWeeklyReport: boolean;
  emailDailyDigest: boolean;
  weeklyReportTime: string;
  dailyDigestTime: string;
  onToggleEmailWeeklyReport: (enabled: boolean) => void;
  onToggleEmailDailyDigest: (enabled: boolean) => void;
  onWeeklyReportTimeChange: (time: string) => void;
  onDailyDigestTimeChange: (time: string) => void;
}

export function NotificationEmailReportCard({
  userEmail,
  emailWeeklyReport,
  emailDailyDigest,
  weeklyReportTime,
  dailyDigestTime,
  onToggleEmailWeeklyReport,
  onToggleEmailDailyDigest,
  onWeeklyReportTimeChange,
  onDailyDigestTimeChange,
}: NotificationEmailReportCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
      {/* Header card with locked account email */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
            <Mail size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              {t.settings.notifications.emailReportTitle}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{t.settings.notifications.emailReportDesc}</span>
              <strong className="text-neutral-800 dark:text-neutral-200 font-semibold bg-neutral-200/50 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                {userEmail || ""}
              </strong>
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Hoạt động
        </span>
      </div>

      {/* Weekly Report */}
      <div className="flex flex-col gap-2.5 pb-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{t.settings.notifications.emailWeeklyTitle}</span>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                  emailWeeklyReport
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-neutral-200/60 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {weeklyReportTime} sáng Thứ Hai
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.settings.notifications.emailWeeklyDesc}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailWeeklyReport}
              onChange={(e) => onToggleEmailWeeklyReport(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Hàng cài đặt giờ gửi báo cáo tuần liền mạch */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Clock
              size={14}
              className={emailWeeklyReport ? "text-emerald-500 shrink-0" : "text-neutral-400 shrink-0"}
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {t.settings.notifications.emailWeeklyTime}
            </span>
          </div>
          <input
            type="time"
            value={weeklyReportTime}
            onChange={(e) => onWeeklyReportTimeChange(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
          />
        </div>
      </div>

      {/* Daily Digest */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{t.settings.notifications.emailDailyTitle}</span>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                  emailDailyDigest
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-neutral-200/60 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {dailyDigestTime} mỗi sáng
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t.settings.notifications.emailDailyDesc}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailDailyDigest}
              onChange={(e) => onToggleEmailDailyDigest(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Hàng cài đặt giờ gửi tóm tắt hàng ngày liền mạch */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Clock
              size={14}
              className={emailDailyDigest ? "text-emerald-500 shrink-0" : "text-neutral-400 shrink-0"}
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {t.settings.notifications.emailDailyTime}
            </span>
          </div>
          <input
            type="time"
            value={dailyDigestTime}
            onChange={(e) => onDailyDigestTimeChange(e.target.value)}
            className="px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}
