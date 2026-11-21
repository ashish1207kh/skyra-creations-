import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, Lock, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HumanVerificationCaptchaProps {
  onVerified: (isVerified: boolean) => void;
  className?: string;
  label?: string;
}

export default function HumanVerificationCaptcha({
  onVerified,
  className = '',
  label = 'HUMAN VERIFICATION & ANTI-BOT SECURITY',
}: HumanVerificationCaptchaProps) {
  const [mode, setMode] = useState<'slider' | 'math'>('slider');
  const [isVerified, setIsVerified] = useState(false);

  // ─── SLIDER STATE ──────────────────────────────────────────────────────────
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentPosRef = useRef(0);

  // ─── MATH CHALLENGE STATE ──────────────────────────────────────────────────
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-'>('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [mathError, setMathError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate new math problem & draw distorted security canvas
  const generateMathProblem = () => {
    const n1 = Math.floor(Math.random() * 20) + 5;
    const n2 = Math.floor(Math.random() * 15) + 2;
    const isAddition = Math.random() > 0.35;
    setNum1(n1);
    setNum2(n2);
    setOperator(isAddition ? '+' : '-');
    setUserAnswer('');
    setMathError(false);
  };

  useEffect(() => {
    generateMathProblem();
  }, []);

  // Draw distorted noise canvas for math problem
  useEffect(() => {
    if (mode !== 'math' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark sleek background
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw random security noise lines (Anti-OCR)
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(198, 255, 0, 0.25)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Draw random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(198, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw text with slight wave distortion
    const text = `${num1} ${operator} ${num2} = ?`;
    ctx.font = 'bold 18px "Space Mono", monospace';
    ctx.fillStyle = '#C6FF00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add shadow
    ctx.shadowColor = 'rgba(198, 255, 0, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }, [mode, num1, num2, operator]);

  // ─── SLIDER DRAG LOGIC ─────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isVerified) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startXRef.current = clientX - currentPosRef.current;
  };

  const handleTouchMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging || isVerified || !trackRef.current) return;
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const trackWidth = trackRef.current.clientWidth - 52; // thumb size = 48px + margin
    const newPos = Math.max(0, Math.min(trackWidth, clientX - startXRef.current));
    
    currentPosRef.current = newPos;
    setSliderPos(newPos);

    // If dragged >= 90% of track, trigger verified
    if (newPos >= trackWidth * 0.90) {
      setIsDragging(false);
      setSliderPos(trackWidth);
      setIsVerified(true);
      onVerified(true);
    }
  };

  const handleTouchEnd = () => {
    if (isVerified) return;
    setIsDragging(false);
    if (!trackRef.current) return;
    const trackWidth = trackRef.current.clientWidth - 52;
    if (currentPosRef.current < trackWidth * 0.90) {
      // Snap back to zero
      currentPosRef.current = 0;
      setSliderPos(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTouchMove);
      window.addEventListener('mouseup', handleTouchEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // ─── MATH VERIFICATION ─────────────────────────────────────────────────────
  const handleMathVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = operator === '+' ? num1 + num2 : num1 - num2;
    if (parseInt(userAnswer.trim(), 10) === correct) {
      setIsVerified(true);
      setMathError(false);
      onVerified(true);
    } else {
      setMathError(true);
      generateMathProblem();
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-sm bg-[#080808] border border-white/15 space-y-3 shadow-lg select-none ${className}`}>
      {/* Anti-bot Honeypot Trap (Completely hidden from real humans) */}
      <div className="opacity-0 absolute -left-[9999px] pointer-events-none" aria-hidden="true">
        <label htmlFor="hp_security_check">Leave this empty</label>
        <input 
          type="text" 
          id="hp_security_check" 
          name="hp_security_check" 
          tabIndex={-1} 
          autoComplete="off" 
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-400' : 'text-[#C6FF00]'}`} />
          <span className="font-mono-editorial text-[10px] font-bold uppercase tracking-wider text-white">
            {label}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono-editorial text-[9px] text-zinc-500 uppercase">
            {isVerified ? 'SECURED' : mode === 'slider' ? 'SLIDE VERIFY' : 'MATH PUZZLE'}
          </span>
        </div>
      </div>

      {/* Verified State Banner */}
      {isVerified ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-sm bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-mono-editorial text-xs font-bold block uppercase tracking-wider">
                HUMAN VERIFIED
              </span>
              <span className="text-[10px] text-emerald-300/80 font-mono block">
                Session cryptographically signed against automated spam
              </span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>
      ) : (
        <div>
          {/* Mode 1: Luxury Slide to Verify */}
          {mode === 'slider' && (
            <div className="space-y-2">
              <div
                ref={trackRef}
                className="relative h-12 rounded-sm bg-[#12141a] border border-white/15 overflow-hidden flex items-center px-1"
              >
                {/* Progress highlight behind thumb */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#C6FF00]/20 border-r border-[#C6FF00]"
                  style={{ width: `${sliderPos + 24}px` }}
                />

                {/* Background centered helper text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                    SLIDE TO CONFIRM YOU ARE HUMAN →
                  </span>
                </div>

                {/* Draggable Thumb */}
                <div
                  onMouseDown={handleTouchStart}
                  onTouchStart={handleTouchStart}
                  style={{ transform: `translateX(${sliderPos}px)` }}
                  className="relative z-10 w-11 h-10 rounded-sm bg-[#C6FF00] text-black flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-transform"
                >
                  <Lock className="w-4 h-4 text-black" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono-editorial text-zinc-500 pt-1">
                <span>Drag thumb fully right to unlock</span>
                <button
                  type="button"
                  onClick={() => setMode('math')}
                  className="text-[#C6FF00] hover:underline"
                >
                  Prefer math puzzle?
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Visual Math Challenge */}
          {mode === 'math' && (
            <form onSubmit={handleMathVerify} className="space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Visual Distorted Canvas */}
                <div className="relative border border-white/15 rounded-sm overflow-hidden bg-black shrink-0">
                  <canvas ref={canvasRef} width={160} height={42} className="block" />
                  <button
                    type="button"
                    onClick={generateMathProblem}
                    className="absolute right-1.5 top-1.5 p-1 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs"
                    title="Refresh Challenge"
                  >
                    <RefreshCw className="w-3 h-3 text-[#C6FF00]" />
                  </button>
                </div>

                {/* Answer Input */}
                <div className="flex-1 w-full flex items-center space-x-2">
                  <input
                    type="number"
                    required
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setMathError(false);
                    }}
                    placeholder="Enter answer"
                    className="flex-1 bg-[#12141a] border border-white/15 rounded-sm px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#C6FF00]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-[11px] font-bold uppercase rounded-sm shrink-0"
                  >
                    VERIFY
                  </button>
                </div>
              </div>

              {mathError && (
                <p className="text-[10px] text-red-400 font-mono flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Incorrect calculation. A fresh challenge has been generated.</span>
                </p>
              )}

              <div className="flex justify-between items-center text-[10px] font-mono-editorial text-zinc-500 pt-1">
                <span>Solves automated bot attacks</span>
                <button
                  type="button"
                  onClick={() => setMode('slider')}
                  className="text-[#C6FF00] hover:underline"
                >
                  Use slider instead
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
