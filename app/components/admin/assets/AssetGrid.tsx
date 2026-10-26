"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { SystemAssetDto } from "../../../types/asset";
import { AssetCard } from "./AssetCard";

interface AssetGridProps {
  assets: SystemAssetDto[];
  isLoading: boolean;
  onEdit: (asset: SystemAssetDto) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AssetGrid({
  assets,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
}: AssetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#18191c] overflow-hidden animate-pulse"
          >
            <div className="w-full aspect-video bg-neutral-200 dark:bg-neutral-800" />
            <div className="p-3.5 space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-md w-3/4" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-md w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-[#18191c] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-center">
        <div className="p-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-3">
          <FolderOpen size={32} />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Chưa có tài nguyên nào
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mt-1">
          Không tìm thấy tài nguyên nào phù hợp với bộ lọc hiện tại. Hãy tạo tài nguyên mới hoặc thử từ khóa khác.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
}
