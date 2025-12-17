"use client";

import { TranscriptResult, TranscriptOptions } from "@/app/extractor/page";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";

interface BulkActionsFooterProps {
  results: TranscriptResult[];
  options: TranscriptOptions;
}

export default function BulkActionsFooter({ results, options }: BulkActionsFooterProps) {
  const [copied, setCopied] = useState(false);

  const successfulResults = results.filter(r => r.status === "success");

  const handleDownloadAll = () => {
    // In a real implementation, this would create a ZIP file
    alert("Download All as ZIP functionality would be implemented here");
  };

  const handleCopyAll = async () => {
    const allTranscripts = successfulResults
      .map(r => `=== ${r.title} ===\n\n${r.transcript}\n\n`)
      .join("\n");
    
    try {
      await navigator.clipboard.writeText(allTranscripts);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (successfulResults.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t-[3px] border-white p-6 z-50">
      <div className="max-w-[1200px] mx-auto flex gap-4">
        <button
          onClick={handleDownloadAll}
          className="flex-1 bg-[#c4ff0e] text-[#1a1a1a] border-[3px] border-[#c4ff0e] py-4 font-mono font-bold text-sm uppercase tracking-wide hover:bg-[#d4ff3e] transition-all active:translate-y-[2px] flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download All as ZIP ({successfulResults.length})
        </button>
        
        <button
          onClick={handleCopyAll}
          className="flex-1 bg-transparent text-white border-[3px] border-white py-4 font-mono font-bold text-sm uppercase tracking-wide hover:border-[#c4ff0e] hover:text-[#c4ff0e] transition-all active:translate-y-[2px] flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy All to Clipboard
            </>
          )}
        </button>
      </div>
    </div>
  );
}
