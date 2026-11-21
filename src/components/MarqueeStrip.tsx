import React from 'react';
import { motion } from 'motion/react';

interface MarqueeStripProps {
  text?: string[];
  reverse?: boolean;
  className?: string;
}

export default function MarqueeStrip({ 
  text = [
    'BEYOND THE RUNWAY',
    'HAUTE COUTURE',
    'CHENNAI CITY CENTER 2026',
    'LIVE CATWALK SHOWCASE',
    'SKYRA CREATIONS',
    'MODEL AUDITIONS',
    'VERIFIED ACCREDITATION',
    'STAGE GROOMING',
  ], 
  reverse = false, 
  className = '' 
}: MarqueeStripProps) {
  const repeated = [...text, ...text, ...text, ...text];

  return (
    <div 
      className={`overflow-hidden py-3 select-none flex ${className}`}
      style={{
        backgroundColor: '#0c0d11',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <motion.div
        initial={{ x: reverse ? '-50%' : '0%' }}
        animate={{ x: reverse ? '0%' : '-50%' }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 32,
        }}
        className="flex shrink-0 items-center space-x-8"
      >
        {repeated.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-8 shrink-0">
            <span className="font-mono-editorial text-xs tracking-[0.2em] text-white">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
