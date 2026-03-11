import { NextRequest, NextResponse } from 'next/server';
import { driveClient } from '@/lib/google-drive';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execPromise = promisify(exec);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;

        if (!fileId) {
            return new NextResponse('File ID is required', { status: 400 });
        }

        // Get file details
        const file = await driveClient.getFile(fileId);
        if (!file) {
            return new NextResponse('File not found', { status: 404 });
        }

        // We only need the first few MBs to detect tracks
        const range = 'bytes=0-10485759'; // 10MB
        const response = await driveClient.getFileStream(fileId, range);

        // Save temporary chunk to detect tracks
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `probe_${fileId}_${Date.now()}.tmp`);
        const writeStream = fs.createWriteStream(tempFilePath);

        const iterator = response.data as any;
        for await (const chunk of iterator) {
            writeStream.write(chunk);
        }
        writeStream.end();

        // Wait for write to finish
        await new Promise<void>((resolve) => writeStream.on('finish', () => resolve()));

        // Run ffprobe
        const { stdout } = await execPromise(
            `ffprobe -v quiet -print_format json -show_streams -show_format "${tempFilePath}"`
        );

        // Cleanup temp file
        fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        const data = JSON.parse(stdout);

        const tracks = {
            audio: data.streams
                .filter((s: any) => s.codec_type === 'audio')
                .map((s: any, index: number) => ({
                    index: s.index,
                    label: s.tags?.title || `Audio Track ${index + 1}`,
                    language: s.tags?.language || 'unknown',
                    codec: s.codec_name,
                })),
            subtitle: data.streams
                .filter((s: any) => s.codec_type === 'subtitle')
                .map((s: any, index: number) => ({
                    index: s.index,
                    label: s.tags?.title || `Subtitle Track ${index + 1}`,
                    language: s.tags?.language || 'unknown',
                    codec: s.codec_name,
                }))
        };

        return NextResponse.json(tracks);

    } catch (error: any) {
        console.error('Error detecting tracks:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
