"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ThemePalette, ThemeColors } from "../types/theme";
import { THEME_PALETTES } from "../constants/themePalettes";

interface PaletteState {
  palettes: ThemePalette[];
  addPalette: (palette: Omit<ThemePalette, "id"> & { id?: string }) => void;
  updatePalette: (id: string, updates: Partial<ThemePalette>) => void;
  deletePalette: (id: string) => boolean;
  toggleActive: (id: string) => void;
  resetToDefault: () => void;
}

const DEFAULT_INITIAL_PALETTES: ThemePalette[] = THEME_PALETTES.map((p) => ({
  ...p,
  isActive: true,
  isCustom: false,
}));

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      palettes: DEFAULT_INITIAL_PALETTES,

      addPalette: (newP) => {
        const id = newP.id || `custom-${Date.now()}`;
        const created: ThemePalette = {
          ...newP,
          id,
          isActive: newP.isActive !== undefined ? newP.isActive : true,
          isCustom: true,
        };
        set((state) => ({
          palettes: [created, ...state.palettes],
        }));
      },

      updatePalette: (id, updates) => {
        set((state) => ({
          palettes: state.palettes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePalette: (id) => {
        const target = get().palettes.find((p) => p.id === id);
        if (!target) return false;
        set((state) => ({
          palettes: state.palettes.filter((p) => p.id !== id),
        }));
        return true;
      },

      toggleActive: (id) => {
        set((state) => ({
          palettes: state.palettes.map((p) =>
            p.id === id ? { ...p, isActive: p.isActive === false } : p
          ),
        }));
      },

      resetToDefault: () => {
        set({ palettes: DEFAULT_INITIAL_PALETTES });
      },
    }),
    {
      name: "pomodo_color_series_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
