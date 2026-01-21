'use client';

import { Download, Eye, Folder, File, Clock } from 'lucide-react';
import { DriveFile } from '@/types';
import { formatFileSize, formatDate, getFileIcon, isFolder, isImage, isVideo } from '@/utils/fileHelpers';
import { useUIStore } from '@/store/useUIStore';

interface FileListProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
    viewMode?: 'list' | 'details';
}

export default function FileList({ files, onFileClick, viewMode = 'list' }: FileListProps) {
    const { setCurrentMediaFile, setImageViewerOpen, setVideoPlayerOpen } = useUIStore();

    const handlePreview = (e: React.MouseEvent, file: DriveFile) => {
        e.stopPropagation();
        setCurrentMediaFile(file);

        if (isImage(file.mimeType)) {
            setImageViewerOpen(true);
        } else if (isVideo(file.mimeType)) {
            setVideoPlayerOpen(true);
        }
    };

    const handleDownload = (e: React.MouseEvent, file: DriveFile) => {
        e.stopPropagation();
        window.open(`/api/download/${file.id}`, '_blank');
    };

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border/40 rounded-lg overflow-hidden m-4">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/40 bg-muted/30">
                            <th className="text-left p-3 font-medium text-sm">Name</th>
                            <th className={`text-left p-3 font-medium text-sm ${viewMode === 'details' ? '' : 'hidden'}`}>Type</th>
                            <th className={`text-left p-3 font-medium text-sm ${viewMode === 'details' ? '' : 'hidden'}`}>Size</th>
                            <th className={`text-left p-3 font-medium text-sm ${viewMode === 'details' ? '' : 'hidden'}`}>Modified</th>
                            <th className="text-right p-3 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => {
                            const canPreview = isImage(file.mimeType) || isVideo(file.mimeType);

                            return (
                                <tr
                                    key={file.id}
                                    onClick={() => onFileClick(file)}
                                    className={`cursor-pointer hover:bg-accent/50 smooth-transition ${index !== files.length - 1 ? 'border-b border-border/20' : ''
                                        }`}
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {isFolder(file.mimeType) ? '📁' : getFileIcon(file.mimeType)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground md:hidden">
                                                    {file.size && formatFileSize(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={`p-3 text-sm text-muted-foreground ${viewMode === 'details' ? '' : 'hidden'}`}>
                                        <span className="capitalize">{file.category}</span>
                                    </td>

                                    <td className={`p-3 text-sm text-muted-foreground ${viewMode === 'details' ? '' : 'hidden'}`}>
                                        {file.size ? formatFileSize(file.size) : '-'}
                                    </td>

                                    <td className={`p-3 text-sm text-muted-foreground ${viewMode === 'details' ? '' : 'hidden'}`}>
                                        {file.modifiedTime ? formatDate(file.modifiedTime) : '-'}
                                    </td>

                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {canPreview && (
                                                <button
                                                    onClick={(e) => handlePreview(e, file)}
                                                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg smooth-transition"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            )}

                                            {!isFolder(file.mimeType) && (
                                                <button
                                                    onClick={(e) => handleDownload(e, file)}
                                                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg smooth-transition"
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
