import { create } from 'zustand';
import { UIStore } from '@/types';

export const useUIStore = create<UIStore>((set) => ({
    theme: 'dark',
    sidebarOpen: true,
    filterPanelOpen: false,
    imageViewerOpen: false,
    videoPlayerOpen: false,
    currentMediaFile: null,

    toggleTheme: () =>
        set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light',
        })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),

    setImageViewerOpen: (open) => set({ imageViewerOpen: open }),

    setVideoPlayerOpen: (open) => set({ videoPlayerOpen: open }),

    setCurrentMediaFile: (file) => set({ currentMediaFile: file }),
}));
