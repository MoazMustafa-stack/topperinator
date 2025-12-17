"use client";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface URLValidatorProps {
  url: string;
  isValidating: boolean;
  isValid: boolean | null;
}

export default function URLValidator({ url, isValidating, isValid }: URLValidatorProps) {
  if (!url) return null;

  return (
    <div className="flex items-center gap-2 mt-2 font-mono text-xs">
      {isValidating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#c4ff0e]" />
          <span className="text-white/70">Validating URL...</span>
        </>
      ) : isValid === true ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-[#c4ff0e]" />
          <span className="text-[#c4ff0e]">Valid YouTube URL</span>
        </>
      ) : isValid === false ? (
        <>
          <XCircle className="w-4 h-4 text-[#ff3b30]" />
          <span className="text-[#ff3b30]">Invalid URL format</span>
        </>
      ) : null}
    </div>
  );
}
