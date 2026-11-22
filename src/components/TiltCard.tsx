import React, { useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glare?: boolean;
  style?: React.CSSProperties;
}

export default function TiltCard({ children, className = '', onClick, glare = true, style = {} }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const [{ xys }, setSpring] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 1.2, tension: 340, friction: 26 },
  }));

  const calc = (x: number, y: number, rect: DOMRect) => [
    -((y - rect.top) / rect.height - 0.5) * 12,
    ((x - rect.left) / rect.width - 0.5) * 12,
    1.02,
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    setSpring.start({ xys: calc(e.clientX, e.clientY, rect) });
    if (glare) {
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePos({ x: px, y: py, opacity: 0.18 });
    }
  };

  const handleMouseLeave = () => {
    setSpring.start({ xys: [0, 0, 1] });
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <animated.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform overflow-hidden ${className}`}
      style={{
        ...style,
        transform: xys.to((x, y, s) => `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`),
      }}
    >
      {children}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(198, 255, 0, 0.35), rgba(255, 255, 255, 0.12) 40%, transparent 80%)`,
          }}
        />
      )}
    </animated.div>
  );
}
