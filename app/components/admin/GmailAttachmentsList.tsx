"use client";

import React from "react";
import { FileText, X } from "lucide-react";

interface GmailAttachmentsListProps {
  attachments: File[];
  onRemove: (index: number) => void;
}

export function GmailAttachmentsList({ attachments, onRemove }: GmailAttachmentsListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
      {attachments.map((file, idx) => (
        <div
          key={idx}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#1C1D21] text-[11px] font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800"
        >
          <FileText size={13} className="text-blue-500" />
          <span className="max-w-[140px] truncate">{file.name}</span>
          <span className="text-neutral-400 text-[10px]">({Math.round(file.size / 1024)} KB)</span>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="hover:text-rose-500 p-0.5 cursor-pointer ml-1"
          >
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}
