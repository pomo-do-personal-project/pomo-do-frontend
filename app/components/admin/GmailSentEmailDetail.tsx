"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { SentNotificationItem } from "./NotificationSentList";

interface GmailSentEmailDetailProps {
  item: SentNotificationItem;
  onBack: () => void;
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onDelete?: () => void;
}

export function GmailSentEmailDetail({
  item,
  onBack,
}: GmailSentEmailDetailProps) {
  const [showDetails, setShowDetails] = useState(false);

  const senderInitial = "M";
  const senderName = "Admin Pomo-do";
  const senderEmail = "admin@pomo-do.com";

  return (
    <div className="bg-[#000000] text-neutral-100 flex-1 flex flex-col w-full min-h-[calc(100vh-65px)] rounded-none border-0 select-text">
      {/* 1. Clean Top Bar - Only Back Arrow, No redundant icons */}
      <div className="px-6 lg:px-10 py-3 border-b border-neutral-800/80 flex items-center justify-between select-none bg-[#000000] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-neutral-900 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Quay lại danh sách thông báo"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-semibold text-neutral-400">Chi tiết thông báo</span>
        </div>

        <div className="text-xs text-neutral-500 font-medium">
          {item.sentAt}
        </div>
      </div>

      {/* 2. Main Email Content Canvas (Deep Black Background) */}
      <div className="flex-1 flex flex-col w-full px-6 sm:px-12 lg:px-16 py-8">
        {/* Subject Header */}
        <div className="pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {item.title}
            </h1>
            {item.scope === "broadcast" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Phát sóng App (Banner)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Hộp thư Gmail (Email)
              </span>
            )}
          </div>
        </div>

        {/* Sender & Recipient Bar (No Star, Smile, Reply, or 3-dots) */}
        <div className="py-3 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#c5221f] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {senderInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white">{senderName}</span>
                <span className="text-xs text-neutral-400 truncate">&lt;{senderEmail}&gt;</span>
              </div>
              <div className="relative inline-block mt-0.5">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  <span>đến {item.targetText}</span>
                  <ChevronDown size={13} className={`transition-transform ${showDetails ? "rotate-180" : ""}`} />
                </button>
                {showDetails && (
                  <div className="absolute left-0 top-full mt-1.5 w-80 p-3.5 bg-[#0a0a0c] border border-neutral-800 rounded-2xl shadow-2xl text-xs z-30 space-y-1.5">
                    <div className="grid grid-cols-[60px_1fr] gap-1"><span className="text-neutral-500">từ:</span><span className="font-medium text-white">{senderName} &lt;{senderEmail}&gt;</span></div>
                    <div className="grid grid-cols-[60px_1fr] gap-1"><span className="text-neutral-500">đến:</span><span className="font-medium text-white">{item.targetText}</span></div>
                    <div className="grid grid-cols-[60px_1fr] gap-1"><span className="text-neutral-500">ngày:</span><span className="text-neutral-300">{item.sentAt}</span></div>
                    <div className="grid grid-cols-[60px_1fr] gap-1"><span className="text-neutral-500">tiêu đề:</span><span className="text-neutral-300">{item.title}</span></div>
                    <div className="grid grid-cols-[60px_1fr] gap-1"><span className="text-neutral-500">bảo mật:</span><span className="text-emerald-400">Chuẩn mã hóa tiêu chuẩn (TLS)</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-500 shrink-0">
            {item.sentAt}
          </div>
        </div>

        {/* Read-Only Email Content Body */}
        <div className="py-8 flex-1 text-sm sm:text-base text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
          {item.content}
        </div>
      </div>
    </div>
  );
}
