import { ThemePalette } from "../types/theme";
import { THEME_PALETTES } from "../constants/themePalettes";

const THEME_PALETTE_KEY = "pomodo_theme_palette";
const THEME_COLORS_KEY = "pomodo_theme_colors";

function isValidCssColor(val: unknown): boolean {
  if (typeof val !== "string") return false;
  const s = val.trim();
  if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return true;
  if (/^(rgb|rgba|hsl|hsla)\([^;{}<>"']+\)$/i.test(s)) return true;
  if (/^[a-zA-Z]{3,20}$/.test(s)) return true;
  return false;
}

export function applyThemePalette(palette: ThemePalette | null) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (!palette) {
    root.style.removeProperty("--canvas-bg");
    root.style.removeProperty("--surface-bg");
    root.style.removeProperty("--surface-elevated");
    root.style.removeProperty("--border-subtle");
    root.style.removeProperty("--text-muted");
    root.style.removeProperty("--text-highlight");
    root.style.removeProperty("--accent-primary");
    localStorage.removeItem(THEME_PALETTE_KEY);
    localStorage.removeItem(THEME_COLORS_KEY);
    return;
  }

  // Áp dụng bộ màu 60-30-10 của Theme Palette lên các biến CSS toàn cục sau khi kiểm tra định dạng an toàn
  const safeSet = (prop: string, val: string | undefined, fallback: string) => {
    if (val && isValidCssColor(val)) {
      root.style.setProperty(prop, val);
    } else if (fallback) {
      root.style.setProperty(prop, fallback);
    }
  };

  safeSet("--canvas-bg", palette.colors.canvasBg, palette.isDark ? "#0d0e12" : "#f8fafc");
  safeSet("--surface-bg", palette.colors.surfaceBg, palette.isDark ? "#16171b" : "#ffffff");
  safeSet("--surface-elevated", palette.colors.surfaceElevated, palette.isDark ? "#222328" : "#f1f5f9");
  safeSet("--border-subtle", palette.colors.borderSubtle, palette.isDark ? "#2b2d35" : "#e2e8f0");
  safeSet("--text-muted", palette.colors.textMuted, palette.isDark ? "#9ca3af" : "#64748b");
  safeSet("--text-highlight", palette.colors.textHighlight, palette.isDark ? "#f3f4f6" : "#0f172a");
  safeSet("--accent-primary", palette.colors.accentPrimary, "#10b981");

  if (palette.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  localStorage.setItem(THEME_PALETTE_KEY, palette.id);
  localStorage.setItem(THEME_COLORS_KEY, JSON.stringify(palette.colors));
}

export function getActiveThemePalette(): ThemePalette {
  if (typeof localStorage === "undefined") return THEME_PALETTES[0];
  const savedId = localStorage.getItem(THEME_PALETTE_KEY);
  if (!savedId) return THEME_PALETTES[0];

  const sys = THEME_PALETTES.find((p) => p.id === savedId);
  if (sys) return sys;

  try {
    const raw = localStorage.getItem("pomodo_color_series_store");
    if (raw) {
      const parsed = JSON.parse(raw);
      const custom = parsed?.state?.palettes?.find((p: ThemePalette) => p.id === savedId);
      if (custom) return custom;
    }
  } catch {}

  return THEME_PALETTES[0];
}

export function initThemePalette() {
  if (typeof window === "undefined") return;
  const activePalette = getActiveThemePalette();
  if (activePalette) {
    applyThemePalette(activePalette);
  }
}
