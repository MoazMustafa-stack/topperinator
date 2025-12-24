"use client";

import { TranscriptResult, TranscriptOptions } from "@/app/extractor/page";
import { Download, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ResultsGridProps {
  results: TranscriptResult[];
  options: TranscriptOptions;
}

export default function ResultsGrid({ results, options }: ResultsGridProps) {
  const handleDownload = (result: TranscriptResult) => {
    const filename = `${result.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-transcript.${options.format}`;
    const content = result.transcript;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="text-[#c4ff0e] font-mono font-bold uppercase text-sm tracking-wide mb-6">
        RESULTS ({results.length})
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <div
            key={result.id}
            className="border-[3px] border-white bg-[#1a1a1a] overflow-hidden scale-in"
          >
            <div className="relative h-[180px] bg-black border-b-[3px] border-white">
              <Image 
                src={result.thumbnail}
                alt={result.title}
                fill
                className="object-cover opacity-80"
              />
            </div>
            
            <div className="p-4">
              <h3 className="text-white font-mono font-bold text-sm mb-2 line-clamp-2">
                {result.title}
              </h3>
              
              {result.status === "success" ? (
                <>
                  <div className="text-[#c4ff0e] font-mono text-xs mb-4">
                    {result.wordCount.toLocaleString()} words
                  </div>
                  
                  <button
                    onClick={() => handleDownload(result)}
                    className="w-full bg-[#c4ff0e] text-[#1a1a1a] border-[3px] border-[#c4ff0e] py-3 font-mono font-bold text-sm uppercase tracking-wide hover:bg-[#d4ff3e] transition-all active:translate-y-[2px] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-[#ff3b30] font-mono text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{result.error || "Extraction failed"}</span>
                  </div>
                  
                  <button
                    onClick={() => {}}
                    className="w-full bg-transparent text-white border-[3px] border-white py-3 font-mono font-bold text-sm uppercase tracking-wide hover:border-[#ff3b30] hover:text-[#ff3b30] transition-all active:translate-y-[2px]"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
