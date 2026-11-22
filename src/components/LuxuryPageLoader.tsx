import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LuxuryPageLoaderProps {
  onLoaded?: () => void;
  durationMs?: number;
}

export default function LuxuryPageLoader({ onLoaded, durationMs = 12000 }: LuxuryPageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= window.innerHeight : true
  );

  const landscapeVideoRef = useRef<HTMLVideoElement | null>(null);
  const portraitVideoRef = useRef<HTMLVideoElement | null>(null);

  // Monitor viewport orientation dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth >= window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Safe dismiss callback
  const handleComplete = () => {
    if (isDone) return;
    setIsDone(true);
    if (onLoaded) {
      onLoaded();
    }
  };

  // Attempt video playback when orientation changes or mounts
  useEffect(() => {
    if (isDone) return;
    const activeVideo = isLandscape ? landscapeVideoRef.current : portraitVideoRef.current;
    if (activeVideo) {
      activeVideo.muted = true;
      activeVideo.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [isLandscape, isDone]);

  // Safety fallback timer to ensure user is never stuck
  useEffect(() => {
    if (isDone) return;
    const fallbackTimer = setTimeout(() => {
      handleComplete();
    }, durationMs);

    return () => clearTimeout(fallbackTimer);
  }, [durationMs, isDone]);

  // Handle time update for progress bar
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration && !isNaN(video.duration) && video.duration > 0) {
      const pct = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
      setProgress(pct);
    }
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="luxury-video-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015, filter: 'blur(8px)' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden select-none"
        >
          {/* 1. Landscape Video (Desktop / Horizontal devices) */}
          <video
            ref={landscapeVideoRef}
            src="/videos/loader-landscape.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleComplete}
            onTimeUpdate={handleTimeUpdate}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isLandscape ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* 2. Portrait Video (Mobile / Vertical devices) */}
          <video
            ref={portraitVideoRef}
            src="/videos/loader-portrait.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleComplete}
            onTimeUpdate={handleTimeUpdate}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              !isLandscape ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10" />

          {/* Top Architectural Branding Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
            <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] sm:text-xs tracking-widest uppercase font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <Sparkles className="w-3.5 h-3.5 text-[#C6FF00] animate-pulse" />
              <span>SKYRA CREATIONS • RUNWAY 2026</span>
            </div>

            {/* Skip Intro Button */}
            <button
              type="button"
              onClick={handleComplete}
              className="pointer-events-auto px-4 py-2 rounded-sm bg-black/60 hover:bg-black/85 text-[#C6FF00] hover:text-white border border-[#C6FF00]/40 hover:border-[#C6FF00] font-mono-editorial text-[10px] tracking-widest uppercase transition-all shadow-xl active:scale-95 inline-flex items-center space-x-1.5 backdrop-blur-md"
            >
              <span>SKIP</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Bottom Glowing Laser Loading Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-6 px-4">
            <div className="max-w-md mx-auto space-y-1.5">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#99CC00] to-[#C6FF00] relative rounded-full shadow-[0_0_12px_#C6FF00]"
                  style={{ width: `${Math.max(5, progress)}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white shadow-[0_0_10px_#C6FF00]" />
                </motion.div>
              </div>
              <div className="flex justify-between items-center font-mono-editorial text-[9px] sm:text-[10px] text-zinc-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                <span>SKYRA CREATIONS // OFFICIAL RUNWAY SHOW</span>
                <span className="text-[#C6FF00] font-bold font-mono">{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
