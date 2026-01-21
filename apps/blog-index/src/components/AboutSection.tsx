import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-32 bg-zinc-950 border-t border-zinc-900/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          <div className="md:col-span-7">
            <h2 className="text-sm font-mono text-zinc-500 mb-8 uppercase tracking-widest">About</h2>
            <p className="text-2xl md:text-3xl text-zinc-300 leading-relaxed font-light">
              Hi I'm <span className="text-zinc-100">SpringCat</span>, and this is my blog. In here, you'll find all the articles I wished I had when I was learning about web development.
            </p>
            <p className="text-zinc-500 mt-6 leading-relaxed text-lg font-light max-w-xl">
              Each piece I write aims to dive deep into the topics I'm passionate about. I believe learning and growth are more important than ever in this AI era.
            </p>
          </div>

          {/* <div className="md:col-span-5 grid grid-cols-2 gap-12 md:pl-12 pt-2">
             <div>
                <span className="block text-5xl font-bold text-zinc-200 mb-2 tracking-tight">08</span>
                <span className="text-xs text-zinc-600 uppercase tracking-widest">Years Exp</span>
             </div>
             <div>
                <span className="block text-5xl font-bold text-zinc-200 mb-2 tracking-tight">50+</span>
                <span className="text-xs text-zinc-600 uppercase tracking-widest">Projects</span>
             </div>
          </div> */}

        </div>
      </div>
    </section>
  );
};