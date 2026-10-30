"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tag, Plus, X } from "lucide-react";
import { TaskDto } from "../../types/api";
import { useTagStore } from "../../stores/useTagStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useTranslation } from "../../stores/useLanguageStore";
import { TaskTagsDropdown, PRESET_COLORS } from "./TaskTagsDropdown";

interface TaskTagsSectionProps {
  task: TaskDto;
  onUpdateTags: (tagIds: string[]) => Promise<void>;
}

export function TaskTagsSection({ task, onUpdateTags }: TaskTagsSectionProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setErrorMsg(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTagIds = task.tags?.map((t) => t.id) || [];

  const handleToggleTag = async (tagId: string) => {
    const nextTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];
    await onUpdateTags(nextTagIds);
  };

  const handleRemoveTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTagIds = currentTagIds.filter((id) => id !== tagId);
    await onUpdateTags(nextTagIds);
  };

  const handleCreateAndAssignTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    try {
      setIsCreating(true);
      setErrorMsg(null);
      const existing = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        if (!currentTagIds.includes(existing.id)) {
          await onUpdateTags([...currentTagIds, existing.id]);
        }
        setNewTagName("");
        setSearchTerm("");
        return;
      }
      const created = await createTag({ name: trimmed, colorHex: selectedColor });
      if (created) {
        await onUpdateTags([...currentTagIds, created.id]);
      }
      setNewTagName("");
      setSearchTerm("");
    } catch (err: unknown) {
      await fetchTags();
      const existing = useTagStore.getState().tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
      if (existing && !currentTagIds.includes(existing.id)) {
        await onUpdateTags([...currentTagIds, existing.id]);
        setNewTagName("");
        setSearchTerm("");
        return;
      }
      const msg = err instanceof Error ? err.message : "Không thể tạo thẻ tag";
      setErrorMsg(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold ${
          wallpaperUrl ? "text-white/70" : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        <Tag size={14} className="text-emerald-500 shrink-0" />
        <span>Thẻ tag phân loại</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
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
              <span style={{ backgroundColor: tag.colorHex }} className="w-2 h-2 rounded-full shrink-0" />
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
          <span
            className={`text-xs italic ${
              wallpaperUrl ? "text-white/40" : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            Chưa có thẻ phân loại
          </span>
        )}

        <div className="relative inline-block" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer border shadow-2xs ${
              wallpaperUrl
                ? "bg-white/15 text-white hover:bg-white/25 border-white/15"
                : "bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 border-transparent"
            }`}
          >
            <Plus size={13} />
            <span>Gán thẻ</span>
          </button>

          {isDropdownOpen && (
            <TaskTagsDropdown
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredTags={filteredTags}
              currentTagIds={currentTagIds}
              onToggleTag={handleToggleTag}
              newTagName={newTagName}
              setNewTagName={setNewTagName}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              onCreateTag={handleCreateAndAssignTag}
              isCreating={isCreating}
              errorMsg={errorMsg}
            />
          )}
        </div>
      </div>
    </div>
  );
}
