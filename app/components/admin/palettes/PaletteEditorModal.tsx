"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Check, Wand2 } from "lucide-react";
import { ThemePalette, ThemeColors } from "../../../types/theme";

interface PaletteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  paletteToEdit?: ThemePalette | null;
  onSave: (palette: Omit<ThemePalette, "id"> & { id?: string }) => void;
}

export function PaletteEditorModal({
  isOpen,
  onClose,
  paletteToEdit,
  onSave,
}: PaletteEditorModalProps) {
  const [nameVi, setNameVi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [swatchColor, setSwatchColor] = useState("#2563eb");
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>({
    canvasBg: "#f8fafc",
    surfaceBg: "#1e3a5f",
    surfaceElevated: "#ffffff",
    borderSubtle: "#e2e8f0",
    textMuted: "#64748b",
    textHighlight: "#0f172a",
    accentPrimary: "#2563eb",
  });

  useEffect(() => {
    if (paletteToEdit) {
      setNameVi(paletteToEdit.nameVi || paletteToEdit.name);
      setNameEn(paletteToEdit.nameEn || paletteToEdit.name);
      setSwatchColor(paletteToEdit.swatchColor || "#2563eb");
      setIsDark(Boolean(paletteToEdit.isDark));
      setColors({ ...paletteToEdit.colors });
    } else {
      setNameVi("");
      setNameEn("");
      setSwatchColor("#3b82f6");
      setIsDark(false);
      setColors({
        canvasBg: "#f8fafc",
        surfaceBg: "#1e293b",
        surfaceElevated: "#ffffff",
        borderSubtle: "#e2e8f0",
        textMuted: "#64748b",
        textHighlight: "#0f172a",
        accentPrimary: "#3b82f6",
      });
    }
  }, [paletteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleAutoHarmonize = () => {
    // Tự động phối màu 60-30-10 từ mã swatchColor
    setColors({
      canvasBg: isDark ? "#0f172a" : "#f8fafc",
      surfaceBg: swatchColor,
      surfaceElevated: isDark ? "#1e293b" : "#ffffff",
      borderSubtle: isDark ? "#334155" : "#e2e8f0",
      textMuted: isDark ? "#94a3b8" : "#64748b",
      textHighlight: isDark ? "#f8fafc" : "#0f172a",
      accentPrimary: swatchColor,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameVi.trim()) return;

    onSave({
      id: paletteToEdit?.id,
      name: `${nameEn.trim() || nameVi.trim()} (${nameVi.trim()})`,
      nameVi: nameVi.trim(),
      nameEn: nameEn.trim() || nameVi.trim(),
      swatchColor,
      isDark,
      colors,
      isActive: paletteToEdit ? paletteToEdit.isActive : true,
      isCustom: true,
    });
    onClose();
  };

  const colorFields: { key: keyof ThemeColors; label: string; desc: string }[] = [
    { key: "surfaceBg", label: "Sidebar (Màu nhận diện)", desc: "Màu nền thanh điều hướng bên trái" },
    { key: "canvasBg", label: "Nền Canvas chính", desc: "Không gian làm việc tổng thể" },
    { key: "surfaceElevated", label: "Thẻ Card nổi", desc: "Nền đồng hồ và danh sách task" },
    { key: "accentPrimary", label: "Nút Accent chính", desc: "Nút Bắt đầu Pomodoro, Checkbox" },
    { key: "borderSubtle", label: "Đường viền", desc: "Viền phân cách nhẹ nhàng" },
    { key: "textHighlight", label: "Chữ tiêu đề chính", desc: "Thời gian đồng hồ & tên task" },
    { key: "textMuted", label: "Chữ phụ / Muted", desc: "Nhãn phụ và ngày tháng" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#16171b] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {paletteToEdit ? "Chỉnh Sửa Color Series" : "Tạo Mới Color Series"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Cấu hình bảng màu 60-30-10 phong cách TickTick chuẩn WCAG AA
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Tên & Swatch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Tên Tiếng Việt *
              </label>
              <input
                type="text"
                required
                value={nameVi}
                onChange={(e) => setNameVi(e.target.value)}
                placeholder="VD: Hổ phách hoàng hôn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Tên Tiếng Anh
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="VD: Sunset Amber"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Màu đại diện (Swatch)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={swatchColor}
                  onChange={(e) => setSwatchColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={swatchColor}
                  onChange={(e) => setSwatchColor(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-xs font-mono text-neutral-900 dark:text-white uppercase"
                />
              </div>
            </div>
          </div>

          {/* Nút Auto-harmonize */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles size={15} />
              <span>Tự động tính toán các màu còn lại dựa trên màu đại diện</span>
            </div>
            <button
              type="button"
              onClick={handleAutoHarmonize}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Wand2 size={13} />
              <span>Gợi ý phối màu</span>
            </button>
          </div>

          {/* 7 Color Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {colorFields.map((f) => (
              <div key={f.key} className="p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {f.label}
                  </div>
                  <div className="text-[10px] text-neutral-400">{f.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[f.key]}
                    onChange={(e) => handleColorChange(f.key, e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[f.key]}
                    onChange={(e) => handleColorChange(f.key, e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white uppercase text-center"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{paletteToEdit ? "Lưu thay đổi" : "Tạo Color Series"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
