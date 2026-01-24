import React from 'react';
// import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-16">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">

        <div className="text-center md:text-left">
          <span className="font-bold text-zinc-100 text-lg tracking-tighter">CyberNerveTech<span className="text-zinc-500">.</span></span>
        </div>

        {/* <div className="flex gap-8">
          <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors" aria-label="GitHub">
            <Github size={18} />
          </a>
          <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors" aria-label="Twitter">
            <Twitter size={18} />
          </a>
          <a href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors" aria-label="LinkedIn">
            <Linkedin size={18} />
          </a>
        </div> */}

        <div className="text-xs text-zinc-700 font-mono uppercase tracking-widest">
          © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};