import { FILE_TYPE_ICONS, FILE_CATEGORIES } from './constants';
import { format } from 'date-fns';

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number | string | undefined): string {
    if (!bytes) return '0 B';

    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;

    if (numBytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get icon for file type
 */
export function getFileIcon(mimeType: string): string {
    return FILE_TYPE_ICONS[mimeType] || '📄';
}

/**
 * Get file category
 */
export function getFileCategory(mimeType: string): string {
    for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
        if (types.includes(mimeType)) {
            return category.toLowerCase();
        }
    }
    return 'other';
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
    return FILE_CATEGORIES.IMAGE.includes(mimeType);
}

/**
 * Check if file is a video
 */
export function isVideo(mimeType: string): boolean {
    return FILE_CATEGORIES.VIDEO.includes(mimeType);
}

/**
 * Check if file is audio
 */
export function isAudio(mimeType: string): boolean {
    return FILE_CATEGORIES.AUDIO.includes(mimeType);
}

/**
 * Check if file is a folder
 */
export function isFolder(mimeType: string): boolean {
    return mimeType === 'application/vnd.google-apps.folder';
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';

    try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
        return 'Invalid date';
    }
}

/**
 * Format date to relative string (e.g., "2 hours ago")
 */
export function formatRelativeDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return formatDate(dateString);
    } catch {
        return 'Invalid date';
    }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Validate file type for media playback
 */
export function canPlayInBrowser(mimeType: string): boolean {
    return isImage(mimeType) || isVideo(mimeType) || isAudio(mimeType);
}

/**
 * Generate a random color for file type badge
 */
export function getFileTypeColor(category: string): string {
    const colors: Record<string, string> = {
        image: 'bg-purple-500/10 text-purple-500',
        video: 'bg-red-500/10 text-red-500',
        audio: 'bg-blue-500/10 text-blue-500',
        document: 'bg-green-500/10 text-green-500',
        archive: 'bg-orange-500/10 text-orange-500',
        code: 'bg-yellow-500/10 text-yellow-500',
        other: 'bg-gray-500/10 text-gray-500',
    };

    return colors[category] || colors.other;
}

/**
 * Encode file ID for URL
 */
export function encodeFileId(fileId: string): string {
    return encodeURIComponent(fileId);
}

/**
 * Decode file ID from URL
 */
export function decodeFileId(encodedId: string): string {
    return decodeURIComponent(encodedId);
}
