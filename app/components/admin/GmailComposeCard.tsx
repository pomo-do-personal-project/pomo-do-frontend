"use client";

import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";
import { GmailFormatBar } from "./GmailFormatBar";
import { GmailBottomActionBar } from "./GmailBottomActionBar";
import { GmailAttachmentsList } from "./GmailAttachmentsList";
import { GmailRecipientsRow, EmailRecipient } from "./GmailRecipientsRow";
import { AdminUserSummary } from "../../types/admin";
import { applyTextFormat, DEFAULT_ADMIN_SIGNATURE } from "./gmailFormattingHelper";

interface GmailComposeCardProps {
  category?: "info" | "warning" | "maintenance";
  setCategory?: (c: "info" | "warning" | "maintenance") => void;
  scheduleOption: "immediate" | "scheduled";
  setScheduleOption: (opt: "immediate" | "scheduled") => void;
  scheduledTime: string;
  setScheduledTime: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  url: string;
  setUrl: (val: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  recipients?: EmailRecipient[];
  onAddRecipient?: (recipient: EmailRecipient) => void;
  onRemoveRecipient?: (index: number) => void;
  availableUsers?: AdminUserSummary[];
  onClose?: () => void;
  className?: string;
}

export function GmailComposeCard({
  scheduleOption, setScheduleOption, scheduledTime, setScheduledTime,
  title, setTitle, content, setContent, url, setUrl, onSubmit, onReset,
  recipients, onAddRecipient, onRemoveRecipient, availableUsers, onClose, className,
}: GmailComposeCardProps) {
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [showUrlField, setShowUrlField] = useState(Boolean(url));
  const [fontFamily, setFontFamily] = useState("Sans Serif");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxTitleChars = 100;
  const maxContentChars = 1000;

  const updateContentWithHistory = (newVal: string) => {
    setContent(newVal);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newVal]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleApplyFormat = (
    type: "bold" | "italic" | "underline" | "strike" | "quote" | "ol" | "ul" | "clear" | "h1" | "h2"
  ) => {
    const el = textareaRef.current;
    if (!el) return;
    const { text, newCursorEnd } = applyTextFormat(content, type, el.selectionStart, el.selectionEnd);
    updateContentWithHistory(text);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newCursorEnd, newCursorEnd);
    }, 10);
  };

  const handleInsertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      updateContentWithHistory(content + emoji);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = content.slice(0, start) + emoji + content.slice(end);
    updateContentWithHistory(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  const getFontFamilyClass = () => {
    if (fontFamily === "Serif") return "font-serif";
    if (fontFamily === "Monospace") return "font-mono";
    return "font-sans";
  };

  return (
    <div
      className={
        className ||
        "w-full rounded-2xl bg-white dark:bg-[#151619] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col transition-all"
      }
    >
      {/* 1. Row 1: Người nhận */}
      <GmailRecipientsRow
        recipients={recipients}
        onAddRecipient={onAddRecipient}
        onRemoveRecipient={onRemoveRecipient}
        availableUsers={availableUsers}
        onClose={onClose}
      />

      {/* 2. Row 2: Tiêu đề */}
      <div className="px-4 py-2.5 flex items-center gap-3 border-b border-neutral-200/70 dark:border-neutral-800 text-xs sm:text-sm shrink-0">
        <span className="text-neutral-500 dark:text-neutral-400 w-20 shrink-0 font-medium">Tiêu đề</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={maxTitleChars}
          placeholder={recipients ? "Nhập tiêu đề email..." : "Nhập tiêu đề thông báo..."}
          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
        />
        <span className="text-[11px] text-neutral-400 font-mono shrink-0">
          {title.length}/{maxTitleChars}
        </span>
      </div>

      {/* 3. Action URL Field (Toggleable) */}
      {showUrlField && (
        <div className="px-4 py-2 flex items-center gap-3 border-b border-neutral-200/70 dark:border-neutral-800 text-xs sm:text-sm shrink-0 animate-in fade-in">
          <span className="text-neutral-500 dark:text-neutral-400 w-20 shrink-0 font-medium">Liên kết URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://pomo-do.com/upgrade..."
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setShowUrlField(false);
            }}
            className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Message Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
        <textarea
          ref={textareaRef}
          rows={10}
          value={content}
          onChange={(e) => updateContentWithHistory(e.target.value)}
          maxLength={maxContentChars}
          placeholder="Nhập nội dung thông điệp gửi tới người dùng..."
          className={`w-full flex-1 min-h-[140px] bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed ${getFontFamilyClass()}`}
        />
        <GmailAttachmentsList
          attachments={attachments}
          onRemove={(idx) => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
        />
      </div>

      {/* 5. Schedule Picker */}
      {scheduleOption === "scheduled" && (
        <div className="px-4 py-2 bg-blue-50/70 dark:bg-blue-950/20 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <Calendar size={15} />
            <span>Lên lịch phát sóng:</span>
          </div>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="p-1 px-2 rounded-lg bg-white dark:bg-[#1C1D21] border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none"
          />
        </div>
      )}

      {/* 6. Fixed/Pinned Bottom Footer (Formatting + Action Toolbar) */}
      <div className="mt-auto shrink-0 bg-white dark:bg-[#151619] z-20 sticky bottom-0">
        {showFormatBar && (
          <GmailFormatBar
            onApplyFormat={handleApplyFormat}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        )}
        <GmailBottomActionBar
          scheduleOption={scheduleOption}
          setScheduleOption={setScheduleOption}
          showFormatBar={showFormatBar}
          setShowFormatBar={setShowFormatBar}
          showUrlField={showUrlField}
          setShowUrlField={setShowUrlField}
          onInsertEmoji={handleInsertEmoji}
          onAddAttachment={(file) => setAttachments((prev) => [...prev, file])}
          onInsertSignature={() => updateContentWithHistory(content + DEFAULT_ADMIN_SIGNATURE)}
          onSubmit={onSubmit}
          onReset={() => {
            setAttachments([]);
            onReset();
          }}
        />
      </div>
    </div>
  );
}
