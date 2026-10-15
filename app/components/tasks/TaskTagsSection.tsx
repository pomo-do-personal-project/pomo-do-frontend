"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tag, Plus, X, Check, Tag as TagIcon, Sparkles } from "lucide-react";
import { TaskDto, TagDto } from "../../types/api";
import { useTagStore } from "../../stores/useTagStore";
import { useTranslation } from "../../stores/useLanguageStore";

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#64748B", // Slate
];

interface TaskTagsSectionProps {
  task: TaskDto;
  onUpdateTags: (tagIds: string[]) => Promise<void>;
}

export function TaskTagsSection({ task, onUpdateTags }: TaskTagsSectionProps) {
  const { t } = useTranslation();
  const { tags: allTags, fetchTags, createTag } = useTagStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setErrorMsg(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTagIds = task.tags?.map((t) => t.id) || [];

  const handleToggleTag = async (tagId: string) => {
    let nextTagIds: string[];
    if (currentTagIds.includes(tagId)) {
      nextTagIds = currentTagIds.filter((id) => id !== tagId);
    } else {
      nextTagIds = [...currentTagIds, tagId];
    }
    await onUpdateTags(nextTagIds);
  };

  const handleRemoveTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTagIds = currentTagIds.filter((id) => id !== tagId);
    await onUpdateTags(nextTagIds);
  };

  const handleCreateAndAssignTag = async () => {
    const cleanName = newTagName.trim();
    if (!cleanName) return;

    setIsCreating(true);
    setErrorMsg(null);
    try {
      const created = await createTag({
        name: cleanName,
        colorHex: selectedColor,
      });

      if (created) {
        const nextTagIds = [...currentTagIds, created.id];
        await onUpdateTags(nextTagIds);
        setNewTagName("");
        setSelectedColor(PRESET_COLORS[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi tạo thẻ tag";
      setErrorMsg(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40 mb-6 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <TagIcon size={14} className="text-neutral-400" />
          <span>{t.tasks.tagsTitle}</span>
        </span>
      </div>

      {/* Danh sách thẻ đang được gán */}
      <div className="flex flex-wrap items-center gap-2">
        {task.tags && task.tags.length > 0 ? (
          task.tags.map((tag) => (
            <span
              key={tag.id}
              style={{
                borderColor: `${tag.colorHex}60`,
                backgroundColor: `${tag.colorHex}18`,
                color: tag.colorHex,
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border shadow-2xs transition-all"
            >
              <span
                style={{ backgroundColor: tag.colorHex }}
                className="w-2 h-2 rounded-full shrink-0"
              />
              <span className="truncate max-w-[120px]">{tag.name}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveTag(tag.id, e)}
                title="Gỡ thẻ này"
                className="hover:opacity-75 p-0.5 rounded-full cursor-pointer ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
            Chưa có thẻ phân loại
          </span>
        )}

        {/* Nút bấm mở popover gán thẻ */}
        <div className="relative inline-block" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer border border-transparent shadow-2xs"
          >
            <Plus size={13} />
            <span>Gán thẻ</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-40 p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Chọn hoặc tạo thẻ tag
              </div>

              {/* Ô tìm kiếm */}
              <input
                type="text"
                placeholder="Tìm thẻ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
              />

              {/* Danh sách các thẻ hiện có */}
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1 pr-1">
                {filteredTags.length > 0 ? (
                  filteredTags.map((t) => {
                    const isChecked = currentTagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleTag(t.id)}
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
                        {isChecked && (
                          <Check size={14} className="text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-[11px] text-neutral-400 text-center py-2">
                    Không tìm thấy thẻ nào
                  </span>
                )}
              </div>

              {/* Phân cách tạo thẻ mới */}
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
                        handleCreateAndAssignTag();
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateAndAssignTag}
                    disabled={isCreating || !newTagName.trim()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    Tạo
                  </button>
                </div>

                {/* Chọn màu sắc preset */}
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
          )}
        </div>
      </div>
    </div>
  );
}
