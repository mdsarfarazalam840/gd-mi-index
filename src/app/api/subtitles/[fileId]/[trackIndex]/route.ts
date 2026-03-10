import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string, trackIndex: string }> }
) {
    try {
        const { fileId, trackIndex } = await params;

        if (!fileId || !trackIndex) {
            return new NextResponse('File ID and Track Index are required', { status: 400 });
        }

        // Get file details to verify existence
        const file = await driveClient.getFile(fileId);
        if (!file) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Get the full stream from Google Drive
        const response = await driveClient.getFileStream(fileId);
        const inputStream = response.data as any;

        // Create a PassThrough stream for the converted output
        const outputStream = new PassThrough();

        // FFmpeg command:
        // -i pipe:0 -> read from stdin
        // -map 0:[trackIndex] -> select the specific subtitle track
        // -f webvtt -> output format webvtt
        // pipe:1 -> write to stdout
        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-map', `0:${trackIndex}`,
            '-f', 'webvtt',
            'pipe:1'
        ]);

        // Pipe input to ffmpeg
        inputStream.pipe(ffmpeg.stdin);

        // Handle ffmpeg errors
        ffmpeg.stderr.on('data', (data) => {
            // console.log(`ffmpeg stderr: ${data}`);
        });

        ffmpeg.on('error', (err) => {
            console.error('ffmpeg process error:', err);
            outputStream.end();
        });

        // Pipe ffmpeg output to our response stream
        ffmpeg.stdout.pipe(outputStream);

        // Create a ReadableStream for Next.js response
        const webStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of outputStream) {
                    controller.enqueue(chunk);
                }
                controller.close();
            },
        });

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': 'text/vtt',
                'Cache-Control': 'public, max-age=3600',
            },
        });

    } catch (error: any) {
        console.error('Error extracting subtitles:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
