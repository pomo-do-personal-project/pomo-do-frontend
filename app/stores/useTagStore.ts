import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TagDto, CreateTagRequest, UpdateTagRequest } from "../types/api";
import { tagService } from "../services/tagService";

export interface TagState {
  tags: TagDto[];
  isLoading: boolean;
  error: string | null;

  fetchTags: () => Promise<void>;
  createTag: (data: CreateTagRequest) => Promise<TagDto | null>;
  updateTag: (id: string, data: UpdateTagRequest) => Promise<TagDto | null>;
  deleteTag: (id: string) => Promise<void>;
  resetTagStore: () => void;
}

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: [],
      isLoading: false,
      error: null,

      fetchTags: async () => {
        set({ isLoading: true, error: null });
        try {
          const tags = await tagService.getTags();
          set({ tags, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Không thể tải danh sách thẻ tag";
          set({ isLoading: false, error: msg });
        }
      },

      createTag: async (data: CreateTagRequest) => {
        set({ error: null });
        try {
          const newTag = await tagService.createTag(data);
          if (newTag) {
            set((state) => ({
              tags: [...state.tags, newTag].sort((a, b) => a.name.localeCompare(b.name)),
            }));
            return newTag;
          }
          return null;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Không thể tạo thẻ tag mới";
          set({ error: msg });
          throw err;
        }
      },

      updateTag: async (id: string, data: UpdateTagRequest) => {
        set({ error: null });
        try {
          const updated = await tagService.updateTag(id, data);
          if (updated) {
            set((state) => ({
              tags: state.tags.map((t) => (t.id === id ? updated : t)),
            }));
            return updated;
          }
          return null;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Không thể cập nhật thẻ tag";
          set({ error: msg });
          throw err;
        }
      },

      deleteTag: async (id: string) => {
        set({ error: null });
        try {
          await tagService.deleteTag(id);
          set((state) => ({
            tags: state.tags.filter((t) => t.id !== id),
          }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Không thể xóa thẻ tag";
          set({ error: msg });
          throw err;
        }
      },

      resetTagStore: () => {
        set({ tags: [], isLoading: false, error: null });
      },
    }),
    {
      name: "pomo-tags-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tags: state.tags }),
    }
  )
);
