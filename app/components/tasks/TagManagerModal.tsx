"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TagDto } from "../../types/api";
import { useTagStore } from "../../stores/useTagStore";
import { X, Plus, Tag } from "lucide-react";
import { PRESET_COLORS } from "./TaskTagsDropdown";
import { TagItemRow } from "./TagItemRow";

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag?: (tagName: string) => void;
}

export function TagManagerModal({ isOpen, onClose, onSelectTag }: TagManagerModalProps) {
  const { tags, createTag, updateTag, deleteTag } = useTagStore();

  const [mounted, setMounted] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || isCreating) return;

    try {
      setIsCreating(true);
      setCreateError(null);
      await createTag({
        name: newTagName.trim(),
        colorHex: newTagColor,
      });
      setNewTagName("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Không thể tạo thẻ mới");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveEdit = async (id: string, name: string, color: string) => {
    await updateTag(id, { name, colorHex: color });
    setEditingTagId(null);
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thẻ "${name}"? Các công việc đang gắn thẻ này sẽ không bị xóa.`)) {
      await deleteTag(id);
      if (editingTagId === id) setEditingTagId(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl flex flex-col gap-5 text-left max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Tag size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Quản lý Thẻ phân loại
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Thêm, sửa tên hoặc xóa thẻ gắn nhãn công việc
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Form Thêm Thẻ Mới (Create) */}
        <form onSubmit={handleCreateTag} className="flex flex-col gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Tạo thẻ mới
          </span>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nhập tên thẻ mới (VD: Đồ án, Học tập...)"
              className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={isCreating || !newTagName.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>{isCreating ? "Đang tạo..." : "Thêm thẻ"}</span>
            </button>
          </div>

          {/* Color palette selector */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mr-1">Màu sắc:</span>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewTagColor(color)}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                  newTagColor === color
                    ? "ring-2 ring-offset-2 ring-emerald-500 scale-110"
                    : "hover:scale-105 opacity-80 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          {createError && (
            <span className="text-xs text-rose-500 font-semibold">{createError}</span>
          )}
        </form>

        {/* 2. Danh sách Thẻ hiện có (Read, Update, Delete) */}
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            <span>Danh sách thẻ ({tags.length})</span>
          </div>

          {tags.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-400 italic">
              Chưa có thẻ nào được tạo. Hãy thêm thẻ đầu tiên ở trên!
            </div>
          ) : (
            tags.map((tag) => (
              <TagItemRow
                key={tag.id}
                tag={tag}
                isEditing={editingTagId === tag.id}
                onStartEdit={(t) => setEditingTagId(t.id)}
                onCancelEdit={() => setEditingTagId(null)}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteTag}
                onSelect={onSelectTag}
                onClose={onClose}
              />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
