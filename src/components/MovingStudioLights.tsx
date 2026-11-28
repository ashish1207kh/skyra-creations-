import React, { useRef, useEffect, useState } from 'react';

interface MovingStudioLightsProps {
  className?: string;
}

export default function MovingStudioLights({ className = '' }: MovingStudioLightsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic angles for physical fixture head rotation
  const [leftHeadAngle, setLeftHeadAngle] = useState(38);
  const [rightHeadAngle, setRightHeadAngle] = useState(-38);
  const [activeColorPair, setActiveColorPair] = useState(0);

  // Professional stage lighting color palettes (Couture Fashion Week & DMX Par Presets)
  const colorThemes = [
    {
      name: 'Skyra Cyan & Electric Lime',
      left: { r: 0, g: 229, b: 255 },     // Electric Cyan #00E5FF
      right: { r: 198, g: 255, b: 0 },    // Electric Lime #C6FF00
    },
    {
      name: 'Royal Indigo & Sunset Amber',
      left: { r: 129, g: 140, b: 248 },   // Royal Indigo #818CF8
      right: { r: 245, g: 158, b: 11 },   // Warm Amber #F59E0B
    },
    {
      name: 'Ice Blue & Magenta Glow',
      left: { r: 56, g: 189, b: 248 },    // Ice Blue #38BDF8
      right: { r: 217, g: 70, b: 239 },   // Vivid Magenta #D946EF
    },
    {
      name: 'Golden Spotlight & Pure White',
      left: { r: 254, g: 240, b: 138 },   // Warm Gold #FEF08A
      right: { r: 224, g: 242, b: 254 },  // Crystalline White #E0F2FE
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // High-DPI canvas setup
    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Visibility observer to save battery/GPU when out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Floating atmospheric haze/dust particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 2.5,
      speedY: -0.0003 - Math.random() * 0.0006,
      speedX: (Math.random() - 0.5) * 0.0004,
      opacity: 0.1 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    let startTime = performance.now();

    // Render loop: Automated DMX Moving Head Stage Beams
    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible || width === 0 || height === 0) return;

      const elapsed = (now - startTime) / 1000;

      // Automated DMX Pan Choreography (Harmonic Lissajous curves)
      // Left fixture sweeps from ~20 deg to ~68 deg
      const leftAngleDeg = 44 + Math.sin(elapsed * 0.85) * 22 + Math.cos(elapsed * 0.42) * 8;
      // Right fixture sweeps from ~ -20 deg to ~ -68 deg (counter-phase for crossing beams)
      const rightAngleDeg = -44 - Math.sin(elapsed * 0.78 + 1.2) * 22 - Math.cos(elapsed * 0.51) * 8;

      setLeftHeadAngle(leftAngleDeg);
      setRightHeadAngle(rightAngleDeg);

      // Smooth color theme cross-fade every 12 seconds
      const themeDuration = 12;
      const currentThemeIdx = Math.floor(elapsed / themeDuration) % colorThemes.length;
      const nextThemeIdx = (currentThemeIdx + 1) % colorThemes.length;
      const themeProgress = (elapsed % themeDuration) / themeDuration;
      // Smooth sigmoid transition near the end of theme
      const blend = themeProgress > 0.85 ? (themeProgress - 0.85) / 0.15 : 0;

      const curr = colorThemes[currentThemeIdx];
      const next = colorThemes[nextThemeIdx];

      const leftColor = {
        r: Math.round(curr.left.r + (next.left.r - curr.left.r) * blend),
        g: Math.round(curr.left.g + (next.left.g - curr.left.g) * blend),
        b: Math.round(curr.left.b + (next.left.b - curr.left.b) * blend),
      };

      const rightColor = {
        r: Math.round(curr.right.r + (next.right.r - curr.right.r) * blend),
        g: Math.round(curr.right.g + (next.right.g - curr.right.g) * blend),
        b: Math.round(curr.right.b + (next.right.b - curr.right.b) * blend),
      };

      ctx.clearRect(0, 0, width, height);

      // Draw Volumetric Stage Light Beam Function
      const drawBeam = (
        originX: number,
        originY: number,
        angleDeg: number,
        color: { r: number; g: number; b: number },
        beamSpreadDeg: number,
        beamLength: number
      ) => {
        const rad = (angleDeg * Math.PI) / 180;
        const halfSpread = (beamSpreadDeg * Math.PI) / 360;

        // End coordinates for beam cone
        const leftRad = rad - halfSpread;
        const rightRad = rad + halfSpread;

        const endLX = originX + Math.sin(leftRad) * beamLength;
        const endLY = originY + Math.cos(leftRad) * beamLength;

        const endRX = originX + Math.sin(rightRad) * beamLength;
        const endRY = originY + Math.cos(rightRad) * beamLength;

        const centerEndLX = originX + Math.sin(rad) * beamLength;
        const centerEndLY = originY + Math.cos(rad) * beamLength;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // 1. Broad Volumetric Haze Cone
        const conePath = new Path2D();
        conePath.moveTo(originX, originY);
        conePath.lineTo(endLX, endLY);
        conePath.lineTo(endRX, endRY);
        conePath.closePath();

        const hazeGrad = ctx.createRadialGradient(
          originX, originY, 15,
          centerEndLX, centerEndLY, beamLength * 0.95
        );
        hazeGrad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.55)`);
        hazeGrad.addColorStop(0.18, `rgba(${color.r}, ${color.g}, ${color.b}, 0.35)`);
        hazeGrad.addColorStop(0.55, `rgba(${color.r}, ${color.g}, ${color.b}, 0.14)`);
        hazeGrad.addColorStop(0.85, `rgba(${color.r}, ${color.g}, ${color.b}, 0.04)`);
        hazeGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.0)`);

        ctx.fillStyle = hazeGrad;
        ctx.fill(conePath);

        // 2. High-Intensity Core Laser / Center Shaft (Sharper falloff)
        const coreHalfSpread = halfSpread * 0.45;
        const coreLX = originX + Math.sin(rad - coreHalfSpread) * (beamLength * 0.85);
        const coreLY = originY + Math.cos(rad - coreHalfSpread) * (beamLength * 0.85);
        const coreRX = originX + Math.sin(rad + coreHalfSpread) * (beamLength * 0.85);
        const coreRY = originY + Math.cos(rad + coreHalfSpread) * (beamLength * 0.85);

        const corePath = new Path2D();
        corePath.moveTo(originX, originY);
        corePath.lineTo(coreLX, coreLY);
        corePath.lineTo(coreRX, coreRY);
        corePath.closePath();

        const coreGrad = ctx.createRadialGradient(
          originX, originY, 5,
          originX, originY, beamLength * 0.65
        );
        coreGrad.addColorStop(0, `rgba(255, 255, 255, 0.85)`);
        coreGrad.addColorStop(0.12, `rgba(${color.r}, ${color.g}, ${color.b}, 0.65)`);
        coreGrad.addColorStop(0.45, `rgba(${color.r}, ${color.g}, ${color.b}, 0.22)`);
        coreGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.0)`);

        ctx.fillStyle = coreGrad;
        ctx.fill(corePath);

        // 3. Emitter Lens Flare (At Source)
        const flareGrad = ctx.createRadialGradient(originX, originY, 2, originX, originY, 45);
        flareGrad.addColorStop(0, '#FFFFFF');
        flareGrad.addColorStop(0.35, `rgba(${color.r}, ${color.g}, ${color.b}, 0.95)`);
        flareGrad.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 0.45)`);
        flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(originX, originY, 45, 0, Math.PI * 2);
        ctx.fillStyle = flareGrad;
        ctx.fill();

        // 4. Floor Wash Spotlight Pool (Hotspot tracking on floor)
        const floorY = height * 0.92;
        // Calculate where beam hits floor level
        if (Math.cos(rad) > 0.1) {
          const distanceToFloor = (floorY - originY) / Math.cos(rad);
          if (distanceToFloor > 0 && distanceToFloor < beamLength * 1.2) {
            const floorSpotX = originX + Math.sin(rad) * distanceToFloor;
            const spotRadiusX = 90 + Math.sin(elapsed * 2) * 8;
            const spotRadiusY = 32 + Math.cos(elapsed * 2) * 4;

            const floorGrad = ctx.createRadialGradient(
              floorSpotX, floorY, 5,
              floorSpotX, floorY, spotRadiusX
            );
            floorGrad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.45)`);
            floorGrad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.18)`);
            floorGrad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.0)`);

            ctx.beginPath();
            ctx.ellipse(floorSpotX, floorY, spotRadiusX, spotRadiusY, 0, 0, Math.PI * 2);
            ctx.fillStyle = floorGrad;
            ctx.fill();
          }
        }

        ctx.restore();
      };

      // Fixture Origin Positions (Upper left and upper right truss mount points)
      const isMobile = width < 768;
      const leftOriginX = isMobile ? width * 0.08 : width * 0.12;
      const leftOriginY = 38;

      const rightOriginX = isMobile ? width * 0.92 : width * 0.88;
      const rightOriginY = 38;

      const beamLength = Math.max(height * 1.15, 650);
      const beamSpread = isMobile ? 32 : 38;

      // Render Left Moving Head Beam
      drawBeam(leftOriginX, leftOriginY, leftAngleDeg, leftColor, beamSpread, beamLength);

      // Render Right Moving Head Beam
      drawBeam(rightOriginX, rightOriginY, rightAngleDeg, rightColor, beamSpread, beamLength);

      // Render Floating Illuminated Haze Particles in the Air
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.03;
        if (p.y < 0) p.y = 1;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;

        const px = p.x * width;
        const py = p.y * height;
        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);

        // Subtly illuminate particles if they are within proximity of left or right beam
        const dLeft = Math.abs(px - (leftOriginX + Math.sin((leftAngleDeg * Math.PI) / 180) * (py - leftOriginY)));
        const dRight = Math.abs(px - (rightOriginX + Math.sin((rightAngleDeg * Math.PI) / 180) * (py - rightOriginY)));

        if (dLeft < 140 || dRight < 140) {
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          const chosenColor = dLeft < dRight ? leftColor : rightColor;
          ctx.fillStyle = `rgba(${chosenColor.r}, ${chosenColor.g}, ${chosenColor.b}, ${currentOpacity * 1.3})`;
          ctx.fill();
        }
      });
      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-10 w-full h-full max-w-full ${className}`}
      aria-hidden="true"
    >
      {/* ──────────────────────────────────────────────────────────
          TOP STAGE LIGHTING TRUSS RIG (OVERHEAD STRUCTURAL RIGGING)
      ────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-2 sm:px-8 opacity-75 pointer-events-none z-20">
        {/* Left Truss Segment */}
        <div className="w-36 sm:w-64 h-3 bg-gradient-to-r from-zinc-800 via-zinc-700 to-transparent border-t border-b border-white/20 relative flex items-center">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.1)_6px,rgba(255,255,255,0.1)_12px)] opacity-50" />
          <div className="w-1.5 h-6 bg-zinc-600 rounded-sm absolute left-6 border border-white/20 shadow-sm" />
          <div className="w-1.5 h-6 bg-zinc-600 rounded-sm absolute left-20 border border-white/20 shadow-sm" />
        </div>

        {/* Right Truss Segment */}
        <div className="w-36 sm:w-64 h-3 bg-gradient-to-l from-zinc-800 via-zinc-700 to-transparent border-t border-b border-white/20 relative flex items-center justify-end">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(255,255,255,0.1)_6px,rgba(255,255,255,0.1)_12px)] opacity-50" />
          <div className="w-1.5 h-6 bg-zinc-600 rounded-sm absolute right-6 border border-white/20 shadow-sm" />
          <div className="w-1.5 h-6 bg-zinc-600 rounded-sm absolute right-20 border border-white/20 shadow-sm" />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          LEFT MOVING HEAD STUDIO SPOTLIGHT FIXTURE
      ────────────────────────────────────────────────────────── */}
      <div 
        className="absolute top-2 left-[6%] sm:left-[10%] md:left-[11%] z-30 transition-transform duration-75 ease-out"
        style={{
          transform: `translate(-50%, 0) rotate(${leftHeadAngle * 0.35}deg)`,
          transformOrigin: 'top center',
        }}
      >
        {/* Mounting Clamp & Yoke */}
        <div className="w-10 h-3 bg-zinc-800 mx-auto rounded-t-sm border border-white/20 flex justify-center items-center shadow-md">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
        </div>
        <div className="w-8 h-2 bg-zinc-900 mx-auto border-x border-white/10" />

        {/* U-Shaped Moving Yoke */}
        <div className="w-12 h-6 border-x-2 border-b-2 border-zinc-700 mx-auto rounded-b-md relative flex items-center justify-center bg-black/60 shadow-lg">
          {/* Motorized Fixture Barrel (Tilts and Pans) */}
          <div 
            className="w-10 h-10 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-full border-2 border-zinc-600 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-transform duration-75"
            style={{
              transform: `rotate(${leftHeadAngle * 0.75}deg)`,
            }}
          >
            {/* Concentric LED Stage Par Emitter Rings (Matching Studio Light Image) */}
            <div className="w-7 h-7 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/60 flex items-center justify-center p-0.5">
              <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#00E5FF] animate-pulse" />
            </div>
            {/* Cooling Fin Accents */}
            <div className="absolute -top-1 w-2 h-1 bg-zinc-500 rounded-xs" />
            <div className="absolute -bottom-1 w-2 h-1 bg-zinc-500 rounded-xs" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          RIGHT MOVING HEAD STUDIO SPOTLIGHT FIXTURE
      ────────────────────────────────────────────────────────── */}
      <div 
        className="absolute top-2 right-[6%] sm:right-[10%] md:right-[11%] z-30 transition-transform duration-75 ease-out"
        style={{
          transform: `translate(50%, 0) rotate(${rightHeadAngle * 0.35}deg)`,
          transformOrigin: 'top center',
        }}
      >
        {/* Mounting Clamp & Yoke */}
        <div className="w-10 h-3 bg-zinc-800 mx-auto rounded-t-sm border border-white/20 flex justify-center items-center shadow-md">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
        </div>
        <div className="w-8 h-2 bg-zinc-900 mx-auto border-x border-white/10" />

        {/* U-Shaped Moving Yoke */}
        <div className="w-12 h-6 border-x-2 border-b-2 border-zinc-700 mx-auto rounded-b-md relative flex items-center justify-center bg-black/60 shadow-lg">
          {/* Motorized Fixture Barrel (Tilts and Pans) */}
          <div 
            className="w-10 h-10 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-full border-2 border-zinc-600 flex items-center justify-center relative shadow-[0_0_15px_rgba(198,255,0,0.4)] transition-transform duration-75"
            style={{
              transform: `rotate(${rightHeadAngle * 0.75}deg)`,
            }}
          >
            {/* Concentric LED Stage Par Emitter Rings (Matching Studio Light Image) */}
            <div className="w-7 h-7 rounded-full bg-[#C6FF00]/20 border border-[#C6FF00]/60 flex items-center justify-center p-0.5">
              <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#C6FF00] animate-pulse" />
            </div>
            {/* Cooling Fin Accents */}
            <div className="absolute -top-1 w-2 h-1 bg-zinc-500 rounded-xs" />
            <div className="absolute -bottom-1 w-2 h-1 bg-zinc-500 rounded-xs" />
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          VOLUMETRIC ATMOSPHERIC LIGHT CONE CANVAS
      ────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block max-w-full"
        style={{
          filter: 'drop-shadow(0 0 25px rgba(0, 0, 0, 0.7))',
        }}
      />
    </div>
  );
}
