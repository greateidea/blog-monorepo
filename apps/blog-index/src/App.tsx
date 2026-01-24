import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedSection } from './components/FeaturedSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
// import VirtualList from './components/VirList';
import './index.css';
// import useRequest from './tsetComponents/useRequest'
// import { label } from 'framer-motion/client';

// const testVirtualListData = new Array(100).fill(1)

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-zinc-800 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedSection />
        <AboutSection />
      </main>
      {/* <VirtualList list={testVirtualListData} itemHeight={38} containerHeight={200}/> */}
      <Footer />
    </div>
  );
}

export default App;
