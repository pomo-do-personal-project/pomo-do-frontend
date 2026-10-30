"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Trash2,
  Link2,
  Smile,
  Clock,
  PenLine,
  MoreVertical,
} from "lucide-react";
import { GmailEmojiPicker } from "./GmailEmojiPicker";

interface GmailBottomActionBarProps {
  scheduleOption: "immediate" | "scheduled";
  setScheduleOption: (opt: "immediate" | "scheduled") => void;
  showFormatBar: boolean;
  setShowFormatBar: React.Dispatch<React.SetStateAction<boolean>>;
  showUrlField: boolean;
  setShowUrlField: React.Dispatch<React.SetStateAction<boolean>>;
  onInsertEmoji: (emoji: string) => void;
  onInsertSignature: () => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function GmailBottomActionBar({
  scheduleOption,
  setScheduleOption,
  showFormatBar,
  setShowFormatBar,
  showUrlField,
  setShowUrlField,
  onInsertEmoji,
  onInsertSignature,
  onSubmit,
  onReset,
}: GmailBottomActionBarProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const scheduleRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (scheduleRef.current && !scheduleRef.current.contains(e.target as Node)) {
        setIsScheduleOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative px-4 sm:px-5 py-3 bg-[#f2f6fc]/80 dark:bg-[#1C1D21] border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between select-none shrink-0">

      <GmailEmojiPicker isOpen={isEmojiOpen} onClose={() => setIsEmojiOpen(false)} onSelectEmoji={onInsertEmoji} />

      {/* Left Action Toolbar */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Blue Send Split Pill */}
        <div ref={scheduleRef} className="relative inline-flex items-center rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-xs shrink-0">
          <button type="button" onClick={onSubmit} className="px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold cursor-pointer">
            {scheduleOption === "scheduled" ? "Lên lịch gửi" : "Gửi"}
          </button>
          <div className="w-px h-5 bg-white/30" />
          <button type="button" onClick={() => setIsScheduleOpen(!isScheduleOpen)} className="px-2.5 sm:px-3 py-2 sm:py-2.5 hover:bg-[#0842a0] rounded-r-full cursor-pointer text-white">
            <ChevronDown size={15} />
          </button>

          {isScheduleOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-44 bg-white dark:bg-[#1C1D21] rounded-xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 py-1.5 z-30 text-xs sm:text-sm">
              <button type="button" onClick={() => { setScheduleOption("immediate"); setIsScheduleOpen(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">Gửi ngay</button>
              <button type="button" onClick={() => { setScheduleOption("scheduled"); setIsScheduleOpen(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">Lên lịch gửi...</button>
            </div>
          )}
        </div>

        {/* Action Icons */}
        <button type="button" onClick={() => setShowFormatBar((p) => !p)} title="Định dạng" className={`p-2 rounded-full cursor-pointer text-xs sm:text-sm font-bold shrink-0 ${showFormatBar ? "bg-[#d3e3fd] text-[#0b57d0]" : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5"}`}>Aa</button>
        <button type="button" onClick={() => setShowUrlField((p) => !p)} title="Chèn liên kết" className={`p-2 rounded-full cursor-pointer shrink-0 ${showUrlField ? "bg-[#d3e3fd] text-[#0b57d0]" : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5"}`}><Link2 size={17} /></button>
        <button type="button" onClick={() => setIsEmojiOpen(!isEmojiOpen)} title="Biểu tượng cảm xúc" className="p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-black/5 cursor-pointer shrink-0"><Smile size={17} /></button>
        <button type="button" onClick={() => setScheduleOption(scheduleOption === "scheduled" ? "immediate" : "scheduled")} title="Lên lịch gửi" className={`p-2 rounded-full cursor-pointer shrink-0 ${scheduleOption === "scheduled" ? "bg-[#d3e3fd] text-[#0b57d0]" : "text-neutral-600 dark:text-neutral-400 hover:bg-black/5"}`}><Clock size={17} /></button>
        <button type="button" onClick={onInsertSignature} title="Chèn chữ ký" className="p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-black/5 cursor-pointer shrink-0"><PenLine size={17} /></button>

        <div ref={moreRef} className="relative shrink-0">
          <button type="button" onClick={() => setIsMoreOpen(!isMoreOpen)} title="Khác" className="p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-black/5 cursor-pointer"><MoreVertical size={17} /></button>
          {isMoreOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-[#1C1D21] rounded-xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 py-1.5 z-30 text-xs sm:text-sm">
              <button type="button" onClick={() => { onInsertSignature(); setIsMoreOpen(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">Chèn chữ ký</button>
              <button type="button" onClick={() => { setShowUrlField(true); setIsMoreOpen(false); }} className="w-full px-4 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">Mở ô link URL</button>
            </div>
          )}
        </div>
      </div>

      <button type="button" onClick={onReset} title="Xóa nháp" className="p-2 rounded-full hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer shrink-0">
        <Trash2 size={17} />
      </button>
    </div>
  );
}
