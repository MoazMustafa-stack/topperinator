"use client";

import { ProgressItem } from "@/app/extractor/page";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface ProgressTrackerProps {
  progress: ProgressItem[];
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [progress]);

  const getStatusIcon = (status: ProgressItem["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin text-[#c4ff0e]" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-[#c4ff0e]" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-[#ff3b30]" />;
    }
  };

  const getStatusColor = (status: ProgressItem["status"]) => {
    switch (status) {
      case "processing":
        return "text-white";
      case "success":
        return "text-[#c4ff0e]";
      case "failed":
        return "text-[#ff3b30]";
    }
  };

  const successCount = progress.filter(p => p.status === "success").length;
  const failedCount = progress.filter(p => p.status === "failed").length;
  const totalCount = progress.length;
  const percentage = totalCount > 0 ? Math.round(((successCount + failedCount) / totalCount) * 100) : 0;

  return (
    <div className="border-[3px] border-white bg-[#0a0a0a] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[#c4ff0e] font-mono font-bold uppercase text-sm tracking-wide">
          EXTRACTION PROGRESS
        </div>
        <div className="text-white font-mono text-sm">
          {percentage}% ({successCount}/{totalCount} complete)
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="bg-black border-[3px] border-white/20 p-4 h-[300px] overflow-y-auto font-mono text-sm"
        style={{ fontFamily: "'Fira Code', monospace" }}
      >
        {progress.map((item, index) => (
          <div key={item.videoId} className="mb-2 flex items-start gap-3">
            <div className="mt-0.5">{getStatusIcon(item.status)}</div>
            <div className="flex-1">
              <div className={`${getStatusColor(item.status)} break-words`}>
                [{new Date().toLocaleTimeString()}] {item.message}
              </div>
              {item.status === "failed" && (
                <div className="text-[#ff3b30] text-xs mt-1">
                  ERROR: Transcript unavailable for this video
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-[#1a1a1a] border-[3px] border-white h-8 overflow-hidden">
        <div 
          className="h-full bg-[#c4ff0e] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
