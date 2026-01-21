import { google } from 'googleapis';
import { DriveFile } from '@/types';
import { getFileCategory, isFolder } from '@/utils/fileHelpers';
import { fileCache } from './cache';

const SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
];

export class GoogleDriveClient {
    private auth;

    constructor() {
        this.auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
        );

        // Set credentials if access token is available
        const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        console.log('Google Drive Client Initialized with:', {
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
            redirectUri: process.env.GOOGLE_REDIRECT_URI || 'Default',
            accessToken: accessToken ? 'Set' : 'Missing',
            refreshToken: refreshToken ? 'Set' : 'Missing',
        });

        if (accessToken || refreshToken) {
            this.auth.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
        }
    }

    /**
     * Generate OAuth URL for user authorization
     */
    getAuthUrl(): string {
        return this.auth.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent',
        });
    }

    /**
     * Exchange authorization code for tokens
     */
    async getTokens(code: string) {
        const { tokens } = await this.auth.getToken(code);
        this.auth.setCredentials(tokens);
        return tokens;
    }

    /**
     * Set access token
     */
    setAccessToken(token: string) {
        this.auth.setCredentials({ access_token: token });
    }

    /**
     * List files in a folder with pagination
     */
    async listFiles(folderId?: string, pageToken?: string, pageSize: number = 50): Promise<{ files: DriveFile[]; nextPageToken?: string | null }> {
        // Create cache key
        const cacheKey = `files:${folderId || 'root'}:${pageToken || 'first'}:${pageSize}`;

        // Check cache
        const cached = fileCache.get<{ files: DriveFile[]; nextPageToken?: string | null }>(cacheKey);
        if (cached) {
            console.log(`[Cache Hit] Serving files for ${cacheKey}`);
            return cached;
        }

        try {
            console.log(`[API Call] Fetching files for ${cacheKey}`);
            const drive = google.drive({ version: 'v3', auth: this.auth });

            const query = folderId && folderId !== 'root'
                ? `'${folderId}' in parents and trashed = false`
                : `'root' in parents and trashed = false`;

            const response = await drive.files.list({
                q: query,
                pageSize,
                pageToken,
                fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, iconLink, webViewLink, webContentLink, parents)',
                orderBy: 'folder,name',
            });

            const files = (response.data.files || []).map((file): DriveFile => ({
                id: file.id || '',
                name: file.name || 'Untitled',
                mimeType: file.mimeType || 'application/octet-stream',
                size: file.size || undefined,
                modifiedTime: file.modifiedTime || undefined,
                createdTime: file.createdTime || undefined,
                thumbnailLink: file.thumbnailLink || undefined,
                iconLink: file.iconLink || undefined,
                webViewLink: file.webViewLink || undefined,
                webContentLink: file.webContentLink || undefined,
                parents: file.parents || undefined,
                isFolder: file.mimeType === 'application/vnd.google-apps.folder',
                category: getFileCategory(file.mimeType || 'application/octet-stream'),
            }));

            const result = {
                files,
                nextPageToken: response.data.nextPageToken,
            };

            // Store in cache
            fileCache.set(cacheKey, result);

            return result;
        } catch (error: any) {
            console.error('Error listing files details:', {
                message: error.message,
                code: error.code,
                status: error.status,
                errors: error.errors
            });
            throw new Error('Failed to list files from Google Drive');
        }
    }

    /**
     * Search files
     */
    async searchFiles(query: string): Promise<DriveFile[]> {
        try {
            const drive = google.drive({ version: 'v3', auth: this.auth });

            const searchQuery = `name contains '${query}' and trashed = false`;

            const response = await drive.files.list({
                q: searchQuery,
                pageSize: 50,
                fields: 'files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, iconLink, webViewLink, webContentLink, parents)',
                orderBy: 'name',
            });

            const files = (response.data.files || []).map((file): DriveFile => ({
                id: file.id || '',
                name: file.name || 'Untitled',
                mimeType: file.mimeType || 'application/octet-stream',
                size: file.size || undefined,
                modifiedTime: file.modifiedTime || undefined,
                createdTime: file.createdTime || undefined,
                thumbnailLink: file.thumbnailLink || undefined,
                iconLink: file.iconLink || undefined,
                webViewLink: file.webViewLink || undefined,
                webContentLink: file.webContentLink || undefined,
                parents: file.parents || undefined,
                isFolder: file.mimeType === 'application/vnd.google-apps.folder',
                category: getFileCategory(file.mimeType || 'application/octet-stream'),
            }));

            return files;
        } catch (error) {
            console.error('Error searching files:', error);
            throw new Error('Failed to search files from Google Drive');
        }
    }

    /**
     * Get file by ID
     */
    async getFile(fileId: string): Promise<DriveFile | null> {
        try {
            const drive = google.drive({ version: 'v3', auth: this.auth });

            const response = await drive.files.get({
                fileId,
                fields: 'id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, iconLink, webViewLink, webContentLink, parents',
            });

            const file = response.data;

            return {
                id: file.id || '',
                name: file.name || 'Untitled',
                mimeType: file.mimeType || 'application/octet-stream',
                size: file.size || undefined,
                modifiedTime: file.modifiedTime || undefined,
                createdTime: file.createdTime || undefined,
                thumbnailLink: file.thumbnailLink || undefined,
                iconLink: file.iconLink || undefined,
                webViewLink: file.webViewLink || undefined,
                webContentLink: file.webContentLink || undefined,
                parents: file.parents || undefined,
                isFolder: file.mimeType === 'application/vnd.google-apps.folder',
                category: getFileCategory(file.mimeType || 'application/octet-stream'),
            };
        } catch (error) {
            console.error('Error getting file:', error);
            return null;
        }
    }

    /**
     * Get download URL for a file
     */
    getDownloadUrl(fileId: string): string {
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }

    /**
     * Get streaming URL for video
     */
    getStreamUrl(fileId: string): string {
        return `/api/stream/${fileId}`;
    }

    /**
     * Get file stream with range support
     */
    async getFileStream(fileId: string, range?: string) {
        try {
            const drive = google.drive({ version: 'v3', auth: this.auth });

            const params: any = { fileId, alt: 'media' };

            // Forward range header if present
            const headers: any = {};
            if (range) {
                headers.Range = range;
            }

            const response = await drive.files.get(
                params,
                {
                    responseType: 'stream',
                    headers
                }
            );

            return response;
        } catch (error) {
            console.error('Error getting file stream:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const driveClient = new GoogleDriveClient();
