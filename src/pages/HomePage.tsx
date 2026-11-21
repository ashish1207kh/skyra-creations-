import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Camera, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Eye,
  Layers,
  Sparkle
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import VirtualRunwayScene from '../components/VirtualRunwayScene';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export default function HomePage({ setActiveTab, onSelectEvent }: HomePageProps) {
  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* ──────────────────────────────────────────────────────────
          SECTION 1: FULL-SCREEN VIRTUAL RUNWAY HERO
      ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] sm:min-h-[96vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
        {/* Three.js Virtual Runway Catwalk Canvas */}
        <div className="absolute inset-0 z-0">
          <VirtualRunwayScene className="w-full h-full" />
        </div>

        {/* Ambient Overlay for High-Fashion Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-[#080808] dark:to-[#080808] to-transparent pointer-events-none z-10" />

        {/* Subtle Ambient Electric Lime & Silver Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#C6FF00]/15 via-white/10 to-transparent blur-3xl pointer-events-none z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Subtle Runway Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/60 dark:bg-black/60 bg-white/70 backdrop-blur-md border border-[#C6FF00]/30 text-xs sm:text-sm font-medium text-[#C6FF00] dark:text-[#C6FF00] text-[#789900] tracking-widest uppercase animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-ping" />
            <span>Official Fashion, Modelling &amp; Runway Experience</span>
          </div>

          {/* Hero Headline */}
          <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-[1.02] max-w-5xl mx-auto">
            BEYOND THE <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-[#BFC3C7] to-[#C6FF00] bg-clip-text text-transparent">
              RUNWAY.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-300 font-light leading-relaxed">
            An expression of fashion, confidence and creative individuality.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('events')}
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-zinc-100 via-white to-[#C6FF00] text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>EXPLORE EVENTS</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black/60 hover:bg-black/80 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#C6FF00]" />
              <span>JOIN THE RUNWAY</span>
            </button>
          </div>

          {/* Architectural Metadata Bar */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-white font-editorial">Chennai</div>
              <div className="text-xs text-zinc-400 mt-0.5 tracking-wide">City Center Runway Venue</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-[#C6FF00] font-editorial">Inclusive</div>
              <div className="text-xs text-zinc-400 mt-0.5 tracking-wide">Kids, Teens, Adults &amp; Fitness</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-zinc-200 font-editorial">Grooming</div>
              <div className="text-xs text-zinc-400 mt-0.5 tracking-wide">Choreography &amp; Ramp Walk Prep</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-white font-editorial">Verified</div>
              <div className="text-xs text-zinc-400 mt-0.5 tracking-wide">Transparent Administration</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2: BRAND INTRODUCTION (TWO-COLUMN EDITORIAL)
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl group">
              <img 
                src="/images/runway-2.jpg" 
                alt="SKYRA CREATIONS Runway Fashion Model" 
                className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-[#C6FF00] font-bold block">Live Catwalk</span>
                  <span className="text-white font-editorial text-lg font-bold">Confidence on the Ramp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Large Editorial Typography & Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C6FF00]/10 text-[#789900] dark:text-[#C6FF00] border border-[#C6FF00]/20 text-xs font-semibold uppercase tracking-wider">
              <span>Brand Introduction</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-[1.1]">
              FASHION IS MORE THAN WHAT YOU WEAR.
            </h2>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
              SKYRA CREATIONS is an international-standard fashion and creative platform designed to empower aspiring talent, emerging models and creative directors through premier runway showcases, structured stage grooming and verified industry opportunities.
            </p>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Founded by <strong>B Sriram</strong>, SKYRA CREATIONS breaks traditional industry gatekeeping by providing an accessible, authentic stage where contestants gain genuine ramp exposure, stage presence and verified credentials.
            </p>

            <div className="pt-4">
              <button
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-[#C6FF00] hover:text-[#789900] dark:hover:text-white transition-colors group"
              >
                <span>EXPLORE OUR STORY</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3: WHAT WE DO (IMAGE-LED ALTERNATING SHOWCASE)
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#789900] dark:text-[#C6FF00] uppercase tracking-widest">Core Disciplines</span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
            What We Do at SKYRA
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            A complete ecosystem connecting models, designers, choreographers and fashion enthusiasts.
          </p>
        </div>

        {/* Alternating Feature Rows */}
        <div className="space-y-16">
          {/* Row 1: Fashion Shows */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] hover:border-[#C6FF00]/40 transition-all">
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden h-72 sm:h-80">
              <img 
                src="/images/runway-1.jpg" 
                alt="Fashion Shows & Runway Lighting" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-[#C6FF00] font-mono text-xs font-bold">
                01 / FASHION SHOWS
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Full-Scale Runway Productions
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                We produce high-impact fashion show productions featuring architectural lighting, dynamic sound design, precision catwalk choreography and professional media coverage across top city centers.
              </p>
              <button
                onClick={() => setActiveTab('what-we-do')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#789900] dark:text-[#C6FF00] hover:underline"
              >
                <span>Learn more about productions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Model Opportunities (Reversed Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] hover:border-[#C6FF00]/40 transition-all">
            <div className="lg:col-span-6 lg:order-2 relative rounded-2xl overflow-hidden h-72 sm:h-80">
              <img 
                src="/images/runway-3.jpg" 
                alt="Model Opportunities" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-[#C6FF00] font-mono text-xs font-bold">
                02 / OPPORTUNITIES
              </div>
            </div>
            <div className="lg:col-span-6 lg:order-1 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Curated Platforms for Emerging Models
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Every contestant receives verified credentials, stage photographs and transparent evaluation. We champion diversity with dedicated categories for Kids, Teens, Adults, Plus-size, and Fitness contestants.
              </p>
              <button
                onClick={() => setActiveTab('what-we-do')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#789900] dark:text-[#C6FF00] hover:underline"
              >
                <span>Explore model benefits</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 3: Stage Grooming */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] hover:border-[#C6FF00]/40 transition-all">
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden h-72 sm:h-80">
              <img 
                src="/founder.png" 
                alt="Stage Grooming & Mentorship" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 text-[#C6FF00] font-mono text-xs font-bold">
                03 / GROOMING
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                Posture, Walk &amp; Ramp Rehearsal
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Pre-show rehearsal sessions guide models through catwalk pacing, poise, expression and confident posture under genuine stage spotlights, led directly by verified industry choreographers.
              </p>
              <button
                onClick={() => setActiveTab('what-we-do')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#789900] dark:text-[#C6FF00] hover:underline"
              >
                <span>Read grooming curriculum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4: UPCOMING EVENTS (EDITORIAL DISCOVERY)
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#789900] dark:text-[#C6FF00] uppercase tracking-widest">Event Discovery</span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
            THE NEXT MOMENT STARTS HERE.
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Official runway show schedules and audition registrations.
          </p>
        </div>

        {/* Featured Event Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#111111] text-white border border-[#303030] relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-pulse" />
                <span>Registrations Open</span>
              </div>

              <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
                SKYRA CREATIONS — RUNWAY SHOW 2026
              </h3>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
                Step into the spotlight at our premier runway event in Chennai. Featuring full-stage catwalk choreography, industry judges and official certificate recognition.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[11px]">Venue</span>
                  <strong className="text-white">Chennai City Center</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[11px]">Total Event Fee</span>
                  <strong className="text-[#C6FF00] text-sm">₹3,000</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-zinc-400 block text-[11px]">Token Advance</span>
                  <strong className="text-white">₹500 / ₹1,000 / ₹1,500</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-7 py-3.5 rounded-xl bg-[#C6FF00] text-black font-extrabold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 shadow-lg shadow-[#C6FF00]/20"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Register Now for ₹3,000</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent('EVT-CHX-2026');
                    setActiveTab('event-details');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4 text-zinc-300" />
                  <span>View Event Details</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl">
                <img 
                  src="/images/runway-3.jpg" 
                  alt="Runway Show 2026 Live Catwalk" 
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5: FASHION CAMPAIGN (FULL-WIDTH EDITORIAL)
      ────────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-cover bg-center rounded-3xl mx-4 sm:mx-8 border border-zinc-200 dark:border-zinc-800" style={{ backgroundImage: `url('/images/runway-1.jpg')` }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-bold tracking-widest text-[#C6FF00] uppercase">
            Fashion Campaign
          </span>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            OWN YOUR PRESENCE.
          </h2>
          <p className="text-base sm:text-xl text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
            Every runway begins with the confidence to take the first step.
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setActiveTab('register')}
              className="px-8 py-4 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#C6FF00] hover:text-black transition-all flex items-center space-x-2"
            >
              <span>DISCOVER YOUR OPPORTUNITY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 6: GALLERY PREVIEW (EDITORIAL IMAGE GRID)
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#789900] dark:text-[#C6FF00] uppercase tracking-widest block">Visual Archive</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-1">
              Catwalk Moments &amp; Highlights
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('gallery')}
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-[#C6FF00] hover:underline flex items-center space-x-1"
          >
            <span>VIEW FULL GALLERY</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Varied Proportions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-7 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg group">
            <img 
              src="/images/runway-2.jpg" 
              alt="Runway Stage Catwalk" 
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="md:col-span-5 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg group">
            <img 
              src="/founder.png" 
              alt="Founder & CEO B Sriram" 
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 7: FINAL CALL TO ACTION (POWERFUL CLOSING)
      ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-16 rounded-3xl bg-[#080808] border border-[#303030] text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#C6FF00]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-editorial text-4xl sm:text-6xl font-bold text-white tracking-tight relative z-10">
            YOUR MOMENT. YOUR RUNWAY.
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-300 font-light relative z-10 leading-relaxed">
            Step onto the catwalk with confidence. Secure your registration for the upcoming Chennai Runway Show 2026.
          </p>

          <div className="pt-4 flex justify-center relative z-10">
            <button
              onClick={() => setActiveTab('register')}
              className="px-10 py-4 rounded-xl bg-[#C6FF00] hover:bg-[#b0e600] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[#C6FF00]/25 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Sparkle className="w-4 h-4 text-black" />
              <span>REGISTER NOW</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
