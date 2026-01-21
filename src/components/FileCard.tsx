'use client';

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

export default function FileCard({ file, onClick, onDownload, onPreview }: FileCardProps) {
    const canPreview = isImage(file.mimeType) || isVideo(file.mimeType);
    const showThumbnail = file.thumbnailLink && isImage(file.mimeType);

    return (
        <div
            className="group relative bg-card border border-border/40 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg card-hover cursor-pointer"
            onClick={onClick}
        >
            {/* Thumbnail/Icon */}
            <div className="relative aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 smooth-transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {canPreview && onPreview && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview();
                            }}
                            className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg smooth-transition"
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
                            className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg smooth-transition"
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* File Info */}
            <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium truncate flex-1" title={file.name}>
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
}
