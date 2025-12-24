import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

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

// Fetch transcript using youtube-transcript library
async function fetchTranscriptData(videoId: string, language: string = "en"): Promise<TranscriptItem[] | null> {
    try {
        console.log(`Fetching transcript for ${videoId}...`);
        
        let captions = await YoutubeTranscript.fetchTranscript({
            videoId,
            lang: language
        });

        if (!captions || captions.length === 0) {
            console.warn(`No captions found for language: ${language}`);
            
            if (language !== 'en') {
                console.log('Trying default language...');
                captions = await YoutubeTranscript.fetchTranscript({ videoId });
                if (!captions || captions.length === 0) {
                    return null;
                }
            } else {
                return null;
            }
        }

        console.log('Sample caption:', captions[0]);
        return convertCaptions(captions);
    } catch (error) {
        console.error('Error fetching transcript:', error instanceof Error ? error.message : error);
        return null;
    }
}

function convertCaptions(captions: any[]): TranscriptItem[] {
    const transcripts: TranscriptItem[] = [];
    
    for (const caption of captions) {
        transcripts.push({
            offset: caption.start || 0,
            duration: caption.duration || 3000,
            text: (caption.text || '').trim()
        });
    }
    
    return transcripts;
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

        console.log(`=== Transcript Extraction Request ===`);
        console.log(`Video ID: ${videoId}`);
        console.log(`Options:`, options);

        // Fetch transcript using youtube-transcript library
        let transcriptData = await fetchTranscriptData(videoId, options?.language || "en");
        
        // Try without language filter if failed
        if (!transcriptData) {
            console.warn(`Failed with language ${options?.language}, trying with default language...`);
            transcriptData = await fetchTranscriptData(videoId, "en");
        }

        console.log(`Final transcript data:`, transcriptData?.length || 0, 'items');

        if (!transcriptData || transcriptData.length === 0) {
            console.error(`Could not retrieve transcript. Possible causes:
            1. Video has no captions/transcripts
            2. Video is age-restricted or unavailable in your region
            3. Request was rate-limited`);
            return NextResponse.json({
                success: false,
                error: "Could not retrieve transcript. Please ensure the video has captions available."
            }, { status: 400 });
        }

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
        } else {
            // Default to txt if no format specified
            formattedTranscript = transcriptData.map((item: TranscriptItem) => item.text).join(' ');
        }

        wordCount = formattedTranscript.trim().split(/\s+/).filter(word => word.length > 0).length;

        console.log(`✓ Transcript formatted successfully. Word count: ${wordCount}`);

        return NextResponse.json({
            success: true,
            transcript: formattedTranscript,
            wordCount: wordCount
        });
        
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ API Error:`, errorMessage);
        return NextResponse.json({ 
            success: false,
            error: `Failed to extract transcript: ${errorMessage}`
        }, { status: 400 });
    } 
}
