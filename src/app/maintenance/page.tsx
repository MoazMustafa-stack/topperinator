import Link from "next/link";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full space-y-6 text-center font-mono">
        <p className="text-sm uppercase tracking-[0.3em] text-lime-300">System Notice</p>
        <h1 className="text-3xl font-semibold uppercase tracking-wide">Maintenance Mode</h1>
        <p className="text-base text-gray-300 leading-relaxed">
          Our authentication pages are temporarily offline while we roll out updates.
          You can still browse the main app and extraction tools. Thanks for your patience!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 border border-lime-300 text-lime-300 uppercase tracking-wide hover:bg-lime-300 hover:text-black transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/extractor"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 bg-lime-300 text-black uppercase tracking-wide hover:bg-lime-200 transition-colors"
          >
            Open Extractor
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
            Expected downtime: short — we&apos;ll be back soon.
          </p>
        </div>
      </div>
    </main>
  );
}
