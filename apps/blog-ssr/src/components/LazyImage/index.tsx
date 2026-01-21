// LazyImage.jsx
import { useState, useEffect, CSSProperties } from "react";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";

const LazyImage: React.FC<{
    src: string,
    alt?: string,
    placeholder?: string,
    className?: string,
    srcSet?: any,
    sizes?:  string,
    width?: number,
    height?: number,
    containerStyle?: CSSProperties,
    style?: CSSProperties
}> = ({ src = '', alt = '', placeholder = '', className = '', width, height, containerStyle, style }) => {
  const [ref, isVisible] = useIntersectionObserver({ rootMargin: "200px 0px" }); // 200px 提前加载
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && !currentSrc) {
      setCurrentSrc(src);
    }
  }, [isVisible, src, currentSrc]);

  return (
    <div ref={ref as any} className={className} style={{ height, width, ...(containerStyle || {}) }}>
      {!currentSrc && (
        // 占位：可以是低分辨率图、骨架、纯色 div 等
        placeholder || <div style={{ width: "100%", height: "100%", background: "#eee" }} />
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => {
            setLoaded(true)
          }}
          onError={() => setFailed(true)}
          style={style}
          decoding="async"
        />
      )}

      {currentSrc && !loaded && !failed && (
        // 加载中小提示（可用 spinner）
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
          {/* skeleton / spinner */}
        </div>
      )}
    </div>
  );
}

export default LazyImage

