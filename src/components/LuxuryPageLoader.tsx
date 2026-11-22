import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LuxuryPageLoaderProps {
  onLoaded?: () => void;
  durationMs?: number;
}

export default function LuxuryPageLoader({ onLoaded, durationMs = 1400 }: LuxuryPageLoaderProps) {
  const [isDone, setIsDone] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(sessionStorage.getItem('skyra_intro_seen'));
    }
    return false;
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isDone) return;

    sessionStorage.setItem('skyra_intro_seen', 'true');

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          if (onLoaded) onLoaded();
        }, 180);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, onLoaded, isDone]);

  const handleDismiss = () => {
    setIsDone(true);
    if (onLoaded) onLoaded();
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="luxury-editorial-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015, filter: 'blur(10px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050507] overflow-hidden select-none cursor-pointer"
        >
          {/* Subtle Ambient Haute Couture Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(198, 255, 0, 0.35) 0%, rgba(220, 38, 38, 0.15) 50%, transparent 70%)',
            }}
          />

          {/* Center Brandmark Reveal */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-6 sm:p-8 rounded-2xl bg-black/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            >
              <img
                src="/logo-clean.png"
                alt="SKYRA CREATIONS"
                className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] tracking-[0.25em] font-bold">
                <Sparkles className="w-3 h-3 text-[#C6FF00]" />
                <span>HAUTE COUTURE CATWALK // 2026</span>
              </div>
              <p className="text-zinc-400 font-editorial text-sm font-light tracking-wide">
                Chennai City Center • Flagship Runway Showcase
              </p>
            </motion.div>
          </div>

          {/* Bottom Sleek Hairline Loading Meter */}
          <div className="absolute bottom-8 left-0 right-0 z-10 px-8">
            <div className="max-w-xs mx-auto space-y-2">
              <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#99CC00] to-[#C6FF00] rounded-full shadow-[0_0_10px_#C6FF00]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center font-mono-editorial text-[9px] text-zinc-500">
                <span>INITIALIZING</span>
                <span className="text-[#C6FF00] font-bold">{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
