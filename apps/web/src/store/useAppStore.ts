import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CaptureData, LabelTemplate } from '@servicenow-fixer/shared';

interface AppState {
  currentCapture: CaptureData | null;
  templates: LabelTemplate[];
  
  setCurrentCapture: (data: CaptureData) => void;
  clearCapture: () => void;
  
  saveTemplate: (name: string, labels: string[]) => void;
  removeTemplate: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentCapture: null,
      templates: [],

      setCurrentCapture: (data) => set({ currentCapture: data }),
      clearCapture: () => set({ currentCapture: null }),

      saveTemplate: (name, labels) => set((state) => ({
        templates: [
          ...state.templates,
          {
            id: crypto.randomUUID(),
            name,
            labels,
            createdDate: new Date().toISOString(),
            lastUsedDate: new Date().toISOString(),
          }
        ]
      })),

      removeTemplate: (id) => set((state) => ({
        templates: state.templates.filter((t) => t.id !== id)
      }))
    }),
    {
      name: 'servicenow-fixer-storage',
    }
  )
);
