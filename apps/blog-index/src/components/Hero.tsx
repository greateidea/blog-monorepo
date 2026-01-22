import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import AnimatedFeTurbulence from './AnimatedFeTurbulence';

const AnimatedLetterI: React.FC = () => {
  const [isLanded, setIsLanded] = useState(false);

  return (
    // Spacing adjustment: 
    // Switched from symmetrical mx to asymmetric margins based on feedback.
    // ml-[0.06em]: Increased to fix "slightly too tight on left".
    // mr-[0.01em]: Decreased to fix "slightly too far on right".
    <div className="relative inline-flex flex-col items-center justify-end h-[0.8em] w-[0.20em] align-baseline ml-[0.06em] mr-[0.01em] select-none">
      {/* The Dot Area - Absolute positioned at the top */}
      <div className="absolute top-[0.05em] left-1/2 -translate-x-1/2 w-[0.24em] h-[0.24em] flex items-center justify-center z-20">
        <motion.div
          // Initial: Start at the bottom left of the letter (the floor)
          initial={{ y: "300%", x: "-200%", opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{
            // Jump arc: Go up high (negative Y), move right (to 0), land on target
            y: ["300%", "-80%", "0%"],
            x: ["-200%", "-100%", "0%"],
            opacity: [0, 1, 1],
            scale: [0.8, 1.1, 1],
            rotate: [-10, 5, 0]
          }}
          transition={{
            duration: 1.4,
            times: [0, 0.45, 1],
            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like bezier for jump
            delay: 0.8
          }}
          onAnimationComplete={() => setIsLanded(true)}
          className="w-full h-full flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {!isLanded ? (
              <motion.svg
                key="cat"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-[300%] h-[300%] text-zinc-100 -translate-y-[2px] translate-x-[2px]"
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              >
                {/* 
                                Distinct Walking Cat Silhouette
                                - High Tail (Left)
                                - Two pointy ears (Right)
                                - 4 CLEAR LEGS (Vertical separation)
                             */}
                <path d="M4 1 Q5 10 7 12 L 15 12 L 16 9 L 17 5 L 18 8 L 20 5 L 21 9 L 21 11 Q 21 13 19 14 L 19 22 L 17.5 22 L 17.5 16 L 16.5 16 L 16.5 22 L 15 22 L 15 14 L 11 14 L 11 22 L 9.5 22 L 9.5 16 L 8.5 16 L 8.5 22 L 7 22 L 7 13 L 6 12 Q5 10 4 1 Z" />
              </motion.svg>
            ) : (
              <motion.div
                key="dot"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full h-full bg-zinc-100 rounded-full"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* The Pillar (Body of 'i') */}
      {/* Height 60% ensures x-height alignment */}
      <div className="w-full h-[60%] bg-zinc-100 rounded-sm absolute bottom-0 left-0" />
    </div>
  );
};

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();

  // Scroll interactions for the text
  const y = useTransform(scrollY, [0, 500], [0, 250]); // Parallax effect
  const opacity = useTransform(scrollY, [0, 300], [1, 0]); // Fade out
  const blur = useTransform(scrollY, [0, 300], [0, 10]); // Blur effect
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]); // Slight shrink

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Grid settings
    const spacing = 40;
    const points: { x: number; y: number; originX: number; originY: number; size: number; alpha: number }[] = [];

    const createPoints = () => {
      points.length = 0;
      const cols = Math.ceil(width / spacing) + 2; // Extra buffer
      const rows = Math.ceil(height / spacing) + 2;

      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i * spacing) + offsetX - spacing;
          const y = (j * spacing) + offsetY - spacing;
          points.push({
            x, y,
            originX: x,
            originY: y,
            size: 1.5,
            alpha: 0.1
          });
        }
      }
    };

    createPoints();

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createPoints();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;

    const render = () => {
      // Clear with trail effect for smoothness, or solid clear
      ctx.fillStyle = '#09090b'; // Matches zinc-950
      ctx.fillRect(0, 0, width, height);

      points.forEach(point => {
        const dx = mouseX - point.x;
        const dy = mouseY - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 350; // Interaction radius

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);

          // Repulsion effect
          const push = 30 * force;
          const targetX = point.originX - Math.cos(angle) * push;
          const targetY = point.originY - Math.sin(angle) * push;

          point.x += (targetX - point.x) * 0.1;
          point.y += (targetY - point.y) * 0.1;
          point.alpha = 0.1 + force * 0.4; // Brighten near mouse
          point.size = 1.5 + force * 1.5; // Enlarge near mouse
        } else {
          // Return to origin
          point.x += (point.originX - point.x) * 0.05;
          point.y += (point.originY - point.y) * 0.05;
          point.alpha += (0.1 - point.alpha) * 0.1;
          point.size += (1.5 - point.size) * 0.1;
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(228, 228, 231, ${point.alpha})`; // zinc-200 base
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center items-center px-6 overflow-hidden">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 block"
      />

      {/* Vignette / Overlay for focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          style={{ y, opacity, scale, filter: useTransform(blur, (v) => `blur(${v}px)`) }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatedFeTurbulence id="turbulence" delay={500} duration={0.08}>
            <h1 className="text-7xl md:text-[10rem] font-bold text-zinc-100 tracking-tighter mb-8 leading-[0.85] select-none mix-blend-screen flex flex-col items-center">
              <span className="flex items-baseline justify-center">
                <span>D</span>
                <AnimatedLetterI />
                <span>gital</span>
              </span>
              <span className="text-zinc-700">Craft.</span>
            </h1>
          </AnimatedFeTurbulence>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl text-zinc-400 mb-16 max-w-lg mx-auto font-light leading-relaxed"
          >
            The intersection of design systems, frontend architecture, and generative intuition.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-12"
          >
            <button
              onClick={(e) => handleScroll(e, 'blog')}
              className="group flex flex-col items-center gap-1 text-sm font-medium text-zinc-300 hover:text-white transition-colors tracking-widest uppercase bg-transparent border-none cursor-pointer"
            >
              <span>Read</span>
              <span className="w-full h-[1px] bg-zinc-800 group-hover:bg-zinc-200 transition-colors" />
            </button>
            {/* <button 
              onClick={(e) => handleScroll(e, 'projects')}
              className="group flex flex-col items-center gap-1 text-sm font-medium text-zinc-500 hover:text-white transition-colors tracking-widest uppercase bg-transparent border-none cursor-pointer"
            >
              <span>Works</span>
              <span className="w-full h-[1px] bg-transparent group-hover:bg-zinc-200 transition-colors" />
            </button> */}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: useTransform(scrollY, [0, 100], [1, 0]) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-zinc-800 mix-blend-difference"
      >
        <ArrowDown size={20} strokeWidth={1} />
      </motion.div>
    </section>
  );
};