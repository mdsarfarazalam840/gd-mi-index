'use client';

import { DriveFile } from '@/types';
import FileCard from './FileCard';
import { useUIStore } from '@/store/useUIStore';
import { isImage, isVideo, isFolder } from '@/utils/fileHelpers';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useCallback, useEffect, useState } from 'react';

interface FileGridProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
}

// Calculate number of columns based on container width
function getColumnCount(width: number): number {
    if (width >= 1536) return 5;  // 2xl
    if (width >= 1280) return 4;  // xl
    if (width >= 1024) return 3;  // lg
    if (width >= 640) return 2;   // sm
    return 1;
}

const ESTIMATED_ROW_HEIGHT = 300; // Approximate, will be measured

export default function FileGrid({ files, onFileClick }: FileGridProps) {
    const { setCurrentMediaFile, setImageViewerOpen, setVideoPlayerOpen } = useUIStore();
    const parentRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(4);

    // Observe container width for responsive columns
    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const updateCols = () => {
            setColumnCount(getColumnCount(el.clientWidth));
        };

        updateCols();

        const resizeObserver = new ResizeObserver(() => updateCols());
        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
    }, []);

    const handlePreview = useCallback((file: DriveFile) => {
        setCurrentMediaFile(file);
        if (isImage(file.mimeType)) {
            setImageViewerOpen(true);
        } else if (isVideo(file.mimeType)) {
            setVideoPlayerOpen(true);
        }
    }, [setCurrentMediaFile, setImageViewerOpen, setVideoPlayerOpen]);

    const handleDownload = useCallback((file: DriveFile) => {
        window.open(`/api/download/${file.id}`, '_blank');
    }, []);

    // Chunk files into rows based on column count
    const rows = useMemo(() => {
        const result: DriveFile[][] = [];
        for (let i = 0; i < files.length; i += columnCount) {
            result.push(files.slice(i, i + columnCount));
        }
        return result;
    }, [files, columnCount]);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => document.documentElement,
        estimateSize: () => ESTIMATED_ROW_HEIGHT,
        overscan: 3,
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
        <div ref={parentRef} className="p-4">
            <div
                style={{
                    height: virtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                        <div
                            key={virtualRow.key}
                            ref={virtualizer.measureElement}
                            data-index={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                        >
                            <div
                                className="grid gap-4 pb-4"
                                style={{
                                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                                }}
                            >
                                {row.map((file) => (
                                    <FileCard
                                        key={file.id}
                                        file={file}
                                        onClick={() => onFileClick(file)}
                                        onPreview={() => handlePreview(file)}
                                        onDownload={() => handleDownload(file)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
