import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';

/**
 * GET /api/auth
 * Returns the OAuth authorization URL
 */
export async function GET(request: NextRequest) {
    try {
        const authUrl = driveClient.getAuthUrl();

        return NextResponse.json({
            success: true,
            authUrl,
        });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate authorization URL',
            },
            { status: 500 }
        );
    }
}
