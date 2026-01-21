import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';

/**
 * GET /api/auth/callback
 * Handles OAuth callback and exchanges code for tokens
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(new URL('/?error=no_code', request.url));
        }

        // Exchange code for tokens
        const tokens = await driveClient.getTokens(code);

        // In a production app, you would save these tokens securely
        // For now, we'll redirect back to the home page
        console.log('Tokens received:', {
            access_token: tokens.access_token ? 'present' : 'missing',
            refresh_token: tokens.refresh_token ? 'present' : 'missing',
        });

        // Set the access token
        if (tokens.access_token) {
            driveClient.setAccessToken(tokens.access_token);
        }

        return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
        console.error('Error in OAuth callback:', error);
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
}
