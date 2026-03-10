import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;
        const { searchParams } = new URL(request.url);
        const audioTrackIndex = searchParams.get('audioTrack');

        if (!fileId) {
            return new NextResponse('File ID is required', { status: 400 });
        }

        // Get file details to access mimeType and size
        const file = await driveClient.getFile(fileId);
        if (!file) {
            return new NextResponse('File not found', { status: 404 });
        }

        const range = request.headers.get('range');
        const fileSize = parseInt(file.size || '0');

        // If audioTrack is specified, we use ffmpeg to remux
        if (audioTrackIndex !== null) {
            console.log(`Streaming with audio track index: ${audioTrackIndex}`);

            // For FFmpeg remuxing, we can't easily support range requests if the output format is not stable
            // However, we can use fragmented MP4 to allow the browser to play it as a stream
            const response = await driveClient.getFileStream(fileId);
            const inputStream = response.data as any;
            const outputStream = new PassThrough();

            // FFmpeg command to map video and selected audio track
            // -i pipe:0 -> read from stdin
            // -map 0:v:0 -> first video track
            // -map 0:a:${audioTrackIndex} -> selected audio track
            // -c copy -> copy both codecs (no transcoding, very fast)
            // -f mp4 -movflags frag_keyframe+empty_moov+default_base_moof -> fragmented MP4
            // pipe:1 -> write to stdout
            const ffmpeg = spawn('ffmpeg', [
                '-i', 'pipe:0',
                '-map', '0:v:0',
                '-map', `0:${audioTrackIndex}`,
                '-c', 'copy',
                '-f', 'mp4',
                '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
                'pipe:1'
            ]);

            inputStream.pipe(ffmpeg.stdin);

            ffmpeg.stderr.on('data', (data) => {
                // console.log(`ffmpeg stderr: ${data}`);
            });

            ffmpeg.on('error', (err) => {
                console.error('ffmpeg process error:', err);
                outputStream.end();
            });

            ffmpeg.stdout.pipe(outputStream);

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
                    'Content-Type': 'video/mp4',
                    'Accept-Ranges': 'none', // Range requests are hard with fragmented remuxing
                },
            });
        }

        // Default behavior: Direct stream with range support
        const response = await driveClient.getFileStream(fileId, range || undefined);

        // Create headers
        const headers = new Headers();
        headers.set('Content-Type', file.mimeType || 'video/mp4');
        headers.set('Accept-Ranges', 'bytes');

        let status = 200;

        if (range && fileSize > 0) {
            status = 206;
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
