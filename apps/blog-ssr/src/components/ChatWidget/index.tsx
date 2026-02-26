import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

interface Props {
  blogKey: string;
}

const RAG_APP_URL = "https://rag-app-fe.vercel.app/chat-widget";

const ChatWidget = ({ blogKey }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentBlogKey = useRef(blogKey);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = `${RAG_APP_URL}?blogKey=${blogKey}`;
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (blogKey !== currentBlogKey.current) {
      currentBlogKey.current = blogKey;
      setIsLoaded(false);
      setIsOpen(false);
      if (iframeRef.current) {
        iframeRef.current.src = `${RAG_APP_URL}?blogKey=${blogKey}`;
      }
    }
  }, [blogKey]);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* 聊天框面板 */}
      <div className={isOpen ? styles.panelOpen : styles.panel}>
        <div className={styles.iframeWrapper}>
          <iframe
            ref={iframeRef}
            className={isLoaded ? styles.iframeLoaded : styles.iframe}
            src={`${RAG_APP_URL}?blogKey=${blogKey}`}
            title="Chat Widget"
            allow="clipboard-read; clipboard-write"
            onLoad={handleIframeLoad}
          />
          {!isLoaded && (
            <div className={styles.skeleton}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonDots}>
                <div className={styles.skeletonDot} />
                <div className={styles.skeletonDot} />
                <div className={styles.skeletonDot} />
              </div>
            </div>
          )}
        </div>
        <button
          className={styles.closeButton}
          onClick={() => setIsOpen(false)}
          aria-label="关闭聊天"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 圆形按钮 */}
      <button
        className={styles.circleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "关闭聊天" : "打开聊天"}
      >
        {isOpen ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
