import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;

        if (!fileId) {
            return new NextResponse('File ID is required', { status: 400 });
        }

        // Get file details to access mimeType and size
        const file = await driveClient.getFile(fileId);
        if (!file) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Parse range header
        const range = request.headers.get('range');
        const fileSize = parseInt(file.size || '0');

        // Get the stream from Google Drive (with range if provided)
        const response = await driveClient.getFileStream(fileId, range || undefined);

        // Create headers
        const headers = new Headers();
        headers.set('Content-Type', file.mimeType || 'application/octet-stream');
        headers.set('Accept-Ranges', 'bytes');

        // Check if we are serving partial content
        // Note: Google Drive API returns 2xx for range requests, usually 206 if range is valid.
        // We need to construct the Content-Range header if we want the browser to be happy.
        // However, axios/google-drive client response might contain the headers from Google.

        let status = 200;

        // If a range was requested and effective, we should return 206
        if (range && fileSize > 0) {
            status = 206;

            // Parse the requested range to build the Content-Range header
            // Range format: "bytes=start-end"
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            headers.set('Content-Length', chunksize.toString());
        } else {
            if (file.size) {
                headers.set('Content-Length', file.size);
            }
        }

        // Create a ReadableStream from the node stream
        const iterator = response.data as any;
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of iterator) {
                    controller.enqueue(chunk);
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            status,
            headers,
        });

    } catch (error: any) {
        console.error('Error streaming file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
