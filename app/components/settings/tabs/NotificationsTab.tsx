"use client";

import React, { useState, useEffect } from "react";
import { useSettingsAudio, RingtoneType } from "../hooks/useSettingsAudio";
import { ShieldAlert, Check } from "lucide-react";
import { NotificationSoundCard } from "../notifications/NotificationSoundCard";
import { NotificationTickingCard } from "../notifications/NotificationTickingCard";
import { NotificationRemindersCard } from "../notifications/NotificationRemindersCard";
import { useTranslation } from "../../../stores/useLanguageStore";

interface NotificationsTabProps {
  userEmail?: string;
  showNotice: (message: string, icon?: React.ReactNode) => void;
}

export function NotificationsTab({ userEmail, showNotice }: NotificationsTabProps) {
  const { t } = useTranslation();
  const { playRingtone, playTickSound, playOvertimeAlert } = useSettingsAudio();

  // Notification states & Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusRingtone, setFocusRingtone] = useState<RingtoneType>("bell");
  const [breakRingtone, setBreakRingtone] = useState<RingtoneType>("zen");
  const [soundVolume, setSoundVolume] = useState(80);
  const [desktopNotify, setDesktopNotify] = useState(false);

  // Ticking sound states
  const [tickingEnabled, setTickingEnabled] = useState(false);
  const [tickingVolume, setTickingVolume] = useState(40);

  // Overtime Alert state
  const [overtimeAlertEnabled, setOvertimeAlertEnabled] = useState(true);

  // Daily Reminder states
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState("08:30");

  // Email reports & digest states
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(false);
  const [emailDailyDigest, setEmailDailyDigest] = useState(false);

  useEffect(() => {
    const savedSound = localStorage.getItem("pomodo_sound_enabled");
    if (savedSound !== null) setSoundEnabled(savedSound === "true");

    const savedFocusRing =
      localStorage.getItem("pomodo_focus_ringtone") ||
      localStorage.getItem("pomodo_ringtone");
    if (savedFocusRing) setFocusRingtone(savedFocusRing as RingtoneType);

    const savedBreakRing = localStorage.getItem("pomodo_break_ringtone");
    if (savedBreakRing) setBreakRingtone(savedBreakRing as RingtoneType);

    const savedVol = localStorage.getItem("pomodo_sound_volume");
    if (savedVol !== null) setSoundVolume(Number(savedVol));

    const savedTick = localStorage.getItem("pomodo_ticking_enabled");
    if (savedTick !== null) setTickingEnabled(savedTick === "true");

    const savedTickVol = localStorage.getItem("pomodo_ticking_volume");
    if (savedTickVol !== null) setTickingVolume(Number(savedTickVol));

    const savedOtAlert = localStorage.getItem("pomodo_ot_alert_enabled");
    if (savedOtAlert !== null) setOvertimeAlertEnabled(savedOtAlert === "true");

    const savedDailyReminder = localStorage.getItem("pomodo_daily_reminder_enabled");
    if (savedDailyReminder !== null) setDailyReminderEnabled(savedDailyReminder === "true");

    const savedDailyTime = localStorage.getItem("pomodo_daily_reminder_time");
    if (savedDailyTime) setDailyReminderTime(savedDailyTime);

    const savedEmailWeekly = localStorage.getItem("pomodo_email_weekly");
    if (savedEmailWeekly !== null) setEmailWeeklyReport(savedEmailWeekly === "true");

    const savedEmailDaily = localStorage.getItem("pomodo_email_daily");
    if (savedEmailDaily !== null) setEmailDailyDigest(savedEmailDaily === "true");

    if (typeof window !== "undefined" && "Notification" in window) {
      setDesktopNotify(Notification.permission === "granted");
    }
  }, []);

  const handleToggleDesktopNotification = async () => {
    if (!("Notification" in window)) {
      showNotice(
        "Trình duyệt không hỗ trợ thông báo đẩy.",
        <ShieldAlert size={18} className="text-rose-400" />
      );
      return;
    }
    if (Notification.permission === "granted") {
      const nextVal = !desktopNotify;
      setDesktopNotify(nextVal);
      showNotice(
        nextVal ? "Đã bật thông báo đẩy desktop." : "Đã tắt thông báo đẩy desktop."
      );
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setDesktopNotify(true);
        showNotice(
          "✓ Đã cấp quyền thông báo màn hình thành công!",
          <Check size={18} className="text-emerald-400" />
        );
        new Notification("Pomo-do", {
          body: "Bạn đã kích hoạt thông báo thành công!",
          icon: "/favicon.ico",
        });
      } else {
        setDesktopNotify(false);
        showNotice(
          "Quyền thông báo bị từ chối trong trình duyệt.",
          <ShieldAlert size={18} className="text-rose-400" />
        );
      }
    }
  };

  const handleSendTestDailyNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Chào buổi sáng từ Pomo-do! ☀️", {
        body: "Hôm nay bạn có các công việc cần thực hiện. Hãy bắt đầu phiên Focus đầu tiên nhé!",
        icon: "/favicon.ico",
      });
      showNotice("Đã gửi thông báo thử nghiệm ra màn hình Desktop!");
    } else {
      showNotice("Vui lòng kích hoạt 'Thông báo đẩy màn hình' ở trên trước.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-bold text-neutral-900 dark:text-white -mb-2">
        {t.settings.notifications.title}
      </h3>

      {/* Block 1: Sound Ringtone Settings */}
      <NotificationSoundCard
        soundEnabled={soundEnabled}
        soundVolume={soundVolume}
        focusRingtone={focusRingtone}
        breakRingtone={breakRingtone}
        onToggleSound={(enabled) => {
          setSoundEnabled(enabled);
          localStorage.setItem("pomodo_sound_enabled", String(enabled));
        }}
        onVolumeChange={(v) => {
          setSoundVolume(v);
          localStorage.setItem("pomodo_sound_volume", String(v));
        }}
        onSelectFocusRingtone={(r) => {
          setFocusRingtone(r);
          localStorage.setItem("pomodo_focus_ringtone", r);
        }}
        onSelectBreakRingtone={(r) => {
          setBreakRingtone(r);
          localStorage.setItem("pomodo_break_ringtone", r);
        }}
        onPlayRingtone={playRingtone}
      />

      {/* Block 2: Ticking & Overtime Alert */}
      <NotificationTickingCard
        tickingEnabled={tickingEnabled}
        tickingVolume={tickingVolume}
        overtimeAlertEnabled={overtimeAlertEnabled}
        soundVolume={soundVolume}
        onToggleTicking={(checked) => {
          setTickingEnabled(checked);
          localStorage.setItem("pomodo_ticking_enabled", String(checked));
          if (checked) playTickSound(tickingVolume);
        }}
        onTickingVolumeChange={(v) => {
          setTickingVolume(v);
          localStorage.setItem("pomodo_ticking_volume", String(v));
        }}
        onToggleOvertimeAlert={(checked) => {
          setOvertimeAlertEnabled(checked);
          localStorage.setItem("pomodo_ot_alert_enabled", String(checked));
          if (checked) playOvertimeAlert(soundVolume);
        }}
        onPlayTickSound={playTickSound}
        onPlayOvertimeAlert={playOvertimeAlert}
      />

      {/* Block 3: Desktop Push, Daily Reminders & Email Digest */}
      <NotificationRemindersCard
        userEmail={userEmail}
        desktopNotify={desktopNotify}
        dailyReminderEnabled={dailyReminderEnabled}
        dailyReminderTime={dailyReminderTime}
        emailWeeklyReport={emailWeeklyReport}
        emailDailyDigest={emailDailyDigest}
        showNotice={showNotice}
        onToggleDesktopNotify={handleToggleDesktopNotification}
        onToggleDailyReminder={(checked) => {
          setDailyReminderEnabled(checked);
          localStorage.setItem("pomodo_daily_reminder_enabled", String(checked));
          if (checked) {
            showNotice(`Đã bật nhắc việc hàng ngày vào lúc ${dailyReminderTime}`);
          }
        }}
        onDailyReminderTimeChange={(time) => {
          setDailyReminderTime(time);
          localStorage.setItem("pomodo_daily_reminder_time", time);
        }}
        onSendTestDailyNotification={handleSendTestDailyNotification}
        onToggleEmailWeeklyReport={(checked) => {
          setEmailWeeklyReport(checked);
          localStorage.setItem("pomodo_email_weekly", String(checked));
          showNotice(
            checked
              ? "Đã lưu đăng ký nhận Báo cáo tuần qua email (sẽ kích hoạt khi hệ thống gửi mail sẵn sàng)."
              : "Đã hủy nhận Báo cáo tuần qua email."
          );
        }}
        onToggleEmailDailyDigest={(checked) => {
          setEmailDailyDigest(checked);
          localStorage.setItem("pomodo_email_daily", String(checked));
          showNotice(
            checked
              ? "Đã lưu đăng ký nhận Tóm tắt đầu ngày qua email (sẽ kích hoạt khi hệ thống gửi mail sẵn sàng)."
              : "Đã hủy nhận Tóm tắt đầu ngày qua email."
          );
        }}
      />
    </div>
  );
}
