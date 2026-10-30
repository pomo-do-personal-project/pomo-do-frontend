"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ThemeColors } from "../../../types/theme";
import { ThemeCluster } from "../../../lib/colorHarmonizer";
import { storageService } from "../../../services/storageService";
import { assetService } from "../../../services/assetService";
import { AdminThemeStudioLivePreview } from "./AdminThemeStudioLivePreview";
import {
  analyzeImageForTheme,
  publishThemeStudioAsset,
  AVAILABLE_STUDIO_CATEGORIES,
  CATEGORY_BADGES,
} from "./themeStudioHelpers";

interface AdminThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
}

export function AdminThemeStudioModal({ isOpen, onClose, onPublished }: AdminThemeStudioModalProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [assetName, setAssetName] = useState("");
  const [category, setCategory] = useState<string>(AVAILABLE_STUDIO_CATEGORIES[0] || "#CitySeries");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ThemeColors | null>(null);
  const [algorithm, setAlgorithm] = useState<string | undefined>(undefined);
  const [clusters, setClusters] = useState<ThemeCluster[] | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewImageUrl?.startsWith("blob:")) URL.revokeObjectURL(previewImageUrl);
    };
  }, [previewImageUrl]);

  const handleClose = () => {
    if (previewImageUrl?.startsWith("blob:")) URL.revokeObjectURL(previewImageUrl);
    setPreviewImageUrl(null);
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleProcessImage = async (input: string | File, defaultName?: string) => {
    try {
      setIsAnalyzing(true);
      setErrorMsg(null);
      const res = await analyzeImageForTheme(input);
      const displayUrl = typeof input === "string" ? input : URL.createObjectURL(input);
      setPreviewImageUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return displayUrl;
      });
      setPalette(res.palette);
      setAlgorithm(res.algorithm);
      setClusters(res.clusters);
      if (defaultName && !assetName) setAssetName(defaultName);
    } catch {
      setErrorMsg("Không thể phân tích màu từ ảnh này. Vui lòng kiểm tra lại ảnh hoặc link URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    await handleProcessImage(file, cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedFile(null);
    await handleProcessImage(urlInput.trim(), "Hình nền mới");
  };

  const handlePublish = async () => {
    if (!previewImageUrl || !assetName.trim()) return;
    try {
      setIsPublishing(true);
      setErrorMsg(null);
      await publishThemeStudioAsset({
        previewImageUrl, assetName, category, selectedFile, storageService, assetService,
      });
      onPublished?.();
      handleClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Xuất bản tài nguyên thất bại.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog" aria-modal="true" aria-labelledby="theme-studio-modal-title"
        className="relative w-full max-w-2xl bg-white dark:bg-[#18191c] rounded-3xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 id="theme-studio-modal-title" className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Studio Phân Tích &amp; Phối Màu Theme
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Phân tích màu sắc bằng Python AI (CIELAB K-Means++) chuẩn quy tắc 60-30-10 &amp; WCAG 2.1 AA.
            </p>
          </div>
          <button
            type="button" onClick={handleClose} aria-label="Đóng"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl w-fit text-xs font-semibold">
            <button
              type="button" onClick={() => setUploadMode("file")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${uploadMode === "file" ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
            >
              <Upload size={13} /><span>Tải file từ máy</span>
            </button>
            <button
              type="button" onClick={() => setUploadMode("url")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${uploadMode === "url" ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
            >
              <LinkIcon size={13} /><span>Dán liên kết URL</span>
            </button>
          </div>

          {uploadMode === "file" ? (
            <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-all text-center">
              <Upload size={22} className="text-neutral-400 dark:text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {selectedFile ? selectedFile.name : "Nhấp để chọn ảnh hoặc kéo thả vào đây"}
              </span>
              <span className="text-[10px] text-neutral-400">Hỗ trợ PNG, JPG, WebP (Khuyên dùng tỉ lệ 16:9)</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url" required placeholder="https://images.unsplash.com/... (URL ảnh trực tiếp)"
                value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit" disabled={isAnalyzing || !urlInput.trim()}
                className="px-3.5 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : "Phân tích"}
              </button>
            </form>
          )}

          <AdminThemeStudioLivePreview
            imageUrl={previewImageUrl} palette={palette} assetName={assetName}
            algorithm={algorithm} clusters={clusters}
          />

          {previewImageUrl && (
            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tên hiển thị hình nền *
                </label>
                <input
                  type="text" required placeholder="VD: Sydney Opera Sunset, Đêm sa mạc Cairo..."
                  value={assetName} onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Thể loại / Bộ sưu tập
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_STUDIO_CATEGORIES.map((cat) => {
                    const badge = CATEGORY_BADGES.find((b) => b.id === cat);
                    return (
                      <button
                        key={cat} type="button" onClick={() => setCategory(category === cat ? "" : cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${category === cat ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                          }`}
                      >
                        {badge ? badge.label : cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-5">
          <button
            type="button" onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-xs font-medium"
          >
            Hủy
          </button>
          <button
            type="button" onClick={handlePublish}
            disabled={isPublishing || !previewImageUrl || !assetName.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 text-xs flex items-center gap-1.5"
          >
            {isPublishing ? (
              <><Loader2 size={13} className="animate-spin" /><span>Đang xuất bản...</span></>
            ) : (
              <><CheckCircle2 size={14} /><span>Lưu &amp; Xuất bản Theme</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
