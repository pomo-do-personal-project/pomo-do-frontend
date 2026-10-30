"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AssetType, SystemAssetDto } from "../../../types/asset";
import { AssetTypeSelector } from "./AssetTypeSelector";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit: SystemAssetDto | null;
  onSubmit: (data: {
    assetType: AssetType;
    name: string;
    url: string;
    thumbnailUrl?: string | null;
    category?: string | null;
    isActive: boolean;
    isDefault: boolean;
  }) => Promise<void>;
}

export function AssetModal({
  isOpen,
  onClose,
  assetToEdit,
  onSubmit,
}: AssetModalProps) {
  const [assetType, setAssetType] = useState<AssetType>("wallpaper");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assetToEdit) {
      setAssetType(assetToEdit.assetType);
      setName(assetToEdit.name);
      setUrl(assetToEdit.url);
      setThumbnailUrl(assetToEdit.thumbnailUrl || "");
      setCategory(assetToEdit.category || "");
      setIsActive(assetToEdit.isActive);
      setIsDefault(assetToEdit.isDefault);
    } else {
      setAssetType("wallpaper");
      setName("");
      setUrl("");
      setThumbnailUrl("");
      setCategory("");
      setIsActive(true);
      setIsDefault(false);
    }
    setError(null);
  }, [assetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên tài nguyên.");
      return;
    }
    if (!url.trim()) {
      setError("Vui lòng nhập đường dẫn URL tài nguyên.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        assetType,
        name: name.trim(),
        url: url.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        category: category.trim() || null,
        isActive,
        isDefault,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu tài nguyên.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-modal-title"
        className="relative w-full max-w-md bg-white dark:bg-[#18191c] rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 id="asset-modal-title" className="text-base font-bold text-neutral-900 dark:text-white">
            {assetToEdit ? "Chỉnh sửa tài nguyên" : "Thêm tài nguyên mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Asset Type */}
          <AssetTypeSelector value={assetType} onChange={setAssetType} />

          {/* Name */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Tên tài nguyên *</label>
            <input
              type="text"
              required
              placeholder="VD: Phòng Cozy Lofi, Tiếng mưa rơi..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Đường dẫn URL tài nguyên *</label>
            <input
              type="url"
              required
              placeholder="https://... (Ảnh hoặc file audio .mp3/.ogg)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Thumbnail URL (if wallpaper) */}
          {assetType === "wallpaper" && (
            <div>
              <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Ảnh thu nhỏ (Thumbnail URL - tùy chọn)</label>
              <input
                type="url"
                placeholder="https://... (để trống sẽ dùng URL chính)"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">Thể loại / Hashtag (Tùy chọn)</label>
              {category && (
                <button type="button" onClick={() => setCategory("")} className="text-[10px] text-rose-500 hover:underline cursor-pointer">
                  Bỏ thể loại
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {["#CitySeries", "#Nature", "#Lofi", "#Holiday", "#Cyberpunk"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(category === c ? "" : c)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${category === c ? "bg-emerald-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="#CitySeries, #Nature, #Lofi... hoặc để trống"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Switches: Active & Default */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-md border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Kích hoạt ngay</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded-md border-neutral-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Đặt làm mặc định</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : assetToEdit ? "Lưu thay đổi" : "Tạo tài nguyên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
