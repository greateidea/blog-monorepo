import React from 'react';
// import { TagColor } from '../../types';

interface TagBadgeProps {
  tag: string;
}

// const getTagStyle = (tag: string): string => {
//   // Using more muted palette logic, though mapping to existing Enum types 
//   // but ensuring Tailwind opacity classes handle the "vibe"
//   const upperTag = tag.toUpperCase();
//   if (upperTag.includes('REACT')) return TagColor.REACT;
//   if (upperTag.includes('TYPE') || upperTag.includes('TS')) return TagColor.TS;
//   if (upperTag.includes('AI') || upperTag.includes('GEMINI')) return TagColor.AI;
//   if (upperTag.includes('SYSTEM') || upperTag.includes('BACKEND')) return TagColor.SYSTEM;
//   return TagColor.DEFAULT;
// };

export const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  return (
    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border border-transparent bg-zinc-900 text-zinc-500 group-hover:border-zinc-800 transition-colors`}>
      {tag}
    </span>
  );
};