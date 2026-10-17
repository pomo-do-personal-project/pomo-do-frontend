"use client";

import React from "react";
import { Check } from "lucide-react";
import { TagDto } from "../../types/api";

export const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#6366F1", "#64748B",
];

interface TaskTagsDropdownProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredTags: TagDto[];
  currentTagIds: string[];
  onToggleTag: (tagId: string) => void;
  newTagName: string;
  setNewTagName: (val: string) => void;
  selectedColor: string;
  setSelectedColor: (val: string) => void;
  onCreateTag: () => void;
  isCreating: boolean;
  errorMsg: string | null;
}

export function TaskTagsDropdown({
  searchTerm, setSearchTerm, filteredTags, currentTagIds, onToggleTag,
  newTagName, setNewTagName, selectedColor, setSelectedColor, onCreateTag,
  isCreating, errorMsg,
}: TaskTagsDropdownProps) {
  return (
    <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-40 p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
        Chọn hoặc tạo thẻ tag
      </div>

      <input
        type="text"
        placeholder="Tìm thẻ..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
      />

      <div className="max-h-40 overflow-y-auto flex flex-col gap-1 pr-1">
        {filteredTags.length > 0 ? (
          filteredTags.map((t) => {
            const isChecked = currentTagIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTag(t.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isChecked
                    ? "bg-neutral-100 dark:bg-neutral-800 font-semibold"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    style={{ backgroundColor: t.colorHex }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                  />
                  <span className="truncate text-neutral-800 dark:text-neutral-200">
                    {t.name}
                  </span>
                </div>
                {isChecked && <Check size={14} className="text-emerald-500 shrink-0" />}
              </button>
            );
          })
        ) : (
          <span className="text-[11px] text-neutral-400 text-center py-2">
            Không tìm thấy thẻ nào
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-neutral-400 uppercase">
          Tạo thẻ tag mới
        </span>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Tên thẻ mới..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCreateTag();
              }
            }}
            className="flex-1 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={onCreateTag}
            disabled={isCreating || !newTagName.trim()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            Tạo
          </button>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              style={{ backgroundColor: color }}
              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                selectedColor === color
                  ? "ring-2 ring-offset-2 ring-emerald-500 scale-110"
                  : "hover:scale-105"
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <span className="text-[10px] text-rose-500 font-medium">
            {errorMsg}
          </span>
        )}
      </div>
    </div>
  );
}
