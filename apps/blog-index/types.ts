export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
  featured?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

export enum TagColor {
  REACT = 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  TS = 'text-blue-300 bg-blue-300/10 border-blue-300/20',
  AI = 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  SYSTEM = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  DESIGN = 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  DEFAULT = 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
}