import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Footer from "@/components/footer";

// Remote toggles via environment variables
const SHOW_NAVBAR = process.env.NEXT_PUBLIC_SHOW_NAVBAR !== "false";
const SHOW_HERO = process.env.NEXT_PUBLIC_SHOW_HERO !== "false";
const SHOW_FEATURES = process.env.NEXT_PUBLIC_SHOW_FEATURES !== "false";
const SHOW_FOOTER = process.env.NEXT_PUBLIC_SHOW_FOOTER !== "false";

export default async function PreviewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {SHOW_NAVBAR && <Navbar />}
      {SHOW_HERO && <Hero />}
      
      {SHOW_FEATURES && (
        <div className="bg-white py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
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
                <div key={i} className="border-2 border-gray-200 bg-white p-6 rounded-lg hover:border-blue-500 transition-colors">
                  <h3 className="text-blue-600 font-bold text-sm mb-3 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {SHOW_FOOTER && <Footer />}
    </div>
  );
}
