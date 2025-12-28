import Link from 'next/link';
import { Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] border-t-[3px] border-white/20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        
        {/* NAVIGATION SECTIONS - Uncomment to enable 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-mono font-bold text-[#c4ff0e] mb-4 uppercase tracking-wide text-sm">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-bold text-[#c4ff0e] mb-4 uppercase tracking-wide text-sm">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">About</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-bold text-[#c4ff0e] mb-4 uppercase tracking-wide text-sm">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Community</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Status</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono font-bold text-[#c4ff0e] mb-4 uppercase tracking-wide text-sm">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Privacy</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Terms</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Security</Link></li>
              <li><Link href="#" className="text-white/70 hover:text-[#c4ff0e] font-mono text-sm transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>
        */}

        {/* COPYRIGHT & SOCIAL LINKS - Always visible */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t-[3px] border-white/20">
          <div className="text-white/50 mb-4 md:mb-0 font-mono text-xs uppercase tracking-wide">
            © {currentYear} Topper-inator. Made by Moaz Mustafa.
          </div>
          <div className="flex space-x-3">
          <p className="text-white/50 font-mono text-xs uppercase tracking-wide">
            Technical Brutalism • Function Over Form • Built for Power Users
          </p>
          </div>

          <div className="flex space-x-6">
            
            <a href="https://www.linkedin.com/in/moazmustafa/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#c4ff0e] transition-colors">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="https://github.com/MoazMustafa-stack" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#c4ff0e] transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
