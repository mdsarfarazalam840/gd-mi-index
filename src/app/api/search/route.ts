import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';

        if (!query.trim()) {
            return NextResponse.json({
                success: false,
                error: 'Search query is required',
            }, { status: 400 });
        }

        const files = await driveClient.searchFiles(query);

        return NextResponse.json({
            success: true,
            data: files,
            count: files.length,
            query,
            totalSize: files.reduce((acc, file) => acc + parseInt(file.size || '0'), 0),
        });
    } catch (error: any) {
        console.error('Error searching files:', error);

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
                error: error.message || 'Failed to search files',
            },
            { status: 500 }
        );
    }
}
