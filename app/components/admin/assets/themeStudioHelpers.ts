import { ThemeColors } from "../../../types/theme";
import { extractThemeWithAi, ThemeCluster } from "../../../lib/colorHarmonizer";

export const AVAILABLE_STUDIO_CATEGORIES = [
  "#CitySeries",
  "#Nature",
  "#Lofi",
  "#Holiday",
  "#Cyberpunk",
  "#Minimal",
];

export const CATEGORY_BADGES: { id: string; label: string }[] = [
  { id: "#CitySeries", label: "City Series 🏙️" },
  { id: "#Nature", label: "Thiên Nhiên 🌲" },
  { id: "#Lofi", label: "Lofi Cozy ☕" },
  { id: "#Holiday", label: "Lễ Hội 🎃" },
  { id: "#Cyberpunk", label: "Cyberpunk ⚡" },
  { id: "#Minimal", label: "Tối Giản 🍃" },
];

export interface StudioThemeResult {
  hue: number;
  palette: ThemeColors;
  algorithm: string;
  clusters?: ThemeCluster[];
}

/**
 * Phân tích phổ màu ảnh bằng Python AI (CIELAB K-Means++) hoặc Canvas HSL dự phòng
 */
export async function analyzeImageForTheme(
  imageInput: string | File
): Promise<StudioThemeResult> {
  const result = await extractThemeWithAi(imageInput);
  return {
    hue: result.dominantHue,
    palette: result.palette,
    algorithm: result.algorithm,
    clusters: result.clusters,
  };
}

/**
 * Tải ảnh lên Supabase Storage và lưu vào CSDL system_assets với thể loại đã chọn
 */
export async function publishThemeStudioAsset(params: {
  previewImageUrl: string;
  assetName: string;
  category?: string;
  selectedFile: File | null;
  storageService: {
    uploadWorkspaceAsset: (file: Blob | File, name: string) => Promise<string>;
    uploadFromUrl: (url: string, name: string) => Promise<string>;
  };
  assetService: {
    createAsset: (payload: {
      assetType: "wallpaper";
      name: string;
      url: string;
      thumbnailUrl?: string | null;
      category?: string | null;
      isActive: boolean;
      isDefault: boolean;
    }) => Promise<unknown>;
  };
}): Promise<void> {
  const { previewImageUrl, assetName, category, selectedFile, storageService, assetService } = params;

  let publicUrl = "";
  if (selectedFile) {
    publicUrl = await storageService.uploadWorkspaceAsset(selectedFile, assetName);
  } else {
    publicUrl = await storageService.uploadFromUrl(previewImageUrl, assetName);
  }

  await assetService.createAsset({
    assetType: "wallpaper",
    name: assetName.trim(),
    url: publicUrl,
    thumbnailUrl: publicUrl,
    category: category?.trim() ? category.trim() : null,
    isActive: true,
    isDefault: false,
  });
}
