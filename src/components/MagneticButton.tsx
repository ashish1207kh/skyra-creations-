import React, { useRef, useState } from 'react';
import { useSpring, animated, to } from '@react-spring/web';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function MagneticButton({ 
  children, 
  className = '', 
  onClick, 
  style = {},
  disabled = false,
  type = 'button'
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Spring physics for magnetic pull and press bounce
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: { mass: 0.6, tension: 320, friction: 16 },
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    const { clientX, clientY } = e;
    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    api.start({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const handleMouseLeave = () => {
    api.start({ x: 0, y: 0, scale: 1 });
  };

  const handleMouseDown = () => {
    if (disabled) return;
    api.start({ scale: 0.94 });
  };

  const handleMouseUp = () => {
    if (disabled) return;
    api.start({ scale: 1 });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.4;

      // 1. Spawn magical shockwave ripple
      const rippleId = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-2), { id: rippleId, x: clickX, y: clickY, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 650);

      // 2. Spawn 8 radiant micro-sparkle particles
      const colors = ['#C6FF00', '#FFFFFF', '#D8FF33', '#FF2233', '#FFD700', '#38BDF8'];
      const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8 + (Math.random() * 0.3 - 0.15);
        const dist = 32 + Math.random() * 28;
        return {
          id: Date.now() + i + Math.random(),
          x: clickX,
          y: clickY,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: colors[i % colors.length],
        };
      });
      setParticles((prev) => [...prev.slice(-10), ...newParticles]);
      setTimeout(() => {
        setParticles([]);
      }, 700);
    }

    if (onClick) onClick(e);
  };

  return (
    <animated.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={`group relative overflow-hidden will-change-transform select-none ${className}`}
      style={{
        ...style,
        transform: to([x, y, scale], (xVal, yVal, sVal) => `translate3d(${xVal}px, ${yVal}px, 0) scale(${sVal})`),
      }}
    >
      {/* Cinematic Diagonal Light Shimmer Sweep on Hover */}
      <span 
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.22) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Expanding Ripple Shockwaves */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
            background: 'radial-gradient(circle, rgba(198, 255, 0, 0.45) 0%, rgba(255, 255, 255, 0.25) 50%, transparent 75%)',
            animation: 'ripple 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
          aria-hidden="true"
        />
      ))}

      {/* Radiating Sparkle Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none shadow-sm"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animation: 'particleBurst 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          } as any}
          aria-hidden="true"
        />
      ))}

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>
    </animated.button>
  );
}
