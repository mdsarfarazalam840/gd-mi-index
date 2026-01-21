import { NextRequest, NextResponse } from 'next/server';
import { searchMovieMetadata } from '@/lib/tmdb';

export const runtime = 'edge'; // Optional: Use edge runtime for speed if supported, or standard Node

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const metadata = await searchMovieMetadata(query);

    // Cache the result for 1 hour to stay within rate limits and improve speed
    return NextResponse.json(metadata, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
    });
}
