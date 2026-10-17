"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Mail } from "lucide-react";
import { AdminUserSummary } from "../../types/admin";
import { adminService } from "../../services/adminService";

export interface EmailRecipient {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
}

interface GmailRecipientsRowProps {
  recipients?: EmailRecipient[];
  onAddRecipient?: (recipient: EmailRecipient) => void;
  onRemoveRecipient?: (index: number) => void;
  availableUsers?: AdminUserSummary[];
  onClose?: () => void;
}

export function GmailRecipientsRow({
  recipients = [],
  onAddRecipient,
  onRemoveRecipient,
  availableUsers = [],
  onClose,
}: GmailRecipientsRowProps) {
  const [query, setQuery] = useState("");
  const [remoteUsers, setRemoteUsers] = useState<AdminUserSummary[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  useEffect(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) {
      setRemoteUsers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await adminService.getUsers({ search: term, pageSize: 6 });
        if (res?.items) setRemoteUsers(res.items);
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const cleanTerm = query.trim().toLowerCase();
  const existingEmails = new Set(recipients.map((r) => r.email.toLowerCase()));

  const filtered = [
    ...availableUsers.filter(
      (u) =>
        (u.email.toLowerCase().includes(cleanTerm) || u.displayName.toLowerCase().includes(cleanTerm)) &&
        !existingEmails.has(u.email.toLowerCase())
    ),
    ...remoteUsers.filter(
      (u) =>
        (u.email.toLowerCase().includes(cleanTerm) || u.displayName.toLowerCase().includes(cleanTerm)) &&
        !existingEmails.has(u.email.toLowerCase()) &&
        !availableUsers.some((au) => au.id === u.id)
    ),
  ].slice(0, 6);

  const handleSelectUser = (u: AdminUserSummary) => {
    onAddRecipient?.({ id: u.id, email: u.email, name: u.displayName, avatarUrl: u.avatarUrl });
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleAddCustom = (val: string) => {
    const clean = val.trim().replace(/,/g, "");
    if (!clean) return;
    onAddRecipient?.({ email: clean });
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (filtered.length > 0 && highlightIdx < filtered.length && !query.includes("@")) {
        handleSelectUser(filtered[highlightIdx]);
      } else if (query.trim()) {
        handleAddCustom(query);
      }
    } else if (e.key === "Backspace" && !query && recipients.length > 0) {
      onRemoveRecipient?.(recipients.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative px-4 py-2 flex items-center gap-3 border-b border-neutral-200/70 dark:border-neutral-800 text-xs sm:text-sm shrink-0"
    >
      <span className="text-neutral-500 dark:text-neutral-400 w-20 shrink-0 font-medium">Người nhận</span>
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1.5 flex-1 min-h-[32px] cursor-text"
      >
        {recipients.map((r, idx) => (
          <span
            key={r.id || `${r.email}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium text-xs border border-blue-200 dark:border-blue-800/60 shrink-0"
          >
            <span className="truncate max-w-[200px]" title={r.email}>
              {r.name && r.name !== r.email ? `${r.name} (${r.email})` : r.email}
            </span>
            {onRemoveRecipient && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecipient(idx);
                }}
                className="text-blue-400 hover:text-blue-700 dark:hover:text-white rounded-full p-0.5 cursor-pointer"
                title="Xóa người nhận"
              >
                ✕
              </button>
            )}
          </span>
        ))}

        {onAddRecipient ? (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setHighlightIdx(0);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={recipients.length === 0 ? "Nhập email hoặc tên người dùng..." : ""}
            className="flex-1 min-w-[130px] bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none py-1"
          />
        ) : (
          recipients.length === 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs border border-neutral-200 dark:border-neutral-700/60">
              <Users size={13} className="text-blue-500" />
              <span>Toàn bộ người dùng</span>
            </span>
          )
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer ml-auto shrink-0"
          title="Đóng"
        >
          ✕
        </button>
      )}

      {showDropdown && (query.trim() || (availableUsers.length > 0 && recipients.length < availableUsers.length)) && (
        <div className="absolute left-20 sm:left-24 top-full mt-1 w-80 max-h-56 overflow-y-auto bg-white dark:bg-[#1E1F24] border border-neutral-200 dark:border-neutral-700/80 rounded-xl shadow-2xl z-50 py-1 divide-y divide-neutral-100 dark:divide-neutral-800">
          {availableUsers.length > 0 && recipients.length < availableUsers.length && !query.trim() && (
            <button
              type="button"
              onClick={() => {
                availableUsers.forEach((u) => onAddRecipient?.({ id: u.id, email: u.email, name: u.displayName, avatarUrl: u.avatarUrl }));
                setQuery("");
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 text-left bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-xs font-semibold text-sky-700 dark:text-sky-300 cursor-pointer"
            >
              <Users size={14} className="text-sky-500 shrink-0" />
              <span>+ Thêm tất cả {availableUsers.length} người dùng web</span>
            </button>
          )}
          {filtered.map((u, i) => (
            <button
              type="button"
              key={u.id}
              onClick={() => handleSelectUser(u)}
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                i === highlightIdx ? "bg-blue-50 dark:bg-blue-950/50" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                {u.displayName?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                  {u.displayName || "Người dùng"}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{u.email}</div>
              </div>
            </button>
          ))}
          {query.trim() && (
            <button
              type="button"
              onClick={() => handleAddCustom(query)}
              className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              <Mail size={14} className="text-blue-500 shrink-0" />
              <span className="truncate">Thêm &quot;<b>{query.trim()}</b>&quot; làm người nhận</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
