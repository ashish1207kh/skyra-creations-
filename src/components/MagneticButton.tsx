import React, { useRef } from 'react';
import { useSpring, animated, to } from '@react-spring/web';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
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

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { mass: 0.8, tension: 280, friction: 18 },
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    const { clientX, clientY } = e;
    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    api.start({ x: middleX * 0.28, y: middleY * 0.28 });
  };

  const handleMouseLeave = () => {
    api.start({ x: 0, y: 0 });
  };

  return (
    <animated.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${className}`}
      style={{
        ...style,
        transform: to([x, y], (xVal, yVal) => `translate3d(${xVal}px, ${yVal}px, 0)`),
      }}
    >
      {children}
    </animated.button>
  );
}
