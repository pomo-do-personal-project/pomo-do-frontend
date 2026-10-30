"use client";

import React, { useState, useRef } from "react";
import { Calendar, Eye, Edit3 } from "lucide-react";
import { GmailFormatBar } from "./GmailFormatBar";
import { GmailBottomActionBar } from "./GmailBottomActionBar";
import { GmailRecipientsRow, EmailRecipient } from "./GmailRecipientsRow";
import { AdminUserSummary } from "../../types/admin";
import { applyTextFormat, DEFAULT_ADMIN_SIGNATURE, renderMarkdownToSafePreviewHtml } from "./gmailFormattingHelper";

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
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [showUrlField, setShowUrlField] = useState(Boolean(url));
  const [fontFamily, setFontFamily] = useState("Sans Serif");
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxTitleChars = 100;
  const maxContentChars = 1000;

  // Giới hạn lịch sử tối đa 30 bước để chống rò rỉ bộ nhớ
  const updateContentWithHistory = (newVal: string) => {
    setContent(newVal);
    setHistory((prev) => {
      const next = [...prev.slice(0, historyIndex + 1), newVal];
      if (next.length > 30) return next.slice(next.length - 30);
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
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

  const handleApplyFormat = (type: "bold" | "italic" | "underline" | "strike" | "quote" | "ol" | "ul" | "clear" | "h1" | "h2") => {
    const el = textareaRef.current;
    if (!el) return;
    const { text, newCursorEnd } = applyTextFormat(content, type, el.selectionStart, el.selectionEnd);
    updateContentWithHistory(text);
    setTimeout(() => { el.focus(); el.setSelectionRange(newCursorEnd, newCursorEnd); }, 10);
  };

  const handleInsertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) { updateContentWithHistory(content + emoji); return; }
    const start = el.selectionStart, end = el.selectionEnd;
    updateContentWithHistory(content.slice(0, start) + emoji + content.slice(end));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); }, 10);
  };

  const getFontFamilyClass = () => fontFamily === "Serif" ? "font-serif" : fontFamily === "Monospace" ? "font-mono" : "font-sans";

  return (
    <div className={className || "w-full rounded-2xl bg-white dark:bg-[#151619] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col transition-all"}>
      <GmailRecipientsRow recipients={recipients} onAddRecipient={onAddRecipient} onRemoveRecipient={onRemoveRecipient} availableUsers={availableUsers} onClose={onClose} />

      {/* 2. Row 2: Tiêu đề & Tab Switcher (Soạn thảo / Xem trước) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800 text-xs sm:text-sm shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-neutral-500 dark:text-neutral-400 w-16 shrink-0 font-medium">Tiêu đề</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={maxTitleChars}
            placeholder={recipients ? "Nhập tiêu đề email..." : "Nhập tiêu đề thông báo..."}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />
          <span className="text-[11px] text-neutral-400 font-mono shrink-0 mr-2">
            {title.length}/{maxTitleChars}
          </span>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === "edit"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Edit3 size={12} />
            <span>Soạn thảo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === "preview"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            <Eye size={12} />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* 3. Action URL Field (Toggleable) */}
      {showUrlField && (
        <div className="px-4 py-2 flex items-center gap-3 border-b border-neutral-200/70 dark:border-neutral-800 text-xs sm:text-sm shrink-0 animate-in fade-in">
          <span className="text-neutral-500 dark:text-neutral-400 w-16 shrink-0 font-medium">Liên kết</span>
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
            aria-label="Xóa liên kết"
            className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Message Content Body / Live Preview */}
      <div className="p-3.5 sm:p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
        {activeTab === "edit" ? (
          <textarea
            ref={textareaRef}
            rows={10}
            value={content}
            onChange={(e) => updateContentWithHistory(e.target.value)}
            maxLength={maxContentChars}
            placeholder="Nhập nội dung thông điệp gửi tới người dùng (hỗ trợ Markdown: **đậm**, *nghiêng*, ~~gạch~~, # Tiêu đề)..."
            className={`w-full flex-1 min-h-[140px] bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed ${getFontFamilyClass()}`}
          />
        ) : (
          <div className="flex-1 min-h-[140px] p-3 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/80 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 overflow-y-auto">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between pb-1.5 border-b border-neutral-200/50 dark:border-neutral-700/50">
              <span>Mô phỏng hiển thị Email HTML</span>
              <span className="font-normal lowercase">người nhận sẽ thấy</span>
            </div>
            {title && (
              <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
                {title}
              </h2>
            )}
            <div
              className="leading-relaxed space-y-1"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownToSafePreviewHtml(content),
              }}
            />
            {url && (
              <div className="mt-4 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Truy cập liên kết &rarr;
                </a>
              </div>
            )}
          </div>
        )}
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
        {showFormatBar && activeTab === "edit" && (
          <GmailFormatBar onApplyFormat={handleApplyFormat} fontFamily={fontFamily} setFontFamily={setFontFamily} onUndo={handleUndo} onRedo={handleRedo} />
        )}
        <GmailBottomActionBar
          scheduleOption={scheduleOption} setScheduleOption={setScheduleOption}
          showFormatBar={showFormatBar} setShowFormatBar={setShowFormatBar}
          showUrlField={showUrlField} setShowUrlField={setShowUrlField}
          onInsertEmoji={handleInsertEmoji}
          onInsertSignature={() => updateContentWithHistory(content + DEFAULT_ADMIN_SIGNATURE)}
          onSubmit={onSubmit} onReset={onReset}
        />
      </div>
    </div>
  );
}
