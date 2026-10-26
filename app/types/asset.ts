// ==========================================
// System Assets Types & Contracts
// ==========================================

export type AssetType = "wallpaper" | "audio_alarm" | "audio_ambient";

export interface SystemAssetDto {
  id: string;
  assetType: AssetType;
  name: string;
  url: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAssetRequest {
  assetType: AssetType;
  name: string;
  url: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateAssetRequest {
  name: string;
  url: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  isActive: boolean;
  isDefault: boolean;
}

export interface PagedAssetResult {
  items: SystemAssetDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
