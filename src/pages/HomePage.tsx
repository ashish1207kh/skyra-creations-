import React, { useRef, useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Eye,
  Check
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import VirtualRunwayScene from '../components/VirtualRunwayScene';
import TiltCard from '../components/TiltCard';
import MarqueeStrip from '../components/MarqueeStrip';
import MagneticButton from '../components/MagneticButton';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

const faqs = [
  {
    question: "What is the total participation fee and advance token structure?",
    answer: "The total participation fee for Runway Show 2026 is ₹3,000. To reserve your audition slot, you can commit an advance token (₹500, ₹1,000, or full ₹3,000). The remaining balance can be cleared anytime prior to the event date through the Payment section."
  },
  {
    question: "Where and when is Runway Show 2026 hosted?",
    answer: "The flagship showcase will take place in central Chennai at Chennai City Center Auditorium. The exact venue address, call times, and backstage rehearsal schedule are dispatched directly to your registered WhatsApp 10 days before the show."
  },
  {
    question: "Who is eligible to participate and what are the categories?",
    answer: "We welcome all aspiring and experienced models! There are curated competitive and showcase categories: Kids (Ages 4–12), Teens (Ages 13–17), Adults (Ages 18–35), Plus-Size, and Classic (up to 50). No prior portfolio is required."
  },
  {
    question: "What is the advance token refund policy?",
    answer: "Because venue staging, choreographer allocations, and model slots are locked upon reservation, all registration token advances are strictly non-refundable and non-transferable under all circumstances once committed."
  },
  {
    question: "When and how do I receive my official digital Runway Pass?",
    answer: "Once your payment is submitted with the 12-digit UPI reference (UTR), our accounts verification team cross-checks it directly with bank settlement statements. Upon approval, your verified digital pass and unique pass token are immediately unlocked on the Check Status portal for download and print."
  }
];

export default function HomePage({ setActiveTab, onSelectEvent }: HomePageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section 1: Hero Cinematic Parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.84]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 1], [0, -90]);
  const heroFilter = useTransform(heroProgress, [0, 0.85], ['blur(0px)', 'blur(6px)']);

  // Section 2: Brand Introduction (Continuous Kinematics)
  const sec2Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sec2Progress } = useScroll({
    target: sec2Ref,
    offset: ['start end', 'end start'],
  });
  const sec2ImgY = useTransform(sec2Progress, [0, 1], [-50, 50]);
  const sec2ImgScale = useTransform(sec2Progress, [0, 0.5, 1], [0.95, 1.04, 0.96]);
  const sec2TextY = useTransform(sec2Progress, [0, 0.4, 0.8, 1], [40, 0, 0, -30]);
  const sec2Opacity = useTransform(sec2Progress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);

  // Section 3: Core Disciplines
  const sec3Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sec3Progress } = useScroll({
    target: sec3Ref,
    offset: ['start end', 'end start'],
  });
  const sec3Row1Y = useTransform(sec3Progress, [0.05, 0.45], [35, -20]);
  const sec3Row2Y = useTransform(sec3Progress, [0.25, 0.65], [35, -20]);
  const sec3Row3Y = useTransform(sec3Progress, [0.45, 0.85], [35, -20]);

  // Section 4: Upcoming Events
  const sec4Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sec4Progress } = useScroll({
    target: sec4Ref,
    offset: ['start end', 'end start'],
  });
  const sec4CardScale = useTransform(sec4Progress, [0, 0.45, 1], [0.93, 1, 0.96]);
  const sec4CardY = useTransform(sec4Progress, [0, 0.5, 1], [50, 0, -30]);
  const sec4Opacity = useTransform(sec4Progress, [0, 0.2, 0.85, 1], [0.4, 1, 1, 0.4]);

  // Section 5: Campaign Interlude
  const interludeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: interludeProgress } = useScroll({
    target: interludeRef,
    offset: ['start end', 'end start'],
  });
  const interludeImgY = useTransform(interludeProgress, [0, 1], [-80, 80]);
  const interludeScale = useTransform(interludeProgress, [0, 0.5, 1], [0.94, 1.04, 0.96]);
  const interludeLetterSpacing = useTransform(interludeProgress, [0, 0.5, 1], ['-0.03em', '0.04em', '-0.02em']);
  const interludeOpacity = useTransform(interludeProgress, [0, 0.25, 0.75, 1], [0.35, 1, 1, 0.35]);

  // Section 6: Visual Archive
  const sec6Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sec6Progress } = useScroll({
    target: sec6Ref,
    offset: ['start end', 'end start'],
  });
  const sec6Img1Y = useTransform(sec6Progress, [0, 1], [-30, 30]);
  const sec6Img2Y = useTransform(sec6Progress, [0, 1], [35, -35]);

  // Section 7: Final Call to Action
  const sec7Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sec7Progress } = useScroll({
    target: sec7Ref,
    offset: ['start end', 'end end'],
  });
  const sec7Scale = useTransform(sec7Progress, [0, 0.75], [0.92, 1]);
  const sec7Y = useTransform(sec7Progress, [0, 0.75], [50, 0]);
  const sec7Opacity = useTransform(sec7Progress, [0, 0.45], [0.4, 1]);

  return (
    <div className="space-y-12 sm:space-y-20 pb-12 sm:pb-16 overflow-x-hidden relative">
      {/* Continuous Drifting Ambient Runway Glow Orb */}
      <motion.div
        animate={{
          x: [-30, 40, -30],
          y: [-20, 30, -20],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fixed top-1/3 left-1/3 w-[650px] h-[400px] rounded-full blur-[150px] pointer-events-none opacity-20 z-0"
        style={{
          background: 'radial-gradient(circle, rgba(198, 255, 0, 0.35) 0%, rgba(220, 38, 38, 0.2) 55%, transparent 75%)',
        }}
      />

      {/* ──────────────────────────────────────────────────────────
          SECTION 1: 100svh VIRTUAL RUNWAY HERO WITH SCROLL PARALLAX
      ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[85svh] sm:min-h-[92svh] py-10 sm:py-20 flex items-center justify-center overflow-hidden">
        {/* Three.js Virtual Runway Catwalk Canvas */}
        <div className="absolute inset-0 z-0">
          <VirtualRunwayScene className="w-full h-full" />
        </div>

        {/* Ambient Overlay for High-Fashion Contrast */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(8,8,8,0.7) 0%, transparent 40%, rgba(8,8,8,0.4) 70%, var(--bg-primary) 100%)'
          }}
        />

        {/* Subtle Ambient Accent Glow */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] blur-3xl pointer-events-none z-10 opacity-30"
          style={{ background: 'radial-gradient(ellipse at center, var(--accent) 0%, transparent 70%)' }}
        />

        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
          className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6 pt-14 sm:pt-20 pb-4 sm:pb-6 will-change-transform transform-gpu"
        >
          {/* Official SKYRA CREATIONS Brandmark Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center pb-2"
          >
            <div 
              onClick={() => setActiveTab('about')}
              className="relative group cursor-pointer select-none"
              title="SKYRA CREATIONS — Certified Fashion & Runway Platform"
            >
              {/* Dynamic Multicolored Ambient Glow */}
              <div 
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.5) 0%, rgba(198, 255, 0, 0.3) 45%, transparent 70%)',
                }}
              />
              
              <div 
                className="relative px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl transition-all duration-500 group-hover:scale-105"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.9), 0 0 25px rgba(198,255,0,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <img
                  src="/logo-clean.png"
                  alt="SKYRA CREATIONS Official Logo"
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain transition-transform duration-500"
                  style={{
                    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.95)) contrast(1.08)',
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-extrabold tracking-tight leading-[0.98] max-w-5xl mx-auto text-hero"
            style={{ color: '#F5F5F5' }}
          >
            BEYOND THE <br className="hidden sm:inline" />
            <span style={{ color: 'var(--accent)' }}>
              RUNWAY.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-lg md:text-xl font-light leading-relaxed"
            style={{ color: 'var(--silver)' }}
          >
            An expression of fashion, confidence and creative individuality.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <MagneticButton
              onClick={() => setActiveTab('events')}
              className="w-full sm:w-auto px-9 py-4 font-mono-editorial text-xs tracking-widest uppercase transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center space-x-2 rounded-sm shadow-xl"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000',
                fontWeight: 700
              }}
            >
              <span>EXPLORE EVENTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MagneticButton>

            <MagneticButton
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-4 font-mono-editorial text-xs tracking-widest uppercase transition-all backdrop-blur-md flex items-center justify-center space-x-2 rounded-sm hover:opacity-80"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--border)',
                color: '#FFFFFF'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span>JOIN THE RUNWAY</span>
            </MagneticButton>
          </motion.div>

          {/* Architectural Metadata Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.4 }}
            className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-4xl mx-auto"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="p-2">
              <div className="text-lg sm:text-xl font-bold font-editorial" style={{ color: '#FFFFFF' }}>Chennai</div>
              <div className="font-mono-editorial mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>CITY CENTER VENUE</div>
            </div>
            <div className="p-2">
              <div className="text-lg sm:text-xl font-bold font-editorial" style={{ color: 'var(--accent)' }}>Inclusive</div>
              <div className="font-mono-editorial mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>KIDS TO ADULTS</div>
            </div>
            <div className="p-2">
              <div className="text-lg sm:text-xl font-bold font-editorial" style={{ color: 'var(--silver)' }}>Grooming</div>
              <div className="font-mono-editorial mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>STAGE CHOREOGRAPHY</div>
            </div>
            <div className="p-2">
              <div className="text-lg sm:text-xl font-bold font-editorial" style={{ color: '#FFFFFF' }}>Verified</div>
              <div className="font-mono-editorial mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>TRANSPARENT SYSTEM</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Runway Couture Marquee */}
      <div className="-my-4 sm:-my-6">
        <MarqueeStrip />
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2: BRAND INTRODUCTION (ASYMMETRIC 2-COLUMN)
      ────────────────────────────────────────────────────────── */}
      <section ref={sec2Ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Image 3:4 with Continuous Cinematic Scroll Parallax */}
          <motion.div 
            style={{ y: sec2ImgY, scale: sec2ImgScale, opacity: sec2Opacity }}
            className="lg:col-span-5 relative will-change-transform"
          >
            <div 
              className="relative overflow-hidden shadow-2xl group rounded-sm"
              style={{ border: '1px solid var(--border)' }}
            >
              <img 
                src="/images/runway-2.jpg" 
                alt="SKYRA CREATIONS Runway Fashion Model" 
                loading="lazy"
                className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div 
                className="absolute inset-0 flex items-end p-6"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
              >
                <div>
                  <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--accent)' }}>
                    LIVE CATWALK SHOWCASE
                  </span>
                  <span className="font-editorial text-lg font-bold text-white">
                    Confidence on the Ramp
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Large Editorial Typography & Story with Continuous Motion */}
          <motion.div 
            style={{ y: sec2TextY, opacity: sec2Opacity }}
            className="lg:col-span-7 space-y-6 will-change-transform"
          >
            <span className="font-mono-editorial block" style={{ color: 'var(--accent)', fontSize: '11px' }}>
              01 // BRAND INTRODUCTION
            </span>

            <h2 
              className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.08]"
              style={{ color: 'var(--text-primary)' }}
            >
              FASHION IS MORE THAN WHAT YOU WEAR.
            </h2>

            <p 
              className="text-base sm:text-lg leading-relaxed font-light"
              style={{ color: 'var(--text-secondary)' }}
            >
              SKYRA CREATIONS is an international fashion and runway platform dedicated to emerging models, designers, and creative artists. Through premier catwalk productions, structured stage grooming, and certified recognition, we provide a genuine spotlight for true talent.
            </p>

            <p 
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Founded by <strong>B Sriram</strong>, SKYRA CREATIONS replaces industry gatekeeping with transparent production, prestigious city-center venues, and verified credentials for every participant.
            </p>

            <div className="pt-4">
              <button
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center space-x-2 font-mono-editorial text-xs font-bold transition-all group"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="group-hover:underline">EXPLORE OUR STORY</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3: WHAT WE DO (ALTERNATING EDITORIAL BANDS)
      ────────────────────────────────────────────────────────── */}
      <section ref={sec3Ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono-editorial block" style={{ color: 'var(--accent)', fontSize: '11px' }}>
            02 // CORE DISCIPLINES
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            What We Create
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            A complete ecosystem connecting models, designers, choreographers and fashion enthusiasts.
          </p>
        </div>

        {/* Alternating Feature Rows with Multiplane Motion */}
        <div className="space-y-12">
          {/* Row 1: Fashion Shows */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-5 sm:p-10 rounded-sm will-change-transform"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              y: sec3Row1Y
            }}
          >
            <div className="lg:col-span-6 relative overflow-hidden h-72 sm:h-80 rounded-sm" style={{ border: '1px solid var(--border)' }}>
              <img 
                src="/images/runway-1.jpg" 
                alt="Fashion Shows & Runway Lighting" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute top-4 left-4 px-3 py-1 font-mono-editorial text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'var(--accent)' }}
              >
                01 / FASHION SHOWS
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Full-Scale Runway Productions
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We produce high-impact fashion show productions featuring architectural lighting, dynamic sound design, precision catwalk choreography and professional media coverage across top city centers.
              </p>
              <button
                onClick={() => setActiveTab('what-we-do')}
                className="inline-flex items-center space-x-1 font-mono-editorial text-[11px] font-bold transition-all hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                <span>LEARN MORE ABOUT PRODUCTIONS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Row 2: Model Opportunities (Reversed Layout) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-5 sm:p-10 rounded-sm will-change-transform"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              y: sec3Row2Y
            }}
          >
            <div className="lg:col-span-6 lg:order-2 relative overflow-hidden h-72 sm:h-80 rounded-sm" style={{ border: '1px solid var(--border)' }}>
              <img 
                src="/images/runway-3.jpg" 
                alt="Model Opportunities" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute top-4 left-4 px-3 py-1 font-mono-editorial text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'var(--accent)' }}
              >
                02 / OPPORTUNITIES
              </div>
            </div>
            <div className="lg:col-span-6 lg:order-1 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Curated Platforms for Emerging Models
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Every contestant receives verified credentials, stage photographs and transparent evaluation. We champion diversity with dedicated categories for Kids, Teens, Adults, Plus-size, and Fitness contestants.
              </p>
              <button
                onClick={() => setActiveTab('what-we-do')}
                className="inline-flex items-center space-x-1 font-mono-editorial text-[11px] font-bold transition-all hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                <span>EXPLORE MODEL BENEFITS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Row 3: Stage Grooming */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-5 sm:p-10 rounded-sm will-change-transform"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              y: sec3Row3Y
            }}
          >
            <div className="lg:col-span-6 relative overflow-hidden h-72 sm:h-80 rounded-sm" style={{ border: '1px solid var(--border)' }}>
              <img 
                src="/founder.png" 
                alt="Stage Grooming & Mentorship" 
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute top-4 left-4 px-3 py-1 font-mono-editorial text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'var(--accent)' }}
              >
                03 / GROOMING
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Posture, Walk &amp; Ramp Rehearsal
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Pre-show rehearsal sessions guide models through catwalk pacing, poise, expression and confident posture under genuine stage spotlights, led directly by verified industry choreographers.
              </p>
              <button
                onClick={() => setActiveTab('what-we-do')}
                className="inline-flex items-center space-x-1 font-mono-editorial text-[11px] font-bold transition-all hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                <span>READ GROOMING CURRICULUM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4: UPCOMING EVENTS (MAGAZINE-STYLE DISCOVERY)
      ────────────────────────────────────────────────────────── */}
      <section ref={sec4Ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono-editorial block" style={{ color: 'var(--accent)', fontSize: '11px' }}>
            03 // EVENT DISCOVERY
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            THE NEXT MOMENT STARTS HERE.
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Official runway show schedules and audition registrations.
          </p>
        </div>

        {/* Featured Event Card with Continuous Movie Zoom */}
        <TiltCard className="rounded-sm overflow-hidden">
          <motion.div 
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              scale: sec4CardScale,
              y: sec4CardY,
              opacity: sec4Opacity
            }}
            className="p-8 sm:p-12 rounded-sm relative overflow-hidden shadow-2xl will-change-transform"
          >
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div 
                    className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono-editorial text-[10px] font-bold tracking-wider"
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.4)', 
                      border: '1px solid var(--border)',
                      color: 'var(--accent)' 
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
                    <span>REGISTRATIONS ACTIVE</span>
                  </div>

                  <div className="flex items-center space-x-2 font-mono-editorial text-[10px] text-[#C6FF00] bg-[#C6FF00]/10 border border-[#C6FF00]/30 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] animate-ping" />
                    <span className="font-bold">84% SLOTS COMMITTED</span>
                  </div>
                </div>

                {/* Live Slot Allocation Visualizer */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex justify-between font-mono-editorial text-[9px] text-[#BFC3C7] tracking-wider uppercase">
                    <span>Audition Slot Availability</span>
                    <span className="text-[#C6FF00] font-bold">16% Slots Left</span>
                  </div>
                  <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '84%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-[#C6FF00] via-[#D8FF33] to-[#E5FF7F] rounded-full shadow-[0_0_12px_rgba(198,255,0,0.6)]"
                    />
                  </div>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  SKYRA CREATIONS — RUNWAY SHOW 2026
                </h3>

                <p className="text-sm sm:text-base leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                  Step into the spotlight at our premier runway event in Chennai. Featuring full-stage catwalk choreography, industry judges and official certificate recognition.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-sm" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>VENUE</span>
                    <strong style={{ color: 'var(--text-primary)' }}>Chennai City Center</strong>
                  </div>
                  <div className="p-3 rounded-sm" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>TOTAL FEE</span>
                    <strong className="text-sm" style={{ color: 'var(--accent)' }}>₹3,000</strong>
                  </div>
                  <div className="p-3 rounded-sm col-span-2 sm:col-span-1" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>ADVANCE TOKEN</span>
                    <strong style={{ color: 'var(--text-primary)' }}>₹500 / ₹1,000 / ₹1,500</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <MagneticButton
                    onClick={() => setActiveTab('register')}
                    className="px-7 py-3.5 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center space-x-2"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#000000'
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>REGISTER NOW FOR ₹3,000</span>
                  </MagneticButton>

                  <button
                    onClick={() => {
                      if (onSelectEvent) onSelectEvent('EVT-CHX-2026');
                      setActiveTab('event-details');
                    }}
                    className="px-6 py-3.5 font-mono-editorial text-xs font-semibold rounded-sm transition-all flex items-center space-x-2"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>VIEW EVENT DETAILS</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="overflow-hidden shadow-2xl rounded-sm" style={{ border: '1px solid var(--border)' }}>
                  <img 
                    src="/images/runway-3.jpg" 
                    alt="Runway Show 2026 Live Catwalk" 
                    loading="lazy"
                    className="w-full h-80 object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </TiltCard>
      </section>

      {/* Reverse Couture Marquee Strip */}
      <div className="-my-4 sm:-my-6">
        <MarqueeStrip 
          reverse={true} 
          text={[
            'HAUTE COUTURE 2026',
            'CHENNAI CITY CENTER',
            'EXCLUSIVE AUDITIONS',
            'STAGE GROOMING',
            'LIVE CATWALK',
            'CERTIFIED ACCREDITATION',
            'DIRECTOR B SRIRAM',
          ]} 
        />
      </div>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5: CAMPAIGN INTERLUDE (FULL-BLEED EDITORIAL BREAK WITH PARALLAX)
      ────────────────────────────────────────────────────────── */}
      <section 
        ref={interludeRef}
        className="relative py-14 sm:py-24 overflow-hidden mx-4 sm:mx-8 rounded-sm"
        style={{ border: '1px solid var(--border)' }}
      >
        <motion.div 
          className="absolute -inset-16 bg-cover bg-center pointer-events-none will-change-transform"
          style={{ 
            backgroundImage: `url('/images/runway-1.jpg')`,
            y: interludeImgY 
          }}
        />
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs" />
        
        <motion.div 
          style={{ scale: interludeScale, opacity: interludeOpacity }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 will-change-transform"
        >
          <span className="font-mono-editorial block text-[11px] tracking-widest" style={{ color: 'var(--accent)' }}>
            CAMPAIGN INTERLUDE
          </span>
          <motion.h2 
            style={{ letterSpacing: interludeLetterSpacing }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight"
          >
            OWN YOUR PRESENCE.
          </motion.h2>
          <p className="text-base sm:text-xl font-light max-w-2xl mx-auto leading-relaxed text-zinc-300">
            Every runway begins with the confidence to take the first step.
          </p>
          <div className="pt-4 flex justify-center">
            <MagneticButton
              onClick={() => setActiveTab('register')}
              className="px-8 py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <span>DISCOVER YOUR OPPORTUNITY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 6: GALLERY PREVIEW (ASYMMETRIC GRID WITH PARALLAX)
      ────────────────────────────────────────────────────────── */}
      <section ref={sec6Ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono-editorial block" style={{ color: 'var(--accent)', fontSize: '11px' }}>
              04 // VISUAL ARCHIVE
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              Catwalk Moments &amp; Highlights
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('gallery')}
            className="font-mono-editorial text-xs font-bold transition-all hover:underline flex items-center space-x-1"
            style={{ color: 'var(--accent)' }}
          >
            <span>VIEW FULL GALLERY</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Varied Proportions Grid with Differential Motion */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <motion.div style={{ y: sec6Img1Y }} className="md:col-span-7 will-change-transform">
            <TiltCard className="rounded-sm overflow-hidden shadow-lg group">
              <div 
                className="overflow-hidden rounded-sm"
                style={{ border: '1px solid var(--border)' }}
              >
                <img 
                  src="/images/runway-2.jpg" 
                  alt="Runway Stage Catwalk" 
                  loading="lazy"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </TiltCard>
          </motion.div>

          <motion.div style={{ y: sec6Img2Y }} className="md:col-span-5 will-change-transform">
            <TiltCard className="rounded-sm overflow-hidden shadow-lg group">
              <div 
                className="overflow-hidden rounded-sm"
                style={{ border: '1px solid var(--border)' }}
              >
                <img 
                  src="/founder.png" 
                  alt="Founder & CEO B Sriram" 
                  loading="lazy"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 6.5: AUDITION & PARTICIPATION FAQ (ACCORDION)
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-mono-editorial block text-[11px] tracking-widest text-[#C6FF00]">
            05 // FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white">
            EVERYTHING YOU NEED TO KNOW.
          </h2>
          <p className="text-xs sm:text-sm text-[#9DA1AF]">
            Transparent guidelines, fee breakdowns, and venue protocols for contestants.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-[#12141a] border border-white/10 rounded-sm overflow-hidden transition-all duration-300 hover:border-white/20"
                style={{
                  borderColor: isOpen ? 'rgba(198, 255, 0, 0.4)' : undefined,
                  boxShadow: isOpen ? '0 0 25px rgba(198, 255, 0, 0.06)' : undefined,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="font-mono-editorial text-xs font-bold text-[#C6FF00]">
                      0{idx + 1}
                    </span>
                    <h3 className="font-editorial text-base sm:text-lg font-bold text-white tracking-wide">
                      {faq.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="p-1.5 rounded-sm bg-white/5 text-[#C6FF00] shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#BFC3C7] font-light leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 7: FINAL CALL TO ACTION (POWERFUL CLOSING)
      ────────────────────────────────────────────────────────── */}
      <section ref={sec7Ref} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)',
            scale: sec7Scale,
            y: sec7Y,
            opacity: sec7Opacity
          }}
          className="p-6 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl rounded-sm will-change-transform"
        >
          <div 
            className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
          />

          <h2 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight relative z-10" style={{ color: 'var(--text-primary)' }}>
            YOUR MOMENT. YOUR RUNWAY.
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base font-light relative z-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Step onto the catwalk with confidence. Secure your registration for the upcoming Chennai Runway Show 2026.
          </p>

          <div className="pt-4 flex justify-center relative z-10">
            <MagneticButton
              onClick={() => setActiveTab('register')}
              className="px-10 py-4 font-mono-editorial text-xs sm:text-sm font-bold uppercase tracking-widest rounded-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center space-x-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>REGISTER NOW</span>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* Floating Luxury Back to Top Dial with Radial Progress Circle */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#12141a]/90 backdrop-blur-md border border-white/20 text-[#C6FF00] hover:text-white hover:border-[#C6FF00] flex items-center justify-center shadow-2xl transition-all group"
            aria-label="Scroll to top"
          >
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#C6FF00"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={125.66}
                strokeDashoffset={125.66 - (125.66 * scrollProgress) / 100}
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
            </svg>
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
