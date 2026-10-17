"use client";

import React from "react";
import { Minus, Maximize2, Minimize2, X } from "lucide-react";

interface GmailComposeHeaderProps {
  title?: string;
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function GmailComposeHeader({
  title = "Thư mới",
  onClose,
  isMaximized = false,
  onToggleMaximize,
  isMinimized = false,
  onToggleMinimize,
}: GmailComposeHeaderProps) {
  return (
    <div
      onClick={isMinimized ? onToggleMinimize : undefined}
      className={`px-4 py-2.5 bg-[#f2f6fc] dark:bg-[#202124] flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200/80 dark:border-neutral-800 select-none ${
        isMinimized ? "cursor-pointer hover:bg-[#e8eff8] dark:hover:bg-[#282a2e]" : ""
      }`}
    >
      <span className="truncate max-w-[240px]">{title}</span>
      <div className="flex items-center gap-1 text-neutral-500" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onToggleMinimize}
          title={isMinimized ? "Phóng to cửa sổ" : "Thu nhỏ"}
          className="hover:text-neutral-900 dark:hover:text-white p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={onToggleMaximize}
          title={isMaximized ? "Thu nhỏ về góc" : "Toàn màn hình"}
          className="hover:text-neutral-900 dark:hover:text-white p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
        >
          {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Đóng / Xóa"
          className="hover:text-neutral-900 dark:hover:text-white p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
