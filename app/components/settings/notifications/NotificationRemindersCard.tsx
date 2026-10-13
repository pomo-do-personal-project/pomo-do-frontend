"use client";

import React from "react";
import { Clock, Send, Bell, Mail, ShieldAlert } from "lucide-react";

interface NotificationRemindersCardProps {
  userEmail?: string;
  desktopNotify: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  emailWeeklyReport: boolean;
  emailDailyDigest: boolean;
  showNotice: (message: string, icon?: React.ReactNode) => void;
  onToggleDesktopNotify: () => void;
  onToggleDailyReminder: (enabled: boolean) => void;
  onDailyReminderTimeChange: (time: string) => void;
  onSendTestDailyNotification: () => void;
  onToggleEmailWeeklyReport: (enabled: boolean) => void;
  onToggleEmailDailyDigest: (enabled: boolean) => void;
}

export function NotificationRemindersCard({
  userEmail,
  desktopNotify,
  dailyReminderEnabled,
  dailyReminderTime,
  emailWeeklyReport,
  emailDailyDigest,
  showNotice,
  onToggleDesktopNotify,
  onToggleDailyReminder,
  onDailyReminderTimeChange,
  onSendTestDailyNotification,
  onToggleEmailWeeklyReport,
  onToggleEmailDailyDigest,
}: NotificationRemindersCardProps) {
  return (
    <>
      {/* KHỐI 3: DESKTOP PUSH & DAILY REMINDERS */}
      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
        {/* Desktop Push */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              Thông báo đẩy màn hình (Desktop Push)
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Nhận popup góc màn hình khi hết giờ nếu bạn đang thu nhỏ tab hoặc làm việc khác
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDesktopNotify}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              desktopNotify
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-white text-neutral-700 hover:text-neutral-900 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:border-neutral-700"
            }`}
          >
            {desktopNotify ? "✓ Đã bật" : "Kích hoạt"}
          </button>
        </div>

        {/* Daily Reminder */}
        <div className="flex flex-col gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Nhắc việc đầu ngày (Daily Reminder)</span>
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Nhắc nhở tổng quan danh sách việc cần làm và mục tiêu Pomodoro vào khung giờ cố định
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyReminderEnabled}
                onChange={(e) => onToggleDailyReminder(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {dailyReminderEnabled && (
            <div className="pt-2 p-3 bg-white dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-neutral-500 dark:text-neutral-400" />
                <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  Khung giờ nhắc hàng ngày:
                </span>
                <input
                  type="time"
                  value={dailyReminderTime}
                  onChange={(e) => onDailyReminderTimeChange(e.target.value)}
                  className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <button
                type="button"
                onClick={onSendTestDailyNotification}
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-amber-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-amber-400 dark:hover:text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-300 dark:border-neutral-700/60"
              >
                <Send size={12} />
                <span>Gửi thông báo thử</span>
              </button>
            </div>
          )}
        </div>

        {/* Streak reminder */}
        <div className="pt-1 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
              <span>Nhắc nhở duy trì chuỗi Streak</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-200/80 text-amber-700 dark:bg-neutral-800 dark:text-amber-400 border border-amber-500/30 rounded-full">
                Sắp ra mắt
              </span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Nhắc bật phiên Pomodoro đầu tiên để không bị đứt chuỗi ngày liên tiếp
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              showNotice(
                "Tính năng nhắc nhở Streak theo khung giờ sẽ khả dụng trong bản cập nhật tới.",
                <Bell size={18} className="text-amber-400 shrink-0" />
              )
            }
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-white dark:border-neutral-700/60 rounded-xl transition-colors cursor-pointer"
          >
            Đăng ký nhận
          </button>
        </div>
      </div>

      {/* KHỐI 4: BÁO CÁO QUA EMAIL */}
      <div className="bg-neutral-50/80 dark:bg-[#262626] rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
              <Mail size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Báo cáo qua Email (Email Digest)
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Gửi tổng kết hiệu suất về hộp thư:{" "}
                <span className="text-neutral-800 dark:text-neutral-300 font-medium">
                  {userEmail || "minhngo@gmail.com"}
                </span>
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-200/80 text-amber-700 dark:bg-neutral-800 dark:text-amber-400 border border-amber-500/30 rounded-full">
            Sắp ra mắt
          </span>
        </div>

        {/* Weekly Report */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Báo cáo năng suất tuần (Weekly Productivity Report)
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Gửi 1 email duy nhất vào sáng Thứ Hai về số Pomodoro & công việc đã hoàn thành
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

        {/* Daily Digest */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              Tóm tắt công việc đầu ngày (Daily Morning Digest)
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Gửi 1 email lúc 07:00 sáng tóm tắt các việc cần làm hôm nay giúp bạn bắt đầu ngày mới
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
      </div>
    </>
  );
}
