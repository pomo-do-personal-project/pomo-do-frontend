import { getAiHttpUrl } from "./apiUrl";
import { ThemeColors } from "../types/theme";

export interface ThemeCluster {
  hex: string;
  weight: number;
  chroma: number;
  is_dominant?: boolean;
  is_accent?: boolean;
}

export interface ThemeAnalysisResult {
  palette: ThemeColors;
  dominantHue: number;
  accentHue: number;
  algorithm: string;
  clusters?: ThemeCluster[];
}

// Chuyển đổi RGB sang HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

// Trích xuất góc màu chủ đạo (Hue & Saturation) qua Canvas 64x64 siêu nhẹ
export async function extractDominantHue(imageSrc: string): Promise<[number, number]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve([210, 30]);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve([210, 30]);

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        let totalH = 0;
        let totalS = 0;
        let validPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const [h, s, l] = rgbToHsl(r, g, b);

          if (l > 12 && l < 88 && s > 15) {
            totalH += h;
            totalS += s;
            validPixels++;
          }
        }

        if (validPixels > 0) {
          resolve([Math.round(totalH / validPixels), Math.round(totalS / validPixels)]);
        } else {
          resolve([210, 30]);
        }
      } catch {
        resolve([210, 30]);
      }
    };

    img.onerror = () => {
      resolve([210, 30]);
    };

    img.src = imageSrc;
  });
}

// Tính toán 6 nấc màu Khóa Tương phản (Contrast-Locked Palette) chuẩn TickTick
export function generateContrastLockedPalette(hue: number, sat: number): ThemeColors {
  const richSat = Math.min(Math.max(sat + 15, 50), 75);
  const canvasSat = Math.min(Math.max(sat, 25), 45);
  const accentSat = Math.min(Math.max(sat + 25, 65), 90);

  return {
    canvasBg: `hsl(${hue}, ${canvasSat}%, 8%)`,
    surfaceBg: `hsl(${hue}, ${richSat}%, 22%)`,
    surfaceElevated: `hsl(${hue}, ${Math.max(richSat - 5, 45)}%, 28%)`,
    borderSubtle: `hsl(${hue}, ${Math.max(richSat - 15, 35)}%, 36%)`,
    textMuted: `hsl(${hue}, 30%, 80%)`,
    textHighlight: `#ffffff`,
    accentPrimary: `hsl(${hue}, ${accentSat}%, 52%)`,
  };
}

/**
 * Trích xuất bảng màu chính xác tuyệt đối qua Python AI (CIELAB K-Means++ Clustering).
 * Tự động chuyển đổi sang Canvas HSL dự phòng nếu Python service không khả dụng.
 */
export async function extractThemeWithAi(
  imageInput: string | File
): Promise<ThemeAnalysisResult> {
  const aiUrl = getAiHttpUrl();
  try {
    let response: Response;
    if (typeof window !== "undefined" && imageInput instanceof File) {
      const formData = new FormData();
      formData.append("file", imageInput);
      response = await fetch(`${aiUrl}/api/analyze-theme`, {
        method: "POST",
        body: formData,
      });
    } else if (typeof imageInput === "string") {
      const isBase64 = imageInput.startsWith("data:");
      const payload = isBase64
        ? { image_base64: imageInput }
        : { image_url: imageInput };
      response = await fetch(`${aiUrl}/api/analyze-theme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw new Error("Invalid image input");
    }

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.palette) {
        return {
          palette: data.palette,
          dominantHue: data.dominant_hue ?? 210,
          accentHue: data.accent_hue ?? 210,
          algorithm: data.algorithm || "Python AI (CIELAB K-Means++)",
          clusters: data.clusters,
        };
      }
    }
  } catch (err) {
    console.warn("Python AI service unavailable, falling back to Canvas HSL:", err);
  }

  // Dự phòng: Trích xuất bằng Canvas HSL phía Client
  const src = typeof imageInput === "string" ? imageInput : URL.createObjectURL(imageInput);
  const [hue, sat] = await extractDominantHue(src);
  const palette = generateContrastLockedPalette(hue, sat);
  return {
    palette,
    dominantHue: hue,
    accentHue: hue,
    algorithm: "Canvas HSL (Dự phòng Client)",
  };
}

// Áp dụng bộ màu đã trích xuất lên CSS Variables
export function applyHarmonizedColors(colors: ThemeColors) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--canvas-bg", colors.canvasBg);
  root.style.setProperty("--surface-bg", colors.surfaceBg);
  root.style.setProperty("--surface-elevated", colors.surfaceElevated);
  root.style.setProperty("--border-subtle", colors.borderSubtle);
  root.style.setProperty("--text-muted", colors.textMuted);
  root.style.setProperty("--text-highlight", colors.textHighlight);
  root.style.setProperty("--accent-primary", colors.accentPrimary);

  // Khi kích hoạt hình nền ảnh, giao diện luôn ở dark theme để chữ trắng tương phản tốt
  root.classList.add("dark");
  localStorage.setItem("theme", "dark");
  localStorage.setItem("pomodo_theme_colors", JSON.stringify(colors));
}
