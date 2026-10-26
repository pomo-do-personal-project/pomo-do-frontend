"use client";

import React, { useState } from "react";
import { TagDto } from "../../types/api";
import { Check, X, Edit2, Trash2 } from "lucide-react";
import { PRESET_COLORS } from "./TaskTagsDropdown";

interface TagItemRowProps {
  tag: TagDto;
  isEditing: boolean;
  onStartEdit: (tag: TagDto) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string, name: string) => void;
  onSelect?: (tagName: string) => void;
  onClose?: () => void;
}

export function TagItemRow({
  tag,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onSelect,
  onClose,
}: TagItemRowProps) {
  const [editName, setEditName] = useState(tag.name);
  const [editColor, setEditColor] = useState(tag.colorHex || PRESET_COLORS[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!editName.trim() || isUpdating) return;
    try {
      setIsUpdating(true);
      await onSaveEdit(tag.id, editName.trim(), editColor);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-600 flex flex-col gap-2 animate-in fade-in duration-150">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdating || !editName.trim()}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Lưu thay đổi"
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs transition-colors cursor-pointer"
            title="Hủy"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setEditColor(color)}
              style={{ backgroundColor: color }}
              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                editColor === color
                  ? "ring-2 ring-offset-1 ring-emerald-500 scale-110"
                  : "hover:scale-105"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group">
      <div
        onClick={() => {
          if (onSelect) {
            onSelect(tag.name);
            onClose?.();
          }
        }}
        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
      >
        <span
          style={{ backgroundColor: tag.colorHex || "#10B981" }}
          className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
        />
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
          {tag.name}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onStartEdit(tag)}
          className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          title="Sửa thẻ"
        >
          <Edit2 size={13} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(tag.id, tag.name)}
          className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          title="Xóa thẻ"
        >
          <Trash2 size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
