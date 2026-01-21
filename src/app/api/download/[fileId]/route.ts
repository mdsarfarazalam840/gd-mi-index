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

        // Get file details to access mimeType, size, and name
        const file = await driveClient.getFile(fileId);
        if (!file) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Get the stream from Google Drive
        const response = await driveClient.getFileStream(fileId);

        // Create headers
        const headers = new Headers();
        headers.set('Content-Type', file.mimeType || 'application/octet-stream');
        if (file.size) {
            headers.set('Content-Length', file.size);
        }

        // Force download with Content-Disposition
        // Encode filename to handle special characters
        const safeFileName = encodeURIComponent(file.name).replace(/['()]/g, escape).replace(/\*/g, '%2A');
        headers.set('Content-Disposition', `attachment; filename="${file.name}"; filename*=UTF-8''${safeFileName}`);

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
            status: 200,
            headers,
        });

    } catch (error: any) {
        console.error('Error downloading file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
