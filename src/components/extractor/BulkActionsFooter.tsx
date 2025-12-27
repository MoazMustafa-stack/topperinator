"use client";

import { TranscriptResult, TranscriptOptions } from "@/app/extractor/page";
import { Download, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";

interface BulkActionsFooterProps {
  results: TranscriptResult[];
  options: TranscriptOptions;
}

export default function BulkActionsFooter({ results, options }: BulkActionsFooterProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const successfulResults = results.filter(r => r.status === "success");

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[<>:"/\\|?*]/g, "")
      .replace(/\s+/g, "_") 
      .substring(0, 100); 
  };

  const getFileExtension = (format: string): string => {
    switch (format) {
      case "json":
        return "json";
      case "srt":
        return "srt";
      case "txt":
      default:
        return "txt";
    }
  };

  const handleDownloadAll = async () => {
    if (successfulResults.length === 0) return;

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const extension = getFileExtension(options.format);

      // Add each transcript as a file in the ZIP
      successfulResults.forEach((result) => {
        const sanitizedTitle = sanitizeFileName(result.title || `video_${result.id}`);
        const fileName = `${sanitizedTitle}.${extension}`;
        
        zip.file(fileName, result.transcript);
      });

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      // Create a download link and trigger it
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `youtube-transcripts-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create ZIP file:", error);
      alert("Failed to create ZIP file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
          disabled={isDownloading}
          className="flex-1 bg-[#c4ff0e] text-[#1a1a1a] border-[3px] border-[#c4ff0e] py-4 font-mono font-bold text-sm uppercase tracking-wide hover:bg-[#d4ff3e] transition-all active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating ZIP...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download All as ZIP ({successfulResults.length})
            </>
          )}
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
