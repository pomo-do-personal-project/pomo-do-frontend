"use client";

import React, { useRef, useEffect } from "react";

interface GmailEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const EMOJIS = [
  "📢", "⚠️", "🔥", "✨", "🎉", "🚀",
  "💡", "📌", "✅", "❌", "ℹ️", "⚡",
  "👋", "🙏", "❤️", "👍", "👏", "🎯",
  "⏰", "📅", "🔒", "🛠️", "💬", "⭐",
];

export function GmailEmojiPicker({
  isOpen,
  onClose,
  onSelectEmoji,
}: GmailEmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-24 mb-2 p-3 bg-white dark:bg-[#1C1D21] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 z-50 w-64 animate-in fade-in slide-in-from-bottom-2 select-none"
    >
      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
        Biểu tượng cảm xúc
      </div>
      <div className="grid grid-cols-6 gap-1 text-lg">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
