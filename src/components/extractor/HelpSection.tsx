"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

export default function HelpSection() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#c4ff0e] text-[#1a1a1a] border-[3px] border-[#c4ff0e] p-4 hover:bg-[#d4ff3e] transition-all active:translate-y-[2px] z-40"
        aria-label="Help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-[#1a1a1a] border-[3px] border-white p-6 max-w-md z-40">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[#c4ff0e] font-mono font-bold uppercase text-sm tracking-wide">
          Quick Guide
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-[#c4ff0e] transition-colors"
          aria-label="Close help"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 text-white/70 font-mono text-xs">
        <div>
          <div className="text-white font-bold mb-1">1. SELECT MODE</div>
          <div>Choose Single Video, Playlist, or Channel</div>
        </div>

        <div>
          <div className="text-white font-bold mb-1">2. PASTE URL</div>
          <div>Enter a valid YouTube URL and wait for validation</div>
        </div>

        <div>
          <div className="text-white font-bold mb-1">3. CONFIGURE OPTIONS</div>
          <div>Select format (TXT/JSON/SRT) and toggle timestamps</div>
        </div>

        <div>
          <div className="text-white font-bold mb-1">4. EXTRACT</div>
          <div>Click the extract button and monitor progress</div>
        </div>

        <div>
          <div className="text-white font-bold mb-1">5. DOWNLOAD</div>
          <div>Download individual files or use bulk actions</div>
        </div>

        <div className="pt-4 border-t-[3px] border-white/20">
          <div className="text-[#c4ff0e] font-bold mb-2">SUPPORTED URLS:</div>
          <div className="space-y-1">
            <div>• youtube.com/watch?v=...</div>
            <div>• youtu.be/...</div>
            <div>• youtube.com/playlist?list=...</div>
            <div>• youtube.com/@channel</div>
          </div>
        </div>
      </div>
    </div>
  );
}
