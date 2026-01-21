// useIntersectionObserver.js
import { useEffect, useState, useRef } from "react";

export default function useIntersectionObserver({ root = null, rootMargin = "0px", threshold = 0 } = {}) {
  const ref = useRef<HTMLDivElement | undefined>(undefined);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safety
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIntersecting(true);
            // optional: unobserve if you only need first intersect
            observer.unobserve(node);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return [ref, isIntersecting];
}
