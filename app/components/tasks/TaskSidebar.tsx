"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TaskCategory } from "./types";
import { Plus, X, Check } from "lucide-react";
import { useTagStore } from "../../stores/useTagStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { TagManagerModal } from "./TagManagerModal";
import { SidebarTagRow } from "./SidebarTagRow";
import { TagEditModal } from "./TagEditModal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { SidebarCategoryNav } from "./SidebarCategoryNav";

interface TaskSidebarProps {
  currentCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  categoryCounts: {
    Today: number;
    Upcoming: number;
    QuickAdd: number;
    Calendar: number;
  };
  allTags: string[];
  totalTasks: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isDesktopCollapsed?: boolean;
}

export function TaskSidebar({
  currentCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  categoryCounts,
  allTags,
  totalTasks,
  isOpenMobile = false,
  onCloseMobile,
  isDesktopCollapsed = false,
}: TaskSidebarProps) {
  const wallpaperUrl = useSettingsStore((s) => s.settings.wallpaperUrl);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; colorHex?: string } | null>(null);
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
  const { tags: storedTags, fetchTags, updateTag, deleteTag } = useTagStore();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const displayTags = useMemo(() => {
    const list: { id?: string; name: string; colorHex?: string }[] = storedTags.map((t) => ({
      id: t.id,
      name: t.name,
      colorHex: t.colorHex,
    }));
    allTags.forEach((name) => {
      if (!list.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        list.push({ name, colorHex: "#6366f1" });
      }
    });
    return list;
  }, [storedTags, allTags]);

  const handleSelectCat = (cat: TaskCategory) => {
    onSelectCategory(cat);
    onCloseMobile?.();
  };

  const handleSelectT = (tag: string) => {
    onSelectTag(tag);
    onCloseMobile?.();
  };

  const handleSaveEditTag = async (id: string, newName: string, colorHex: string) => {
    await updateTag(id, { name: newName, colorHex });
    if (selectedTag === editingTag?.name) {
      onSelectTag(newName);
    }
    setEditingTag(null);
  };

  const handleConfirmDeleteTag = async () => {
    if (!tagToDelete) return;
    await deleteTag(tagToDelete.id);
    if (selectedTag === tagToDelete.name) {
      onSelectTag("All");
    }
    setTagToDelete(null);
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs lg:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`p-4 flex flex-col shrink-0 transition-all ${
          isOpenMobile
            ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200"
            : isDesktopCollapsed
            ? "hidden"
            : "hidden lg:flex lg:w-60 xl:w-64"
        } ${
          wallpaperUrl
            ? "border-r border-white/10 bg-neutral-900/95 backdrop-blur-2xl text-white"
            : "border-r border-neutral-200/80 bg-neutral-100/95 text-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between px-2 mb-4">
          <h2
            className={`text-[11px] font-bold uppercase tracking-wider ${
              wallpaperUrl ? "text-white/60" : "text-neutral-500"
            }`}
          >
            Danh mục
          </h2>
          {isOpenMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className={`lg:hidden p-1 rounded-lg cursor-pointer ${
                wallpaperUrl ? "text-white/60 hover:text-white" : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        <SidebarCategoryNav
          currentCategory={currentCategory}
          categoryCounts={categoryCounts}
          wallpaperUrl={wallpaperUrl}
          onSelectCategory={handleSelectCat}
        />

        {/* Tags / Custom Lists Filter */}
        <div className="flex items-center justify-between px-2 mb-2">
          <h3
            className={`text-[11px] font-bold uppercase tracking-wider ${
              wallpaperUrl ? "text-white/60" : "text-neutral-500"
            }`}
          >
            Thẻ phân loại
          </h3>
          <button
            type="button"
            onClick={() => setIsTagManagerOpen(true)}
            title="Quản lý thẻ phân loại (Thêm, Sửa, Xóa)"
            className={`p-1 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs hover:scale-105 active:scale-95 ${
              wallpaperUrl
                ? "bg-white/15 hover:bg-white/25 text-white border border-white/15"
                : "bg-white hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200/80"
            }`}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Thêm thẻ</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
          <button
            onClick={() => handleSelectT("All")}
            className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
              selectedTag === "All"
                ? wallpaperUrl
                  ? "bg-white/20 text-white font-semibold backdrop-blur-md ring-1 ring-white/25 shadow-2xs"
                  : "bg-white text-neutral-900 font-semibold border border-neutral-200/80 shadow-2xs"
                : wallpaperUrl
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  wallpaperUrl ? "bg-white/50" : "bg-neutral-400"
                }`}
              />
              <span className="truncate">Tất cả ({totalTasks})</span>
            </div>
            {selectedTag === "All" && (
              <Check
                size={14}
                strokeWidth={2.5}
                className={wallpaperUrl ? "text-emerald-400" : "text-emerald-600"}
              />
            )}
          </button>

          {displayTags.map((tag) => (
            <SidebarTagRow
              key={tag.name}
              tag={tag}
              isSelected={selectedTag === tag.name}
              wallpaperUrl={wallpaperUrl}
              onSelect={handleSelectT}
              onEdit={(t) => setEditingTag(t)}
              onDelete={(t) => setTagToDelete(t)}
            />
          ))}
        </nav>
      </aside>

      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        onSelectTag={onSelectTag}
      />

      <TagEditModal
        isOpen={Boolean(editingTag)}
        tag={editingTag}
        onClose={() => setEditingTag(null)}
        onSave={handleSaveEditTag}
      />

      <ConfirmModal
        isOpen={Boolean(tagToDelete)}
        title="Xóa thẻ phân loại"
        message={`Bạn có chắc chắn muốn xóa thẻ "${tagToDelete?.name}"? Các công việc gắn thẻ này sẽ không bị xóa.`}
        confirmText="Xóa thẻ"
        cancelText="Giữ lại"
        danger={true}
        onConfirm={handleConfirmDeleteTag}
        onCancel={() => setTagToDelete(null)}
      />
    </>
  );
}
