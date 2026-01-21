'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useFileStore } from '@/store/useFileStore';
// import { mockDrive } from '@/lib/google-drive'; // Removed to avoid client-side bundling of server code
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
    const observerTarget = useRef(null);

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
                    url = `/api/files?folderId=${currentFolder || 'root'}`;
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

    // Infinite scroll handler
    const loadMoreFiles = useCallback(async () => {
        if (!nextPageToken || isLoadingMore || searchQuery) return;

        setIsLoadingMore(true);
        try {
            const url = `/api/files?folderId=${currentFolder || 'root'}&pageToken=${nextPageToken}`;
            const response = await fetch(url);
            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            appendFiles(result.data || [], result.nextPageToken);
        } catch (error) {
            console.error('Error loading more files:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextPageToken, currentFolder, isLoadingMore, searchQuery, appendFiles]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && nextPageToken) {
                    loadMoreFiles();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loadMoreFiles, nextPageToken]);

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
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
                <div className="container max-w-screen-2xl px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold">
                            {searchQuery ? `Search: "${searchQuery}"` : breadcrumbs[breadcrumbs.length - 1]?.name || 'Drive'}
                        </h2>
                        <span className="text-sm text-muted-foreground">
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
            <main className="container max-w-screen-2xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading files...</p>
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

                        {/* Infinite scroll trigger */}
                        {nextPageToken && !searchQuery && (
                            <div ref={observerTarget} className="h-20 flex items-center justify-center w-full mt-8">
                                {isLoadingMore && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Loading more files...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Media Viewers */}
            <ImageViewer />
            <VideoPlayer />

            {/* Footer */}
            <footer className="border-t border-border/40 mt-12 py-6">
                <div className="container max-w-screen-2xl px-4 text-center text-sm text-muted-foreground">
                    <p>GD-Index - Modern Google Drive Browser</p>
                    <p className="mt-1">Built with Next.js, TypeScript, and Tailwind CSS</p>
                </div>
            </footer>
        </div>
    );
}
