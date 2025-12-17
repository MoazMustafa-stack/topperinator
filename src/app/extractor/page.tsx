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
    setIsExtracting(true);
    setProgress([]);
    setResults([]);
    
    // Simulated extraction process
    const mockVideos = [
      { id: "1", title: "Introduction to Machine Learning", thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80" },
      { id: "2", title: "Deep Learning Fundamentals", thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80" },
    ];

    for (const video of mockVideos) {
      setProgress(prev => [...prev, {
        videoId: video.id,
        title: video.title,
        status: "processing",
        message: `Extracting transcript for "${video.title}"...`
      }]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const success = Math.random() > 0.2;
      
      setProgress(prev => prev.map(p => 
        p.videoId === video.id 
          ? { ...p, status: success ? "success" : "failed", message: success ? "Extraction complete" : "Transcript unavailable" }
          : p
      ));

      if (success) {
        setResults(prev => [...prev, {
          ...video,
          transcript: "This is a sample transcript content that would be extracted from the YouTube video. It contains the spoken words from the video in text format.",
          wordCount: 1247,
          status: "success"
        }]);
      } else {
        setResults(prev => [...prev, {
          ...video,
          transcript: "",
          wordCount: 0,
          status: "failed",
          error: "Transcript unavailable"
        }]);
      }
    }

    setIsExtracting(false);
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
          <h1 className="text-[#c4ff0e] font-black text-5xl tracking-tight uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            YOUTUBE TRANSCRIPT EXTRACTOR
          </h1>
          <p className="text-white/70 font-mono text-sm">
            Extract transcripts at scale. Built for researchers, creators, and AI enthusiasts.
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
