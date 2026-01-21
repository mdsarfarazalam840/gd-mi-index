import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const folderId = searchParams.get('folderId') || 'root';
        const pageToken = searchParams.get('pageToken') || undefined;

        console.log('API /files Request - Env Check:', {
            hasClientId: !!process.env.GOOGLE_CLIENT_ID,
            hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
            hasAccessToken: !!process.env.GOOGLE_ACCESS_TOKEN,
        });

        // User requested loading 10 files at a time
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        const { files, nextPageToken } = await driveClient.listFiles(folderId, pageToken, pageSize);

        return NextResponse.json({
            success: true,
            data: files,
            nextPageToken,
            count: files.length,
        });
    } catch (error: any) {
        console.error('Error fetching files:', error);

        // Check if it's an authentication error
        if (error.message?.includes('No access') || error.code === 401) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                    needsAuth: true,
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch files',
            },
            { status: 500 }
        );
    }
}
