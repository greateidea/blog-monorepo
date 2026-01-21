import React from 'react';
import { BlogPost } from '../../types';
import { TagBadge } from './TagBadge';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: BlogPost;
  index: number;
}

export const PostCard: React.FC<PostCardProps> = ({ post, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-8 right-0">
        <div className="text-zinc-400">
           <ArrowUpRight size={16} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>

      <h3 className="text-xl font-bold text-zinc-100 mb-3 group-hover:text-zinc-400 transition-colors leading-tight">
        {post.title}
      </h3>
      
      <p className="text-zinc-500 text-sm leading-relaxed mb-4 flex-grow font-light">
        {post.excerpt}
      </p>

      <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono uppercase tracking-wider mt-auto">
        <span>{post.date}</span>
        <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
        <span>{post.readTime}</span>
      </div>
      
      {/* Click overlay */}
      <a href={`https://blog.hiou.top/${post.slug}`} target="_blank" className="absolute inset-0" aria-label={`Read ${post.title}`}></a>
    </motion.article>
  );
};