"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AssetType, SystemAssetDto } from "../../../types/asset";
import { assetService } from "../../../services/assetService";
import { AssetFilterBar } from "../../../components/admin/assets/AssetFilterBar";
import { AssetGrid } from "../../../components/admin/assets/AssetGrid";
import { AssetModal } from "../../../components/admin/assets/AssetModal";
import { AdminThemeStudioModal } from "../../../components/admin/assets/AdminThemeStudioModal";

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<SystemAssetDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 16;
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | AssetType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<SystemAssetDto | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const isActiveParam =
        statusFilter === "all" ? undefined : statusFilter === "active";
      const typeParam = selectedType === "all" ? undefined : selectedType;

      const res = await assetService.getAdminAssets({
        type: typeParam,
        isActive: isActiveParam,
        search: debouncedSearch.trim() || undefined,
        page,
        pageSize,
      });

      setAssets(res.items || []);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error("Failed to load assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, statusFilter, debouncedSearch, page]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleOpenCreateModal = () => {
    setAssetToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: SystemAssetDto) => {
    setAssetToEdit(asset);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (data: {
    assetType: AssetType;
    name: string;
    url: string;
    thumbnailUrl?: string | null;
    category?: string | null;
    isActive: boolean;
    isDefault: boolean;
  }) => {
    if (assetToEdit) {
      await assetService.updateAsset(assetToEdit.id, data);
    } else {
      await assetService.createAsset(data);
    }
    await loadAssets();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài nguyên này khỏi kho hệ thống?")) return;
    try {
      await assetService.deleteAsset(id);
      await loadAssets();
    } catch (err) {
      console.error("Failed to delete asset:", err);
      alert("Không thể xóa tài nguyên.");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await assetService.toggleActive(id);
      await loadAssets();
    } catch (err) {
      console.error("Failed to toggle active:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await assetService.setDefault(id);
      await loadAssets();
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Kho Tài Nguyên Hệ Thống
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Quản lý thư viện hình nền bàn làm việc, chuông báo Pomodoro và âm thanh môi trường thư giãn.
        </p>
      </div>

      {/* Filter Bar */}
      <AssetFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={(t) => {
          setSelectedType(t);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
      />

      {/* Grid */}
      <AssetGrid
        assets={assets}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onSetDefault={handleSetDefault}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
          <span>
            Hiển thị {assets.length} trên tổng số {totalCount} tài nguyên
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 cursor-pointer"
            >
              Trước
            </button>
            <span className="px-2 font-medium">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assetToEdit={assetToEdit}
        onSubmit={handleSubmitModal}
      />

      {/* Theme Studio Modal */}
      <AdminThemeStudioModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
        onPublished={loadAssets}
      />
    </div>
  );
}
