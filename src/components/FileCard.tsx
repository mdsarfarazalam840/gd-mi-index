'use client';

import { memo } from 'react';
import { Folder, Download, Eye, MoreVertical, Clock } from 'lucide-react';
import { DriveFile } from '@/types';
import { formatFileSize, formatRelativeDate, getFileIcon, getFileTypeColor, isFolder, isImage, isVideo } from '@/utils/fileHelpers';
import Image from 'next/image';

interface FileCardProps {
    file: DriveFile;
    onClick: () => void;
    onDownload?: () => void;
    onPreview?: () => void;
}

export default memo(function FileCard({ file, onClick, onDownload, onPreview }: FileCardProps) {
    const canPreview = isImage(file.mimeType) || isVideo(file.mimeType);
    const showThumbnail = file.thumbnailLink && isImage(file.mimeType);

    return (
        <div
            className="group relative glass-panel rounded-xl overflow-hidden hover:border-primary/30 card-hover cursor-pointer"
            onClick={onClick}
        >
            {/* Thumbnail/Icon */}
            <div className="relative aspect-video bg-white/[0.02] group-hover:bg-white/[0.04] smooth-transition flex items-center justify-center overflow-hidden">
                {showThumbnail ? (
                    <Image
                        src={file.thumbnailLink!}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                    />
                ) : (
                    <div className="text-6xl">
                        {isFolder(file.mimeType) ? '📁' : getFileIcon(file.mimeType)}
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] group-hover:bg-black/40 smooth-transition flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    {canPreview && onPreview && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview();
                            }}
                            className="p-2.5 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full smooth-transition hover:scale-110 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            title="Preview"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    )}

                    {!isFolder(file.mimeType) && onDownload && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload();
                            }}
                            className="p-2.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full smooth-transition hover:scale-110 border border-white/10"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* File Info */}
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium truncate flex-1 group-hover:text-primary smooth-transition" title={file.name}>
                        {file.name}
                    </h3>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded smooth-transition"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${getFileTypeColor(file.category)}`}>
                        {file.category}
                    </span>

                    {file.size && (
                        <span className="text-muted-foreground">
                            {formatFileSize(file.size)}
                        </span>
                    )}
                </div>

                {file.modifiedTime && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeDate(file.modifiedTime)}</span>
                    </div>
                )}
            </div>
        </div>
    );
});
