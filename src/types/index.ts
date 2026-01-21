export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
    createdTime?: string;
    thumbnailLink?: string;
    iconLink?: string;
    webViewLink?: string;
    webContentLink?: string;
    parents?: string[];
    isFolder: boolean;
    category: string;
}

import { VIEW_MODES } from '@/utils/constants';
export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export interface BreadcrumbItem {
    id: string;
    name: string;
}

export interface SearchFilters {
    query: string;
    category?: string;
    sortBy?: string;
    orderBy?: 'asc' | 'desc';
}

export interface FileStore {
    files: DriveFile[];
    nextPageToken: string | null;
    currentFolder: string | null;
    breadcrumbs: BreadcrumbItem[];
    viewMode: ViewMode;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    filters: SearchFilters;
    selectedFiles: string[];
    setFiles: (files: DriveFile[], nextPageToken?: string | null) => void;
    appendFiles: (files: DriveFile[], nextPageToken?: string | null) => void;
    setCurrentFolder: (folderId: string | null) => void;
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
    setViewMode: (mode: 'grid' | 'list' | 'details') => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<SearchFilters>) => void;
    toggleFileSelection: (fileId: string) => void;
    clearSelection: () => void;
}

export interface UIStore {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    filterPanelOpen: boolean;
    imageViewerOpen: boolean;
    videoPlayerOpen: boolean;
    currentMediaFile: DriveFile | null;
    toggleTheme: () => void;
    setSidebarOpen: (open: boolean) => void;
    setFilterPanelOpen: (open: boolean) => void;
    setImageViewerOpen: (open: boolean) => void;
    setVideoPlayerOpen: (open: boolean) => void;
    setCurrentMediaFile: (file: DriveFile | null) => void;
}
