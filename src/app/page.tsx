'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { DriveFile } from '@/types';
import { isFolder } from '@/utils/fileHelpers';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import ViewToggle from '@/components/ViewToggle';
import FilterPanel from '@/components/FilterPanel';
import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import ImageViewer from '@/components/ImageViewer';
import VideoPlayer from '@/components/VideoPlayer';
import { Loader2 } from 'lucide-react';

const PAGE_SIZE = 50; // Larger initial batch for instant feel

export default function HomePage() {
    const {
        files,
        setFiles,
        appendFiles,
        nextPageToken,
        currentFolder,
        setCurrentFolder,
        breadcrumbs,
        setBreadcrumbs,
        viewMode,
        isLoading,
        setIsLoading,
        setError,
        searchQuery,
        filters,
    } = useFileStore();

    const [displayedFiles, setDisplayedFiles] = useState<DriveFile[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement | null>(null);

    // Use refs to avoid recreating the observer on every state change
    const nextPageTokenRef = useRef(nextPageToken);
    const isLoadingMoreRef = useRef(isLoadingMore);
    const isLoadingRef = useRef(isLoading);
    const searchQueryRef = useRef(searchQuery);
    const currentFolderRef = useRef(currentFolder);

    // Keep refs in sync
    useEffect(() => { nextPageTokenRef.current = nextPageToken; }, [nextPageToken]);
    useEffect(() => { isLoadingMoreRef.current = isLoadingMore; }, [isLoadingMore]);
    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
    useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);
    useEffect(() => { currentFolderRef.current = currentFolder; }, [currentFolder]);

    // Initial load
    useEffect(() => {
        const loadFiles = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let url = '';
                if (searchQuery.trim()) {
                    url = `/api/search?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    url = `/api/files?folderId=${currentFolder || 'root'}&pageSize=${PAGE_SIZE}`;
                }

                const response = await fetch(url);
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'Failed to fetch files');

                setFiles(result.data || [], result.nextPageToken);
            } catch (error: any) {
                console.error('Error loading files:', error);
                setError(error.message || 'Failed to load files');
            } finally {
                setIsLoading(false);
            }
        };

        loadFiles();
    }, [currentFolder, searchQuery, setFiles, setIsLoading, setError]);

    // Stable loadMore function using refs (won't cause observer recreation)
    const loadMoreFiles = useCallback(async () => {
        // Guard: don't load if already loading, no token, during search, or initial load
        if (
            !nextPageTokenRef.current ||
            isLoadingMoreRef.current ||
            isLoadingRef.current ||
            searchQueryRef.current
        ) return;

        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);

        try {
            const url = `/api/files?folderId=${currentFolderRef.current || 'root'}&pageToken=${nextPageTokenRef.current}&pageSize=${PAGE_SIZE}`;
            const response = await fetch(url);
            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            appendFiles(result.data || [], result.nextPageToken);
        } catch (error) {
            console.error('Error loading more files:', error);
        } finally {
            isLoadingMoreRef.current = false;
            setIsLoadingMore(false);
        }
    }, [appendFiles]); // Only depends on appendFiles (stable zustand action)

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const target = observerTarget.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    nextPageTokenRef.current &&
                    !isLoadingMoreRef.current &&
                    !isLoadingRef.current
                ) {
                    loadMoreFiles();
                }
            },
            {
                threshold: 0.1,
                // Start loading 300px before the sentinel scrolls into view
                rootMargin: '0px 0px 300px 0px',
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMoreFiles, isLoading]); // Re-attach observer after initial loading completes

    // Filter and sort files
    useEffect(() => {
        let filtered = [...files];

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter((file) => file.category === filters.category);
        }

        // Apply sorting
        const [sortField, sortOrder] = (filters.sortBy || 'name_asc').split('_');

        filtered.sort((a, b) => {
            let comparison = 0;

            if (sortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortField === 'size') {
                const sizeA = parseInt(a.size || '0');
                const sizeB = parseInt(b.size || '0');
                comparison = sizeA - sizeB;
            } else if (sortField === 'date') {
                const dateA = new Date(a.modifiedTime || 0).getTime();
                const dateB = new Date(b.modifiedTime || 0).getTime();
                comparison = dateA - dateB;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });

        setDisplayedFiles(filtered);
    }, [files, filters]);

    const handleFileClick = (file: DriveFile) => {
        if (isFolder(file.mimeType)) {
            // Scroll to top before navigating into the folder
            window.scrollTo({ top: 0, behavior: 'instant' });
            // Navigate to folder
            setCurrentFolder(file.id);
            setBreadcrumbs([...breadcrumbs, { id: file.id, name: file.name }]);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Breadcrumb />

            {/* Toolbar */}
            <div className="sticky top-16 z-40 bg-background/80 dark:bg-white/[0.02] backdrop-blur-xl border-b border-border dark:border-white/5 shadow-[0_4px_30px_0_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_0_rgba(0,0,0,0.1)] transition-all duration-300">
                <div className="container max-w-screen-2xl px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-foreground">
                            {searchQuery ? `Search: "${searchQuery}"` : breadcrumbs[breadcrumbs.length - 1]?.name || 'Drive'}
                        </h2>
                        <span className="text-sm font-medium bg-muted dark:bg-white/10 px-2.5 py-0.5 rounded-full text-muted-foreground border border-border dark:border-white/5">
                            {displayedFiles.length} {displayedFiles.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FilterPanel />
                        <ViewToggle />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container max-w-screen-2xl mx-auto py-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                        <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-6 drop-shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                            <div className="absolute inset-0 h-12 w-12 animate-ping bg-primary/20 rounded-full" />
                        </div>
                        <p className="text-lg font-medium text-muted-foreground/80 animate-pulse">Scanning Drive...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <FileGrid files={displayedFiles} onFileClick={handleFileClick} />
                        ) : (
                            <FileList
                                files={displayedFiles}
                                onFileClick={handleFileClick}
                                viewMode={viewMode === 'details' ? 'details' : 'list'}
                            />
                        )}

                        {/* Infinite scroll sentinel */}
                        <div
                            ref={observerTarget}
                            className="h-10 w-full"
                            aria-hidden="true"
                        />

                        {/* Loading indicator — only visible when actively fetching */}
                        {isLoadingMore && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground py-6 animate-fade-in">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading more files...</span>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Media Viewers */}
            <ImageViewer />
            <VideoPlayer />

            {/* Footer */}
            <footer className="border-t border-border dark:border-white/5 mt-12 py-8 bg-muted/50 dark:bg-black/20 backdrop-blur-lg">
                <div className="container max-w-screen-2xl px-4 text-center text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">GD-Index <span className="text-primary mx-1">•</span> Next-Gen Browser</p>
                    <p className="mt-2 text-xs opacity-60">Built with Next.js & Tailwind</p>
                </div>
            </footer>
        </div>
    );
}
