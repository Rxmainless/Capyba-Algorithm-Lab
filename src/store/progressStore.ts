import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  completedIds: string[];
  markCompleted: (id: string) => void;
  isCompleted: (id: string) => boolean;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedIds: [],
      markCompleted: (id) => {
        if (get().completedIds.includes(id)) return;
        set((s) => ({ completedIds: [...s.completedIds, id] }));
      },
      isCompleted: (id) => get().completedIds.includes(id),
    }),
    { name: "lumen-progress" }
  )
);