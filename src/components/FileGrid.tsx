'use client';

import { DriveFile } from '@/types';
import FileCard from './FileCard';
import { useFileStore } from '@/store/useFileStore';
import { useUIStore } from '@/store/useUIStore';
import { isImage, isVideo, isFolder } from '@/utils/fileHelpers';

interface FileGridProps {
    files: DriveFile[];
    onFileClick: (file: DriveFile) => void;
}

export default function FileGrid({ files, onFileClick }: FileGridProps) {
    const { setCurrentMediaFile, setImageViewerOpen, setVideoPlayerOpen } = useUIStore();

    const handlePreview = (file: DriveFile) => {
        setCurrentMediaFile(file);

        if (isImage(file.mimeType)) {
            setImageViewerOpen(true);
        } else if (isVideo(file.mimeType)) {
            setVideoPlayerOpen(true);
        }
    };

    const handleDownload = (file: DriveFile) => {
        // Always use API download endpoint for secure proxying
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4">
            {files.map((file) => (
                <FileCard
                    key={file.id}
                    file={file}
                    onClick={() => onFileClick(file)}
                    onPreview={() => handlePreview(file)}
                    onDownload={() => handleDownload(file)}
                />
            ))}
        </div>
    );
}
