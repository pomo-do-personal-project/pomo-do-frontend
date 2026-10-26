// ==========================================
// Theme Palette Types & Contracts (TickTick Style)
// ==========================================

export interface ThemeColors {
  canvasBg: string;
  surfaceBg: string;
  surfaceElevated: string;
  borderSubtle: string;
  textMuted: string;
  textHighlight: string;
  accentPrimary: string;
}

export interface ThemePalette {
  id: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  swatchColor: string;
  isDark: boolean;
  colors: ThemeColors;
}
