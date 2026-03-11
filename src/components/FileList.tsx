'use client';

import { Download, Eye, Clock } from 'lucide-react';
import { DriveFile } from '@/types';
import { formatFileSize, formatDate, getFileIcon, isFolder, isImage, isVideo } from '@/utils/fileHelpers';
import { useUIStore } from '@/store/useUIStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useCallback, memo } from 'react';

interface FileListProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    viewMode?: 'list' | 'details';
}

const ROW_HEIGHT = 56; // Height of each table row

// Memoized row component to prevent unnecessary re-renders
const FileRow = memo(function FileRow({
    file,
    index,
    totalFiles,
    viewMode,
    onFileClick,
    onPreview,
    onDownload,
}: {
    file: DriveFile;
    index: number;
    totalFiles: number;
    viewMode: 'list' | 'details';
    onFileClick: (file: DriveFile) => void;
    onPreview: (e: React.MouseEvent, file: DriveFile) => void;
    onDownload: (e: React.MouseEvent, file: DriveFile) => void;
}) {
    const canPreview = isImage(file.mimeType) || isVideo(file.mimeType);

    return (
        <tr
            onClick={() => onFileClick(file)}
            className={`cursor-pointer hover:bg-white/5 smooth-transition group ${index !== totalFiles - 1 ? 'border-b border-white/5' : ''}`}
        >
            <td className="p-4">
                <div className="flex items-center gap-4">
                    <span className="text-2xl group-hover:scale-110 smooth-transition">
                        {isFolder(file.mimeType) ? '📁' : getFileIcon(file.mimeType)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium truncate group-hover:text-primary smooth-transition">{file.name}</p>
                        <p className="text-xs text-muted-foreground/80 md:hidden">
                            {file.size && formatFileSize(file.size)}
                        </p>
                    </div>
                </div>
            </td>

            <td className={`p-4 text-sm text-muted-foreground/80 ${viewMode === 'details' ? '' : 'hidden'}`}>
                <span className="capitalize">{file.category}</span>
            </td>

            <td className={`p-4 text-sm text-muted-foreground/80 ${viewMode === 'details' ? '' : 'hidden'}`}>
                {file.size ? formatFileSize(file.size) : '-'}
            </td>

            <td className={`p-4 text-sm text-muted-foreground/80 ${viewMode === 'details' ? '' : 'hidden'}`}>
                {file.modifiedTime ? formatDate(file.modifiedTime) : '-'}
            </td>

            <td className="p-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
                    {canPreview && (
                        <button
                            onClick={(e) => onPreview(e, file)}
                            className="p-2 hover:bg-primary hover:text-primary-foreground text-primary rounded-full smooth-transition border border-primary/20 hover:border-transparent shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                            title="Preview"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    )}

                    {!isFolder(file.mimeType) && (
                        <button
                            onClick={(e) => onDownload(e, file)}
                            className="p-2 hover:bg-white/20 hover:text-white text-muted-foreground rounded-full smooth-transition border border-white/10"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
});

export default function FileList({ files, onFileClick, viewMode = 'list' }: FileListProps) {
    const { setCurrentMediaFile, setImageViewerOpen, setVideoPlayerOpen } = useUIStore();
    const tbodyRef = useRef<HTMLTableSectionElement>(null);

    const handlePreview = useCallback((e: React.MouseEvent, file: DriveFile) => {
        e.stopPropagation();
        setCurrentMediaFile(file);
        if (isImage(file.mimeType)) {
            setImageViewerOpen(true);
        } else if (isVideo(file.mimeType)) {
            setVideoPlayerOpen(true);
        }
    }, [setCurrentMediaFile, setImageViewerOpen, setVideoPlayerOpen]);

    const handleDownload = useCallback((e: React.MouseEvent, file: DriveFile) => {
        e.stopPropagation();
        window.open(`/api/download/${file.id}`, '_blank');
    }, []);

    const virtualizer = useVirtualizer({
        count: files.length,
        getScrollElement: () => document.documentElement,
        estimateSize: () => ROW_HEIGHT,
        overscan: 10, // Render 10 extra rows for smooth scrolling
    });

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="text-6xl mb-6 animate-float">📭</div>
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">No files found</h3>
                <p className="text-sm text-muted-foreground/80">
                    Try adjusting your search or filters
                </p>
            </div>
        );
    }

    const virtualRows = virtualizer.getVirtualItems();

    return (
        <div className="glass-panel rounded-xl overflow-hidden m-4 border border-white/5">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="text-left p-4 font-medium text-sm text-muted-foreground">Name</th>
                            <th className={`text-left p-4 font-medium text-sm text-muted-foreground ${viewMode === 'details' ? '' : 'hidden'}`}>Type</th>
                            <th className={`text-left p-4 font-medium text-sm text-muted-foreground ${viewMode === 'details' ? '' : 'hidden'}`}>Size</th>
                            <th className={`text-left p-4 font-medium text-sm text-muted-foreground ${viewMode === 'details' ? '' : 'hidden'}`}>Modified</th>
                            <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody ref={tbodyRef}>
                        {/* Spacer row for items above the visible window */}
                        {virtualRows.length > 0 && virtualRows[0].start > 0 && (
                            <tr>
                                <td colSpan={5} style={{ height: virtualRows[0].start, padding: 0, border: 'none' }} />
                            </tr>
                        )}

                        {virtualRows.map((virtualRow) => {
                            const file = files[virtualRow.index];
                            return (
                                <FileRow
                                    key={file.id}
                                    file={file}
                                    index={virtualRow.index}
                                    totalFiles={files.length}
                                    viewMode={viewMode}
                                    onFileClick={onFileClick}
                                    onPreview={handlePreview}
                                    onDownload={handleDownload}
                                />
                            );
                        })}

                        {/* Spacer row for items below the visible window */}
                        {virtualRows.length > 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        height: virtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1].end),
                                        padding: 0,
                                        border: 'none',
                                    }}
                                />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
