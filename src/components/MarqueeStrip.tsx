import React from 'react';
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useVelocity, 
  useAnimationFrame, 
  useMotionValue 
} from 'motion/react';

interface MarqueeStripProps {
  text?: string[];
  reverse?: boolean;
  className?: string;
  baseVelocity?: number;
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
  className = '',
  baseVelocity = 0.06,
}: MarqueeStripProps) {
  const repeated = [...text, ...text, ...text, ...text];
  const baseX = useMotionValue(reverse ? -25 : 0);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 60,
    stiffness: 200,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1], {
    clamp: false,
  });

  useAnimationFrame((_, delta) => {
    if (isHovered) return;
    const dir = reverse ? 1 : -1;
    // Calibrated cinematic crawl: calm, legible, high-fashion pace
    let moveBy = dir * baseVelocity * (delta / 16);

    const vFactor = velocityFactor.get();
    if (Math.abs(vFactor) > 0.05) {
      moveBy += dir * Math.abs(vFactor) * 0.06;
    }

    let next = baseX.get() + moveBy;
    if (next <= -50) {
      next = 0;
    } else if (next >= 0) {
      next = -50;
    }
    baseX.set(next);
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full max-w-full overflow-hidden py-3.5 select-none flex cursor-default ${className}`}
      style={{
        backgroundColor: '#0c0d11',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <motion.div
        style={{ x }}
        className="flex shrink-0 items-center space-x-8 will-change-transform"
      >
        {repeated.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-8 shrink-0">
            <span className="font-mono-editorial text-xs tracking-[0.2em] text-white">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] shadow-[0_0_8px_#C6FF00]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
