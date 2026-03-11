import { create } from 'zustand';
import { FileStore } from '@/types';

export const useFileStore = create<FileStore>((set) => ({
    files: [],
    currentFolder: null,
    breadcrumbs: [{ id: 'root', name: 'Home' }],
    viewMode: 'grid',
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: { query: '' },
    selectedFiles: [],
    nextPageToken: null,

    setFiles: (files, nextPageToken) => set({ files, nextPageToken: nextPageToken || null }),

    appendFiles: (newFiles, nextPageToken) =>
        set((state) => ({
            files: [...state.files, ...newFiles],
            nextPageToken: nextPageToken || null
        })),

    setCurrentFolder: (folderId) => set({ currentFolder: folderId, files: [], nextPageToken: null }),

    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

    setViewMode: (mode) => set({ viewMode: mode }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    setSearchQuery: (query) =>
        set((state) => ({
            searchQuery: query,
            filters: { ...state.filters, query },
        })),

    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),

    toggleFileSelection: (fileId) =>
        set((state) => ({
            selectedFiles: state.selectedFiles.includes(fileId)
                ? state.selectedFiles.filter((id) => id !== fileId)
                : [...state.selectedFiles, fileId],
        })),

    clearSelection: () => set({ selectedFiles: [] }),
}));
