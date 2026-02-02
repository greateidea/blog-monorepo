import React, { useState } from 'react';
import { BLOG_POSTS } from '../../constants';
import { PostCard } from './PostCard';
import { ArrowDown } from 'lucide-react';

export const FeaturedSection: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(9);
  
  const visiblePosts = BLOG_POSTS.slice(0, visibleCount);
  const hasMore = visibleCount < BLOG_POSTS.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  return (
    <section id="blog" className="py-32 px-6 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-16">
        <div>
          <h2 className="text-sm font-mono text-zinc-500 mb-2 uppercase tracking-widest">Latest Writing</h2>
        </div>
        {/* <a href="#all-posts" className="hidden md:block text-xs text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-widest">
          View Archive
        </a> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {visiblePosts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-20 flex justify-center">
          <button 
            onClick={handleLoadMore}
            className="group flex flex-col items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-200 transition-colors uppercase tracking-[0.2em] bg-transparent border-none cursor-pointer"
          >
            <span>「Load More」</span>
            <ArrowDown size={14} className="opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
          </button>
        </div>
      )}

      {/* <div className="mt-16 text-center md:hidden">
         <a href="#all-posts" className="text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">
          View Archive
        </a>
      </div> */}
    </section>
  );
};