// File type icons and categorization
export const FILE_TYPE_ICONS: Record<string, string> = {
    // Documents
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.ms-powerpoint': '📽️',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
    'text/plain': '📄',

    // Images
    'image/jpeg': '🖼️',
    'image/jpg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️',
    'image/svg+xml': '🎨',

    // Videos
    'video/mp4': '🎬',
    'video/x-matroska': '🎬',
    'video/webm': '🎬',
    'video/quicktime': '🎬',
    'video/x-msvideo': '🎬',

    // Audio
    'audio/mpeg': '🎵',
    'audio/mp3': '🎵',
    'audio/wav': '🎵',
    'audio/ogg': '🎵',
    'audio/flac': '🎵',

    // Archives
    'application/zip': '📦',
    'application/x-rar-compressed': '📦',
    'application/x-7z-compressed': '📦',
    'application/x-tar': '📦',
    'application/gzip': '📦',

    // Code
    'text/html': '💻',
    'text/css': '💻',
    'text/javascript': '💻',
    'application/json': '💻',
    'application/xml': '💻',

    // Folders
    'application/vnd.google-apps.folder': '📁',
};

export const FILE_CATEGORIES = {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    VIDEO: ['video/mp4', 'video/x-matroska', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'],
    AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac'],
    DOCUMENT: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ],
    ARCHIVE: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
    ],
    CODE: ['text/html', 'text/css', 'text/javascript', 'application/json', 'application/xml'],
    FOLDER: ['application/vnd.google-apps.folder'],
};

export const MIME_TYPE_MAPPINGS: Record<string, string> = {
    // Google Workspace types
    'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const VIEW_MODES = {
    GRID: 'grid',
    LIST: 'list',
    DETAILS: 'details',
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export const SORT_OPTIONS = {
    NAME_ASC: 'name_asc',
    NAME_DESC: 'name_desc',
    SIZE_ASC: 'size_asc',
    SIZE_DESC: 'size_desc',
    DATE_ASC: 'date_asc',
    DATE_DESC: 'date_desc',
} as const;

export const ITEMS_PER_PAGE = 50;
export const MAX_SEARCH_RESULTS = 100;
export const CACHE_TTL = 60 * 5; // 5 minutes

export const GOOGLE_DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export const API_ENDPOINTS = {
    FILES: '/api/files',
    SEARCH: '/api/search',
    DOWNLOAD: '/api/download',
    STREAM: '/api/stream',
    AUTH: '/api/auth',
};
