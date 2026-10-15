import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import viMessages from "../../messages/vi.json";
import enMessages from "../../messages/en.json";

export type Language = "vi" | "en";

export const translations = {
  vi: viMessages,
  en: enMessages,
} as const;

export type TranslationSchema = typeof viMessages;

interface LanguageStoreState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageStoreState>()(
  persist(
    (set) => ({
      language: "vi",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "pomodo_language_storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = translations[language] || translations.vi;

  return { t, language, setLanguage };
}
