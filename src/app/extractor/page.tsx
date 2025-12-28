"use client";

import { useState } from "react";
import InputModule from "@/components/extractor/InputModule";
import ProgressTracker from "@/components/extractor/ProgressTracker";
import ResultsGrid from "@/components/extractor/ResultsGrid";
import BulkActionsFooter from "@/components/extractor/BulkActionsFooter";
import StatsDisplay from "@/components/extractor/StatsDisplay";
import HelpSection from "@/components/extractor/HelpSection";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { 
  extractVideoId, 
  extractVideoIdFromShortUrl, 
  extractPlaylistId,
  extractChannelId,
  normalizePlaylistUrl,
  normalizeChannelUrl
} from "@/utils/youtube";
import { ASSETS } from "@/constants";

export type InputMode = "single" | "playlist" | "channel";

export interface TranscriptOptions {
  includeTimestamps: boolean;
  language: string;
  format: "txt" | "json" | "srt";
}

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  channelName?: string;
  playlistName?: string;
}

export interface TranscriptResult extends VideoMetadata {
  transcript: string;
  wordCount: number;
  status: "success" | "failed";
  error?: string;
}

export interface ProgressItem {
  videoId: string;
  title: string;
  status: "processing" | "success" | "failed";
  message: string;
}

export default function ExtractorPage() {
  const [inputMode, setInputMode] = useState<InputMode>("single");
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [options, setOptions] = useState<TranscriptOptions>({
    includeTimestamps: false,
    language: "en",
    format: "txt",
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [results, setResults] = useState<TranscriptResult[]>([]);

  const extractSingleVideo = async (videoId: string, videoMetadata?: VideoMetadata): Promise<TranscriptResult> => {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: videoId,
        options: options
      })
    });

    const data = await response.json();

    if (data.success) {
      return {
        id: videoId,
        title: videoMetadata?.title || 'Video',
        thumbnail: videoMetadata?.thumbnail || ASSETS.defaultThumbnail,
        transcript: data.transcript,
        wordCount: data.wordCount,
        status: 'success' as const,
        channelName: videoMetadata?.channelName,
        playlistName: videoMetadata?.playlistName
      };
    } else {
      return {
        id: videoId,
        title: videoMetadata?.title || 'Video',
        thumbnail: videoMetadata?.thumbnail || ASSETS.defaultThumbnail,
        transcript: '',
        wordCount: 0,
        status: 'failed' as const,
        error: data.error,
        channelName: videoMetadata?.channelName,
        playlistName: videoMetadata?.playlistName
      };
    }
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    setResults([]);
    setProgress([]);

    try {
      if (inputMode === 'single') {
        // Single video extraction
        const videoId = extractVideoId(url) || extractVideoIdFromShortUrl(url);
        if (!videoId) {
          alert("Invalid YouTube URL");
          setIsExtracting(false);
          return;
        }

        setProgress([{
          videoId,
          title: metadata?.title || 'Processing...',
          status: 'processing',
          message: 'Extracting transcript...'
        }]);

        try {
          const result = await extractSingleVideo(videoId, metadata || undefined);
          setResults([result]);
          setProgress([{
            videoId,
            title: result.title,
            status: result.status,
            message: result.status === 'success' ? 'Transcript extracted successfully' : (result.error || 'Failed')
          }]);
        } catch (error) {
          const errorResult: TranscriptResult = {
            id: videoId,
            title: metadata?.title || 'Video',
            thumbnail: metadata?.thumbnail || '',
            transcript: '',
            wordCount: 0,
            status: 'failed',
            error: 'Network error'
          };
          setResults([errorResult]);
          setProgress([{
            videoId,
            title: metadata?.title || 'Video',
            status: 'failed',
            message: 'Network error'
          }]);
        }
      } else if (inputMode === 'playlist') {
        // Playlist extraction
        const playlistId = extractPlaylistId(url);
        if (!playlistId) {
          alert("Invalid YouTube playlist URL");
          setIsExtracting(false);
          return;
        }

        const normalizedUrl = normalizePlaylistUrl(url);
        
        // Fetch playlist videos
        const playlistResponse = await fetch('/api/playlist/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistUrl: normalizedUrl })
        });

        const playlistData = await playlistResponse.json();

        if (!playlistData.success || !playlistData.videos || playlistData.videos.length === 0) {
          alert(playlistData.error || "Failed to extract playlist videos");
          setIsExtracting(false);
          return;
        }

        const videos = playlistData.videos;
        const playlistName = playlistData.playlistName;

        // Initialize progress for all videos
        const initialProgress: ProgressItem[] = videos.map((video: VideoMetadata) => ({
          videoId: video.id,
          title: video.title,
          status: 'processing',
          message: 'Waiting...'
        }));
        setProgress(initialProgress);

        // Process videos sequentially
        const results: TranscriptResult[] = [];
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          
          // Update progress
          setProgress(prev => prev.map((p, idx) => 
            idx === i 
              ? { ...p, status: 'processing' as const, message: 'Extracting transcript...' }
              : p
          ));

          try {
            const result = await extractSingleVideo(video.id, video);
            result.playlistName = playlistName;
            results.push(result);

            // Update progress
            setProgress(prev => prev.map((p, idx) => 
              idx === i 
                ? { 
                    ...p, 
                    status: result.status, 
                    message: result.status === 'success' ? 'Success' : (result.error || 'Failed')
                  }
                : p
            ));

            // Update results incrementally
            setResults([...results]);
          } catch (error) {
            const errorResult: TranscriptResult = {
              id: video.id,
              title: video.title,
              thumbnail: video.thumbnail,
              transcript: '',
              wordCount: 0,
              status: 'failed',
              error: 'Network error',
              playlistName: playlistName
            };
            results.push(errorResult);

            setProgress(prev => prev.map((p, idx) => 
              idx === i 
                ? { ...p, status: 'failed' as const, message: 'Network error' }
                : p
            ));

            setResults([...results]);
          }
        }
      } else if (inputMode === 'channel') {
        // Channel extraction
        const channelId = extractChannelId(url);
        if (!channelId) {
          alert("Invalid YouTube channel URL");
          setIsExtracting(false);
          return;
        }

        const normalizedUrl = normalizeChannelUrl(url);
        
        // Fetch channel videos
        const channelResponse = await fetch('/api/channel/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelUrl: normalizedUrl, maxVideos: 50 })
        });

        const channelData = await channelResponse.json();

        if (!channelData.success || !channelData.videos || channelData.videos.length === 0) {
          alert(channelData.error || "Failed to extract channel videos");
          setIsExtracting(false);
          return;
        }

        const videos = channelData.videos;
        const channelName = channelData.channelName;

        // Initialize progress for all videos
        const initialProgress: ProgressItem[] = videos.map((video: VideoMetadata) => ({
          videoId: video.id,
          title: video.title,
          status: 'processing',
          message: 'Waiting...'
        }));
        setProgress(initialProgress);

        // Process videos sequentially
        const results: TranscriptResult[] = [];
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          
          // Update progress
          setProgress(prev => prev.map((p, idx) => 
            idx === i 
              ? { ...p, status: 'processing' as const, message: 'Extracting transcript...' }
              : p
          ));

          try {
            const result = await extractSingleVideo(video.id, video);
            result.channelName = channelName;
            results.push(result);

            // Update progress
            setProgress(prev => prev.map((p, idx) => 
              idx === i 
                ? { 
                    ...p, 
                    status: result.status, 
                    message: result.status === 'success' ? 'Success' : (result.error || 'Failed')
                  }
                : p
            ));

            // Update results incrementally
            setResults([...results]);
          } catch (error) {
            const errorResult: TranscriptResult = {
              id: video.id,
              title: video.title,
              thumbnail: video.thumbnail,
              transcript: '',
              wordCount: 0,
              status: 'failed',
              error: 'Network error',
              channelName: channelName
            };
            results.push(errorResult);

            setProgress(prev => prev.map((p, idx) => 
              idx === i 
                ? { ...p, status: 'failed' as const, message: 'Network error' }
                : p
            ));

            setResults([...results]);
          }
        }
      }
    } catch (error) {
      console.error('Extraction error:', error);
      alert('An error occurred during extraction');
    } finally {
      setIsExtracting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] scanline-bg pb-32">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-[#c4ff0e] font-mono text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <header className="mb-12">
          <h1 className="text-[#c4ff0e] font-black text-5xl tracking-tight uppercase mb-4 font-mono">
            YOUTUBE TRANSCRIPT EXTRACTOR
          </h1>
          <p className="text-white/70 font-mono text-sm">
            Extract transcripts at scale. Built for students and teachers.
          </p>
        </header>

        <div className="space-y-12">
          <InputModule
            inputMode={inputMode}
            setInputMode={setInputMode}
            url={url}
            setUrl={setUrl}
            metadata={metadata}
            setMetadata={setMetadata}
            options={options}
            setOptions={setOptions}
            onExtract={handleExtract}
            isExtracting={isExtracting}
          />

          {isExtracting && progress.length > 0 && (
            <ProgressTracker progress={progress} />
          )}

          {results.length > 0 && (
            <>
              <StatsDisplay results={results} />
              <ResultsGrid results={results} options={options} />
              <BulkActionsFooter results={results} options={options} />
            </>
          )}
        </div>
      </div>
      
      <HelpSection />
    </div>
  );
}
