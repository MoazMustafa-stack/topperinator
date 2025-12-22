import { YoutubeTranscript } from "youtube-transcript";
import { NextRequest, NextResponse } from "next/server";

interface TranscriptItem {
    offset: number;
    duration: number;
    text: string;
}

function formatSRTTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { videoId, options } = body;    

        if (!videoId) {
            return NextResponse.json({
                success: false,
                error: "Video ID is required"
            }, { status: 400 });
        }

        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: options?.language || "en"
        });

        let formattedTranscript = '';
        let wordCount = 0;

        if (options?.format === 'txt') {
            if (options?.includeTimestamps) {
                formattedTranscript = transcriptData.map((item: TranscriptItem) => {
                    const minutes = Math.floor(item.offset / 60000);
                    const seconds = Math.floor((item.offset % 60000) / 1000);
                    return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}] ${item.text}`;
                }).join('\n');
            } else {
                formattedTranscript = transcriptData.map((item: TranscriptItem) => item.text).join(' ');
            }
        } else if (options?.format === 'json') {
            formattedTranscript = JSON.stringify(transcriptData, null, 2);
        } else if (options?.format === 'srt') {
            formattedTranscript = transcriptData.map((item: TranscriptItem, index: number) => {
                const startTime = formatSRTTime(item.offset);
                const endTime = formatSRTTime(item.offset + item.duration);
                return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
            }).join('\n');
        }

        wordCount = formattedTranscript.split(' ').length;

        return NextResponse.json({
            success: true,
            transcript: formattedTranscript,
            wordCount: wordCount
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Transcript unavailable';
        return NextResponse.json({ 
            success: false,
            error: errorMessage}, { status: 400 });
    } 
}

