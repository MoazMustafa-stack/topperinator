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
import { extractVideoId, extractVideoIdFromShortUrl } from "@/utils/youtube";

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

  const handleExtract = async () => {
    const videoId = extractVideoId(url) || extractVideoIdFromShortUrl(url);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }

    setIsExtracting(true);
    setProgress([{
      videoId,
      title: metadata?.title || 'Processing...',
      status: 'processing',
      message: 'Extracting transcript...'
    }]);

    try {
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
        setResults([{
          id: videoId,
          title: metadata?.title || 'Video',
          thumbnail: metadata?.thumbnail || '',
          transcript: data.transcript,
          wordCount: data.wordCount,
          status: 'success'
        }]);
        setProgress([{
          videoId,
          title: metadata?.title || 'Video',
          status: 'success',
          message: 'Transcript extracted successfully'
        }]);
      } else {
        setResults([{
          id: videoId,
          title: metadata?.title || 'Video',
          thumbnail: metadata?.thumbnail || '',
          transcript: '',
          wordCount: 0,
          status: 'failed',
          error: data.error
        }]);
        setProgress([{
          videoId,
          title: metadata?.title || 'Video',
          status: 'failed',
          message: data.error || 'Failed to extract transcript'
        }]);
      }
    } catch (error) {
      setResults([{
        id: videoId,
        title: metadata?.title || 'Video',
        thumbnail: metadata?.thumbnail || '',
        transcript: '',
        wordCount: 0,
        status: 'failed',
        error: 'Network error'
      }]);
      setProgress([{
        videoId,
        title: metadata?.title || 'Video',
        status: 'failed',
        message: 'Network error'
      }]);
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
