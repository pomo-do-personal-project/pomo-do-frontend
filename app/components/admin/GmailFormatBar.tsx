"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Baseline,
  AlignLeft,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "../../stores/useLanguageStore";

interface GmailFormatBarProps {
  onApplyFormat: (
    type: "bold" | "italic" | "underline" | "strike" | "quote" | "ol" | "ul" | "clear" | "h1" | "h2"
  ) => void;
  fontFamily: string;
  setFontFamily: (val: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function GmailFormatBar({
  onApplyFormat,
  fontFamily,
  setFontFamily,
  onUndo,
  onRedo,
}: GmailFormatBarProps) {
  const { language } = useTranslation();
  const isVi = language === "vi";
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setIsFontMenuOpen(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
        setIsSizeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fonts = ["Sans Serif", "Serif", "Monospace", "Inter"];

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-[#edf2fa] dark:bg-[#1a2233] text-neutral-700 dark:text-neutral-300 text-xs select-none border-b border-neutral-200/60 dark:border-neutral-800">
      {/* Undo & Redo */}
      <button
        type="button"
        onClick={onUndo}
        title={isVi ? "Hoàn tác" : "Undo"}
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <Undo2 size={14} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        title={isVi ? "Làm lại" : "Redo"}
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <Redo2 size={14} />
      </button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Font Family Dropdown */}
      <div ref={fontMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
          className="flex items-center gap-1 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
        >
          <span>{fontFamily}</span>
          <ChevronDown size={12} />
        </button>

        {isFontMenuOpen && (
          <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-[#1C1D21] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1 z-30">
            {fonts.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFontFamily(f);
                  setIsFontMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer ${
                  fontFamily === f ? "font-bold text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Font Size TT Dropdown */}
      <div ref={sizeMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
          className="flex items-center gap-0.5 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer font-bold"
        >
          <span>T<span className="text-[10px]">T</span></span>
          <ChevronDown size={11} />
        </button>

        {isSizeMenuOpen && (
          <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-[#1C1D21] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1 z-30">
            <button
              type="button"
              onClick={() => { onApplyFormat("h1"); setIsSizeMenuOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              {isVi ? "Lớn (Tiêu đề 1)" : "Large (Heading 1)"}
            </button>
            <button
              type="button"
              onClick={() => { onApplyFormat("h2"); setIsSizeMenuOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              {isVi ? "Vừa (Tiêu đề 2)" : "Medium (Heading 2)"}
            </button>
            <button
              type="button"
              onClick={() => { onApplyFormat("clear"); setIsSizeMenuOpen(false); }}
              className="w-full px-3 py-1.5 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              {isVi ? "Bình thường" : "Normal"}
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Bold, Italic, Underline */}
      <button
        type="button"
        onClick={() => onApplyFormat("bold")}
        title="Đậm (Ctrl+B)"
        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-bold"
      >
        <Bold size={14} />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("italic")}
        title="Nghiêng (Ctrl+I)"
        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
      >
        <Italic size={14} />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("underline")}
        title="Gạch chân (Ctrl+U)"
        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
      >
        <Underline size={14} />
      </button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => onApplyFormat("ol")}
        title="Danh sách số"
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <ListOrdered size={14} />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat("ul")}
        title="Danh sách dấu đầu dòng"
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <List size={14} />
      </button>

      {/* Quote & Strikethrough & Clear */}
      <button
        type="button"
        onClick={() => onApplyFormat("quote")}
        title="Trích dẫn"
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <Quote size={14} />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat("strike")}
        title="Gạch ngang chữ"
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <Strikethrough size={14} />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat("clear")}
        title="Xóa định dạng"
        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer"
      >
        <RemoveFormatting size={14} />
      </button>
    </div>
  );
}
