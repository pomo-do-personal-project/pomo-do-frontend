import { ThemePalette } from "../types/theme";

/**
 * 10 Bảng màu chủ đề cao cấp phong cách TickTick (Nền sáng thanh lịch, Sidebar màu nổi bật)
 * Trích xuất từ 30+ bảng phối màu Designer Freelance theo quy tắc 60-30-10 & chuẩn tương phản WCAG 2.1 AA
 */
export const THEME_PALETTES: ThemePalette[] = [
  {
    id: "terracotta",
    name: "Terracotta (Đất nung ấm - TickTick)",
    nameVi: "Đất nung ấm",
    nameEn: "Terracotta",
    swatchColor: "#e26a45",
    isDark: false,
    colors: {
      canvasBg: "#fafafa",
      surfaceBg: "#e26a45",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e5e7eb",
      textMuted: "#64748b",
      textHighlight: "#0f172a",
      accentPrimary: "#e26a45",
    },
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean (Đại dương sâu)",
    nameVi: "Đại dương sâu",
    nameEn: "Deep Ocean",
    swatchColor: "#1e3a5f",
    isDark: false,
    colors: {
      canvasBg: "#f8fafc",
      surfaceBg: "#1e3a5f",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e2e8f0",
      textMuted: "#64748b",
      textHighlight: "#0f172a",
      accentPrimary: "#2563eb",
    },
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest (Rừng ngọc bích)",
    nameVi: "Rừng ngọc bích",
    nameEn: "Emerald Forest",
    swatchColor: "#1b4d3e",
    isDark: false,
    colors: {
      canvasBg: "#f7faf8",
      surfaceBg: "#1b4d3e",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e2e8f0",
      textMuted: "#64748b",
      textHighlight: "#0f172a",
      accentPrimary: "#10b981",
    },
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon (Tím điện tử)",
    nameVi: "Tím điện tử",
    nameEn: "Cyber Neon",
    swatchColor: "#4c1d95",
    isDark: false,
    colors: {
      canvasBg: "#faf8ff",
      surfaceBg: "#4c1d95",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e5e7eb",
      textMuted: "#64748b",
      textHighlight: "#0f172a",
      accentPrimary: "#7c3aed",
    },
  },
  {
    id: "lofi-espresso",
    name: "Lofi Espresso (Cà phê ấm)",
    nameVi: "Cà phê ấm",
    nameEn: "Lofi Espresso",
    swatchColor: "#5c3a21",
    isDark: false,
    colors: {
      canvasBg: "#faf8f5",
      surfaceBg: "#5c3a21",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e7e5e4",
      textMuted: "#78716c",
      textHighlight: "#1c1917",
      accentPrimary: "#d97706",
    },
  },
  {
    id: "cyber-teal",
    name: "Cyber Teal (Ngọc bích băng)",
    nameVi: "Ngọc bích băng",
    nameEn: "Cyber Teal",
    swatchColor: "#0f766e",
    isDark: false,
    colors: {
      canvasBg: "#f4fbfb",
      surfaceBg: "#0f766e",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e0f2f1",
      textMuted: "#546e7a",
      textHighlight: "#00363a",
      accentPrimary: "#0d9488",
    },
  },
  {
    id: "lagoon-sun",
    name: "Lagoon Sun (Vịnh nhiệt đới)",
    nameVi: "Vịnh nhiệt đới",
    nameEn: "Lagoon Sun",
    swatchColor: "#0e7490",
    isDark: false,
    colors: {
      canvasBg: "#f6fafc",
      surfaceBg: "#0e7490",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e2e8f0",
      textMuted: "#64748b",
      textHighlight: "#0f172a",
      accentPrimary: "#eab308",
    },
  },
  {
    id: "nordic-slate",
    name: "Nordic Slate (Bắc Âu tối giản)",
    nameVi: "Bắc Âu tối giản",
    nameEn: "Nordic Slate",
    swatchColor: "#334155",
    isDark: false,
    colors: {
      canvasBg: "#f8fafc",
      surfaceBg: "#334155",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e2e8f0",
      textMuted: "#64748b",
      textHighlight: "#0f172a",
      accentPrimary: "#3b82f6",
    },
  },
  {
    id: "matcha-zen",
    name: "Matcha Zen (Trà đạo tĩnh tâm)",
    nameVi: "Trà đạo tĩnh tâm",
    nameEn: "Matcha Zen",
    swatchColor: "#3f6212",
    isDark: false,
    colors: {
      canvasBg: "#f8faf5",
      surfaceBg: "#3f6212",
      surfaceElevated: "#ffffff",
      borderSubtle: "#e5e7eb",
      textMuted: "#64748b",
      textHighlight: "#142a08",
      accentPrimary: "#65a30d",
    },
  },
  {
    id: "twilight-plum",
    name: "Twilight Plum (Mận hoàng hôn)",
    nameVi: "Mận hoàng hôn",
    nameEn: "Twilight Plum",
    swatchColor: "#831843",
    isDark: false,
    colors: {
      canvasBg: "#faf5f8",
      surfaceBg: "#831843",
      surfaceElevated: "#ffffff",
      borderSubtle: "#f3e8ff",
      textMuted: "#701a75",
      textHighlight: "#2a081f",
      accentPrimary: "#db2777",
    },
  },
];

export function getPaletteDisplayName(palette: ThemePalette, language: string): string {
  if (language === "vi") {
    if (palette.nameVi) return palette.nameVi;
    const match = palette.name.match(/\((.*?)\)/);
    return match ? match[1].replace(/ - TickTick/g, "").trim() : palette.name;
  }
  if (palette.nameEn) return palette.nameEn;
  return palette.name.split(" (")[0].trim();
}
