import React from 'react';
import { NAV_ITEMS } from '../../constants';

export const Navbar: React.FC = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-8 py-8 flex justify-between items-start mix-blend-exclusion">
      {/* Logo */}
      <div>
        <span className="font-bold text-zinc-300 tracking-tighter text-xl hover:text-white transition-colors cursor-default">
          CyberNerveTech<span className="text-zinc-500">.</span>
        </span>
      </div>

      {/* Minimal Nav - No background, just text */}
      <nav className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-8">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={(e) => handleScroll(e, item.href)}
            className="text-[10px] font-medium text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
};