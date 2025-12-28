import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const SHOW_NAVBAR = process.env.NEXT_PUBLIC_SHOW_NAVBAR !== "false";
const SHOW_HERO = process.env.NEXT_PUBLIC_SHOW_HERO !== "false";
const SHOW_FEATURES = process.env.NEXT_PUBLIC_SHOW_FEATURES !== "false";
const SHOW_FOOTER = process.env.NEXT_PUBLIC_SHOW_FOOTER !== "false";

export default async function Home() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] scanline-bg">
      {SHOW_NAVBAR && <Navbar />}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <header className="text-center py-20">
          <h1
            className="text-[#c4ff0e] font-black text-6xl md:text-7xl tracking-tight uppercase mb-6"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            YOUTUBE
            <br />
            TRANSCRIPT
            <br />
            EXTRACTOR
          </h1>
          <p className="text-white/70 font-mono text-lg mb-12 max-w-2xl mx-auto">
            Extract transcripts at scale. Built for students for easy viewing of
            transcripts.
          </p>
          <Link
            href="/extractor"
            className="inline-flex items-center gap-3 bg-[#c4ff0e] text-[#1a1a1a] border-[3px] border-[#c4ff0e] px-8 py-5 font-mono font-black text-lg uppercase tracking-wide hover:bg-[#d4ff3e] transition-all active:translate-y-[2px]"
          >
            Launch Extractor
            <ArrowUpRight className="w-6 h-6" />
          </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-6 py-20">
          {[
            {
              title: "BULK OPERATIONS",
              desc: "Extract from single videos, playlists, or entire channels",
            },
            {
              title: "MULTIPLE FORMATS",
              desc: "Export as TXT, JSON, or SRT with optional timestamps",
            },
            {
              title: "LLM-READY",
              desc: "Copy all transcripts to clipboard, optimized for AI analysis",
            },
          ].map((feature, i) => (
            <div key={i} className="border-[3px] border-white bg-[#1a1a1a] p-6">
              <h3 className="text-[#c4ff0e] font-mono font-bold text-sm mb-3 uppercase tracking-wide">
                {feature.title}
              </h3>
              <p className="text-white/70 font-mono text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {SHOW_FOOTER && <Footer />}
    </div>
  );
}
