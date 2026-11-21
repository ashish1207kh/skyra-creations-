import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LuxuryPageLoaderProps {
  onLoaded?: () => void;
  durationMs?: number;
}

export default function LuxuryPageLoader({ onLoaded, durationMs = 900 }: LuxuryPageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
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
  }, [durationMs, onLoaded]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="luxury-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: '#050507' }}
        >
          {/* Subtle Ambient Aura */}
          <div 
            className="absolute w-[500px] h-[300px] rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(198, 255, 0, 0.4) 0%, rgba(220, 38, 38, 0.3) 50%, transparent 70%)',
            }}
          />

          {/* Central Logo & Brand Typography */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-center space-y-6 z-10 px-4"
          >
            <div className="relative inline-block">
              <img
                src="/logo-clean.png"
                alt="SKYRA CREATIONS"
                className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-[0_4px_24px_rgba(198,255,0,0.35)]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] tracking-[0.25em] uppercase font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>HAUTE COUTURE RUNWAY 2026</span>
              </div>
              <p className="font-editorial text-xs sm:text-sm text-zinc-400 font-light tracking-wider">
                BEYOND THE RUNWAY • CHENNAI CITY CENTER
              </p>
            </div>

            {/* High-Precision Architectural Loading Track */}
            <div className="w-64 sm:w-80 mx-auto space-y-2 pt-2">
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-[#C6FF00] relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* Glowing Laser Leading Edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white shadow-[0_0_12px_#C6FF00]" />
                </motion.div>
              </div>

              <div className="flex justify-between items-center font-mono-editorial text-[10px] text-zinc-500">
                <span>SYSTEM INITIALIZING</span>
                <span className="text-[#C6FF00] font-bold font-mono">{progress}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
