"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, RotateCcw, Palette, CheckCircle2 } from "lucide-react";
import { usePaletteStore } from "../../../stores/usePaletteStore";
import { ThemePalette } from "../../../types/theme";
import { PaletteStatsBar } from "../../../components/admin/palettes/PaletteStatsBar";
import { PaletteCard } from "../../../components/admin/palettes/PaletteCard";
import { PaletteEditorModal } from "../../../components/admin/palettes/PaletteEditorModal";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";

export default function AdminPalettesPage() {
  const { palettes, addPalette, updatePalette, deletePalette, toggleActive, resetToDefault } =
    usePaletteStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "custom">("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [paletteToEdit, setPaletteToEdit] = useState<ThemePalette | null>(null);
  const [paletteToDelete, setPaletteToDelete] = useState<ThemePalette | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const filteredPalettes = useMemo(() => {
    return palettes.filter((p) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        (p.nameVi && p.nameVi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.swatchColor.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "active") return p.isActive !== false;
      if (statusFilter === "inactive") return p.isActive === false;
      if (statusFilter === "custom") return Boolean(p.isCustom);
      return true;
    });
  }, [palettes, searchTerm, statusFilter]);

  const handleCreate = () => {
    setPaletteToEdit(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (p: ThemePalette) => {
    setPaletteToEdit(p);
    setIsEditorOpen(true);
  };

  const handleSave = (data: Omit<ThemePalette, "id"> & { id?: string }) => {
    if (data.id) {
      updatePalette(data.id, data);
      showToast(`Đã cập nhật bảng màu "${data.nameVi || data.name}"!`);
    } else {
      addPalette(data);
      showToast(`Đã thêm mới Color Series "${data.nameVi || data.name}"!`);
    }
  };

  const handleDelete = (id: string) => {
    const target = palettes.find((p) => p.id === id);
    if (target) setPaletteToDelete(target);
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Palette className="text-indigo-500" size={24} />
            <span>Quản Lý Color Series (Bảng Màu Chủ Đề)</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Quản lý và thiết kế các bảng phối màu giao diện 60-30-10 phong cách TickTick dành cho người dùng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors flex items-center gap-1.5"
            title="Khôi phục danh sách mặc định"
          >
            <RotateCcw size={13} />
            <span>Mặc định</span>
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Thêm Color Series</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <PaletteStatsBar palettes={palettes} />

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc mã màu HEX..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Đang bật" },
            { id: "inactive", label: "Đã ẩn" },
            { id: "custom", label: "Custom" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Palettes Grid */}
      {filteredPalettes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
          <Palette size={32} className="mx-auto text-neutral-400 mb-2 opacity-50" />
          <p className="text-xs text-neutral-500 font-medium">
            Không tìm thấy Color Series nào phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPalettes.map((p) => (
            <PaletteCard
              key={p.id}
              palette={p}
              onEdit={handleEdit}
              onToggleActive={toggleActive}
              onDelete={handleDelete}
              onNotice={showToast}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <PaletteEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        paletteToEdit={paletteToEdit}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!paletteToDelete}
        title="Xóa bộ màu Color Series"
        message={`Bạn có chắc muốn xóa bảng màu "${paletteToDelete?.nameVi || paletteToDelete?.name}"? Các thành viên đang dùng bảng màu này sẽ được đưa về màu mặc định.`}
        confirmText="Xóa bảng màu"
        cancelText="Giữ lại"
        danger={true}
        onConfirm={() => {
          if (paletteToDelete) {
            deletePalette(paletteToDelete.id);
            setPaletteToDelete(null);
            showToast("Đã xóa bảng màu thành công!");
          }
        }}
        onCancel={() => setPaletteToDelete(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Khôi phục cài đặt gốc Color Series"
        message="Khôi phục toàn bộ Color Series về 10 bộ màu mặc định chuẩn TickTick? Mọi tùy chỉnh màu sắc cá nhân sẽ bị hoàn tác."
        confirmText="Khôi phục gốc"
        cancelText="Hủy bỏ"
        danger={false}
        onConfirm={() => {
          resetToDefault();
          setIsResetConfirmOpen(false);
          showToast("Đã khôi phục các bộ màu về mặc định!");
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
