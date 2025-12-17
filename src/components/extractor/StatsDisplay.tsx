"use client";

import { TranscriptResult } from "@/app/extractor/page";

interface StatsDisplayProps {
  results: TranscriptResult[];
}

export default function StatsDisplay({ results }: StatsDisplayProps) {
  const successCount = results.filter(r => r.status === "success").length;
  const failedCount = results.filter(r => r.status === "failed").length;
  const totalWords = results
    .filter(r => r.status === "success")
    .reduce((sum, r) => sum + r.wordCount, 0);

  if (results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="border-[3px] border-white bg-[#1a1a1a] p-6">
        <div className="text-[#c4ff0e] font-mono text-3xl font-black mb-2">
          {successCount}
        </div>
        <div className="text-white/70 font-mono text-xs uppercase tracking-wide">
          Successful Extractions
        </div>
      </div>

      <div className="border-[3px] border-white bg-[#1a1a1a] p-6">
        <div className="text-[#ff3b30] font-mono text-3xl font-black mb-2">
          {failedCount}
        </div>
        <div className="text-white/70 font-mono text-xs uppercase tracking-wide">
          Failed Extractions
        </div>
      </div>

      <div className="border-[3px] border-white bg-[#1a1a1a] p-6">
        <div className="text-[#c4ff0e] font-mono text-3xl font-black mb-2">
          {totalWords.toLocaleString()}
        </div>
        <div className="text-white/70 font-mono text-xs uppercase tracking-wide">
          Total Words Extracted
        </div>
      </div>
    </div>
  );
}
