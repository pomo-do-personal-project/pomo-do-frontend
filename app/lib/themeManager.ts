import { ThemePalette } from "../types/theme";
import { THEME_PALETTES } from "../constants/themePalettes";

const THEME_PALETTE_KEY = "pomodo_theme_palette";
const THEME_COLORS_KEY = "pomodo_theme_colors";

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

  // Áp dụng bộ màu 60-30-10 của Theme Palette lên các biến CSS toàn cục
  root.style.setProperty("--canvas-bg", palette.colors.canvasBg);
  root.style.setProperty("--surface-bg", palette.colors.surfaceBg);
  root.style.setProperty("--surface-elevated", palette.colors.surfaceElevated);
  root.style.setProperty("--border-subtle", palette.colors.borderSubtle);
  root.style.setProperty("--text-muted", palette.colors.textMuted);
  root.style.setProperty("--text-highlight", palette.colors.textHighlight);
  root.style.setProperty("--accent-primary", palette.colors.accentPrimary);

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
