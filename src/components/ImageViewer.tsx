'use client';

import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useFileStore } from '@/store/useFileStore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { isImage } from '@/utils/fileHelpers';

export default function ImageViewer() {
    const { imageViewerOpen, setImageViewerOpen, currentMediaFile } = useUIStore();
    const { files } = useFileStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(1);

    // Get all image files
    const imageFiles = files.filter((file) => isImage(file.mimeType));

    useEffect(() => {
        if (currentMediaFile && imageViewerOpen) {
            const index = imageFiles.findIndex((f) => f.id === currentMediaFile.id);
            if (index !== -1) setCurrentIndex(index);
        }
    }, [currentMediaFile, imageFiles, imageViewerOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!imageViewerOpen) return;

            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [imageViewerOpen, currentIndex]);

    if (!imageViewerOpen || !currentMediaFile || imageFiles.length === 0) {
        return null;
    }

    const currentImage = imageFiles[currentIndex];

    const handleClose = () => {
        setImageViewerOpen(false);
        setZoom(1);
    };

    const handleNext = () => {
        if (currentIndex < imageFiles.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setZoom(1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setZoom(1);
        }
    };

    const handleDownload = () => {
        window.open(`/api/download/${currentImage.id}`, '_blank');
    };

    const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 3));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.5, 0.5));

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-fade-in">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{currentImage.name}</h3>
                        <p className="text-white/60 text-sm">
                            {currentIndex + 1} of {imageFiles.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            className="p-2 text-white hover:bg-white/10 rounded-lg smooth-transition disabled:opacity-50"
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </button>

                        <span className="text-white text-sm min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>

                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 3}
                            className="p-2 text-white hover:bg-white/10 rounded-lg smooth-transition disabled:opacity-50"
                            title="Zoom In"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </button>

                        <div className="w-px h-6 bg-white/20 mx-2" />

                        <button
                            onClick={handleDownload}
                            className="p-2 text-white hover:bg-white/10 rounded-lg smooth-transition"
                            title="Download"
                        >
                            <Download className="h-5 w-5" />
                        </button>

                        <button
                            onClick={handleClose}
                            className="p-2 text-white hover:bg-white/10 rounded-lg smooth-transition"
                            title="Close (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Container */}
            <div className="absolute inset-0 flex items-center justify-center p-4 pt-20">
                <div
                    className="relative max-w-full max-h-full smooth-transition"
                    style={{ transform: `scale(${zoom})` }}
                >
                    {currentImage.webContentLink && (
                        <Image
                            src={`/api/stream/${currentImage.id}`}
                            alt={currentImage.name}
                            width={1920}
                            height={1080}
                            className="max-w-full max-h-[calc(100vh-120px)] object-contain"
                            unoptimized
                            priority
                        />
                    )}
                </div>
            </div>

            {/* Navigation */}
            {imageFiles.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full smooth-transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Previous (←)"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === imageFiles.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full smooth-transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Next (→)"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Thumbnails */}
            {imageFiles.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {imageFiles.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setZoom(1);
                                }}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 smooth-transition ${index === currentIndex
                                    ? 'border-primary'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                {image.thumbnailLink && (
                                    <Image
                                        src={image.thumbnailLink}
                                        alt={image.name}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                        unoptimized
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
