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
  Layers
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import VirtualRunwayScene from '../components/VirtualRunwayScene';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export default function HomePage({ setActiveTab, onSelectEvent }: HomePageProps) {
  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* 1. HERO SECTION — High Fashion Editorial & 3D Virtual Runway Experience */}
      <section className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden pt-8 pb-16">
        {/* Three.js Virtual Runway Catwalk */}
        <div className="absolute inset-0 z-0">
          <VirtualRunwayScene className="w-full h-full" />
        </div>

        {/* Ambient Overlay for Cinematic Fashion Depth & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/95 pointer-events-none z-10" />

        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-amber-500/15 via-[#d4ff14]/15 to-transparent blur-3xl pointer-events-none z-10" />

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Subtle Label */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#d4ff14]/30 text-xs sm:text-sm font-medium text-[#d4ff14] tracking-wider uppercase animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-[#d4ff14] animate-ping" />
            <span>Official Fashion, Modelling &amp; Runway Experience</span>
          </div>

          {/* Hero Headline */}
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05] max-w-4xl mx-auto">
            BEYOND THE <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-[#d4ff14] bg-clip-text text-transparent">
              RUNWAY.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-300 font-light leading-relaxed">
            An expression of fashion, confidence and creative individuality.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('events')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#d4ff14] text-black font-bold text-sm tracking-wide uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm tracking-wide transition-all flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Discover SKYRA CREATIONS</span>
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-white font-editorial">Chennai</div>
              <div className="text-xs text-zinc-400 mt-0.5">Premier City Center Venue</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-[#d4ff14] font-editorial">Kids to Adults</div>
              <div className="text-xs text-zinc-400 mt-0.5">Ages 4 to 50 Inclusive</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-amber-300 font-editorial">Live Runway</div>
              <div className="text-xs text-zinc-400 mt-0.5">Stage Grooming &amp; Choreography</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-bold text-white font-editorial">Verified</div>
              <div className="text-xs text-zinc-400 mt-0.5">Professional Event Management</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SKYRA CREATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider">
              <span>About The Brand</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
              A Platform Designed for Every Aspiring Runway Talent
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              SKYRA CREATIONS is a fashion and creative event platform focused on bringing people together through runway experiences, modelling opportunities, fashion showcases and creative collaborations.
            </p>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Founded by <strong>B Sriram</strong>, SKYRA CREATIONS provides an accessible, authentic stage where emerging models gain real catwalk exposure, stage presence, professional grooming and industry networking without the gatekeeping of traditional agencies.
            </p>

            {/* Inclusivity Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800">
                <Users className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">All Categories Welcome</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Dedicated categories for Kids, Teens, Adults, Plus-Size, and Fitness models.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800">
                <Award className="w-5 h-5 text-[#16a34a] dark:text-[#d4ff14] mb-2" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Professional Grooming</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Pre-event rehearsal sessions, posture training, and stage choreography support.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('about')}
                className="inline-flex items-center space-x-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
              >
                <span>Read more about our vision and founder</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image Layout */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl group">
              <img 
                src="/images/runway-2.jpg" 
                alt="SKYRA CREATIONS Runway Fashion Model" 
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold block">Live Catwalk</span>
                  <span className="text-white font-editorial text-lg font-bold">Empowering Runway Models</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO — 6 Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Our Activities</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            What We Do at SKYRA CREATIONS
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            A complete ecosystem connecting models, designers, choreographers and fashion enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Fashion Shows</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Full-scale runway events with professional lighting, sound design, catwalk choreography, and audience presentations in top city venues.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#16a34a]/10 dark:bg-[#d4ff14]/10 text-[#16a34a] dark:text-[#d4ff14] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Runway Experiences</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Hands-on catwalk opportunities where contestants experience authentic ramp walking in front of fashion judges, photographers and live spectators.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Model Opportunities</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Curated platforms for aspiring models to build verified performance credentials, earn certificates, and gain exposure to talent managers.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Designer Showcases</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Bringing clothing designers and garment creators together with curated runway models to bring creative collections to life on the ramp.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Grooming &amp; Stage Prep</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Structured posture workshops, dress code guidance, rehearsal walk-throughs, and confidence coaching tailored for beginner and experienced models.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Creative Collaborations</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Fostering artistic partnerships between makeup artists, hair stylists, fashion photographers and creative directors across South India.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('what-we-do')}
            className="px-6 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white transition-colors"
          >
            Explore Detailed Work &amp; Services →
          </button>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-[#12151e] to-black border border-amber-500/30 text-white relative overflow-hidden shadow-2xl">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Registrations Open</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                SKYRA CREATIONS — RUNWAY SHOW 2026
              </h2>

              <p className="text-zinc-300 text-sm leading-relaxed">
                Step into the spotlight at our premier runway event in Chennai. Open for all categories including Kids, Teens, Adults, Plus-size and Fitness contestants.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                  <span className="text-zinc-500 block">Location</span>
                  <strong className="text-white">Chennai City Center</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                  <span className="text-zinc-500 block">Total Event Fee</span>
                  <strong className="text-amber-400 text-sm">₹3,000</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-zinc-500 block">Token Advance</span>
                  <strong className="text-[#d4ff14]">₹500 / ₹1,000 / ₹1,500</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Register Now for ₹3,000</span>
                </button>

                <button
                  onClick={() => {
                    if (onSelectEvent) onSelectEvent('EVT-CHX-2026');
                    setActiveTab('event-details');
                  }}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all flex items-center space-x-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Complete Details</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-xl">
                <img 
                  src="/images/runway-3.jpg" 
                  alt="Runway Show 2026 Cover" 
                  className="w-full h-72 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY PARTICIPATE? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Model Experience</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            Why Walk with SKYRA CREATIONS?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Real catwalk benefits and transparent participation policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Authentic Stage Exposure</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Contestants experience a full-length runway ramp with professional audience, stage lighting and photography.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Certificate of Participation</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              All verified participants receive an official digital and printed certificate recognizing their runway participation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Professional Portfolio Assets</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              High-resolution stage photographs from official event media teams to kickstart your personal modelling portfolio.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Inclusive Diversity</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No unrealistic body standards. We champion diversity across all shapes, heights, age groups and backgrounds.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
          Your Moment. Your Runway. Your Opportunity.
        </h2>
        <p className="max-w-xl mx-auto text-sm text-zinc-600 dark:text-zinc-400">
          Whether it is your very first catwalk or your next career milestone, SKYRA CREATIONS provides the stage, training and audience you need.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setActiveTab('events')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#d4ff14] text-black font-bold text-sm uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
          >
            <span>Explore Upcoming Events</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </section>
    </div>
  );
}
