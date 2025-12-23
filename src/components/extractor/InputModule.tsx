"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InputMode, TranscriptOptions, VideoMetadata } from "@/app/extractor/page";
import { useEffect, useState } from "react";
import { COLORS, API_ENDPOINTS, VALIDATION, YOUTUBE_PATTERNS } from "@/constants";
import URLValidator from "./URLValidator";

interface InputModuleProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  url: string;
  setUrl: (url: string) => void;
  metadata: VideoMetadata | null;
  setMetadata: (metadata: VideoMetadata | null) => void;
  options: TranscriptOptions;
  setOptions: (options: TranscriptOptions) => void;
  onExtract: () => void;
  isExtracting: boolean;
}

export default function InputModule({
  inputMode,
  setInputMode,
  url,
  setUrl,
  metadata,
  setMetadata,
  options,
  setOptions,
  onExtract,
  isExtracting,
}: InputModuleProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const extractVideoId = (url: string): string | null => {
    for (const pattern of YOUTUBE_PATTERNS.videoId) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const fetchVideoMetadata = async (videoId: string): Promise<VideoMetadata | null> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.youtube.oembed}?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: videoId,
        title: data.title,
        thumbnail: data.thumbnail_url,
        channelName: data.author_name,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!url) {
      setIsValid(null);
      setMetadata(null);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(async () => {
      const videoId = extractVideoId(url);
      if (videoId) {
        const realMetadata = await fetchVideoMetadata(videoId);
        if (realMetadata) {
          setIsValid(true);
          setMetadata(realMetadata);
        } else {
          setIsValid(false);
          setMetadata(null);
        }
      } else {
        setIsValid(false);
        setMetadata(null);
      }
      setIsValidating(false);
    }, VALIDATION.debounceDelay);

    return () => clearTimeout(timer);
  }, [url, setMetadata]);

  const handleClear = () => {
    setUrl("");
    setMetadata(null);
  };

  const handleLoadExample = () => {
    setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  };

  const getPlaceholder = () => {
    switch (inputMode) {
      case "single":
        return "Paste YouTube video URL here...";
      case "playlist":
        return "Paste YouTube playlist URL here...";
      case "channel":
        return "Paste channel URL or @handle here...";
    }
  };

  return (
    <div className="border-[3px] border-white bg-[#1a1a1a] p-8">
      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
        <TabsList className="w-full bg-transparent border-[3px] border-white p-0 h-auto rounded-none">
          <TabsTrigger 
            value="single" 
            className="flex-1 data-[state=active]:bg-[#c4ff0e] data-[state=active]:text-[#1a1a1a] border-r-[3px] border-white last:border-r-0 rounded-none py-4 font-mono font-bold uppercase tracking-wide text-white"
          >
            Single Video
          </TabsTrigger>
          <TabsTrigger 
            value="playlist" 
            className="flex-1 data-[state=active]:bg-[#c4ff0e] data-[state=active]:text-[#1a1a1a] border-r-[3px] border-white last:border-r-0 rounded-none py-4 font-mono font-bold uppercase tracking-wide text-white"
          >
            Playlist
          </TabsTrigger>
          <TabsTrigger 
            value="channel" 
            className="flex-1 data-[state=active]:bg-[#c4ff0e] data-[state=active]:text-[#1a1a1a] rounded-none py-4 font-mono font-bold uppercase tracking-wide text-white"
          >
            Channel
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value={inputMode} className="mt-0">
            <Textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={getPlaceholder()}
              className="min-h-[120px] bg-[#0a0a0a] border-[3px] border-white rounded-none font-mono text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#c4ff0e] resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
            />
            <URLValidator url={url} isValidating={isValidating} isValid={isValid} />
          </TabsContent>

          {metadata && (
            <div className="mt-4 p-4 bg-[#0a0a0a] border-[3px] border-[#c4ff0e] font-mono text-sm">
              <div className="text-[#c4ff0e] mb-2">DETECTED:</div>
              <div className="text-white">
                <div>Title: {metadata.title}</div>
                {metadata.channelName && <div>Channel: {metadata.channelName}</div>}
                {inputMode !== "single" && <div>Videos: ~24</div>}
              </div>
            </div>
          )}
        </div>
      </Tabs>

      <div className="mt-8 border-[3px] border-white p-6">
        <div className="text-white font-mono font-bold uppercase text-sm mb-4 tracking-wide">
          Options
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="timestamps"
              checked={options.includeTimestamps}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeTimestamps: checked as boolean })
              }
              className="border-[3px] border-white rounded-none data-[state=checked]:bg-[#c4ff0e] data-[state=checked]:text-[#1a1a1a] data-[state=checked]:border-[#c4ff0e]"
            />
            <Label
              htmlFor="timestamps"
              className="text-white font-mono text-sm cursor-pointer"
            >
              Include timestamps
            </Label>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white font-mono text-sm">Format:</span>
            <div className="flex gap-4">
              {(["txt", "json", "srt"] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setOptions({ ...options, format })}
                  className={`px-4 py-2 border-[3px] font-mono font-bold uppercase text-sm transition-all active:translate-y-[2px] ${
                    options.format === format
                      ? "bg-[#c4ff0e] text-[#1a1a1a] border-[#c4ff0e]"
                      : "bg-transparent text-white border-white hover:border-[#c4ff0e] hover:text-[#c4ff0e]"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onExtract}
          disabled={!url || isExtracting || !isValid}
          className="flex-1 bg-[#c4ff0e] text-[#1a1a1a] border-[3px] border-[#c4ff0e] py-6 font-mono font-black text-lg uppercase tracking-wide hover:bg-[#d4ff3e] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-[2px] relative"
        >
          {isExtracting ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-5 h-5 border-[3px] border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
              EXTRACTING...
            </span>
          ) : (
            "EXTRACT TRANSCRIPTS"
          )}
        </button>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleClear}
          className="flex-1 bg-transparent text-white border-[3px] border-white py-3 font-mono font-bold text-sm uppercase tracking-wide hover:border-[#c4ff0e] hover:text-[#c4ff0e] transition-all active:translate-y-[2px]"
        >
          Clear
        </button>
        <button
          onClick={handleLoadExample}
          className="flex-1 bg-transparent text-white border-[3px] border-white py-3 font-mono font-bold text-sm uppercase tracking-wide hover:border-[#c4ff0e] hover:text-[#c4ff0e] transition-all active:translate-y-[2px]"
        >
          Load Example
        </button>
      </div>
    </div>
  );
}
