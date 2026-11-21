import React from 'react';
import { 
  Sparkles, 
  Users, 
  Target, 
  HeartHandshake, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20 animate-fadeIn">
      {/* ──────────────────────────────────────────────────────────
          1. LARGE EDITORIAL HERO
      ────────────────────────────────────────────────────────── */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <span className="px-3.5 py-1 rounded-full bg-[#C6FF00]/10 text-[#789900] dark:text-[#C6FF00] border border-[#C6FF00]/30 text-xs font-bold uppercase tracking-widest inline-block">
          About SKYRA CREATIONS
        </span>
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold text-zinc-900 dark:text-white leading-[1.08]">
          THE STORY BEHIND THE SPOTLIGHT.
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed">
          SKYRA CREATIONS is an international-standard fashion event and modelling platform designed to discover, groom and showcase genuine runway talent.
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. BRAND INTRODUCTION & LEADERSHIP SPOTLIGHT
      ────────────────────────────────────────────────────────── */}
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#C6FF00]/40 shadow-2xl max-w-xs group">
              <img 
                src="/founder.png" 
                alt="B Sriram — Founder & CEO, SKYRA CREATIONS" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-[11px] uppercase font-bold text-[#C6FF00] block tracking-wider">Founder &amp; CEO</span>
                  <span className="font-editorial text-xl font-bold">B Sriram</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-5">
            <span className="text-xs font-bold text-[#789900] dark:text-[#C6FF00] uppercase tracking-widest">Founder &amp; Visionary</span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white leading-snug">
              “Every Aspiring Model Deserves a Real Stage to Shine.”
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
              Founded by <strong>B Sriram</strong>, SKYRA CREATIONS was established to challenge the traditional barriers of the fashion industry. For years, aspiring models across South India have faced opaque selection processes, unrealistic height standards and lack of authentic stage grooming.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              SKYRA CREATIONS replaces industry gatekeeping with transparent event production, curated city center venues, professional lighting choreography, and verified participant credentials.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <a 
                href="https://www.instagram.com/skyra_creations_/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30 text-xs font-semibold transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow @skyra_creations_</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. VISION AND MISSION (SOPHISTICATED TWO-COLUMN)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C6FF00]/10 text-[#789900] dark:text-[#C6FF00] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-editorial">Our Vision</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            To build a celebrated, trustworthy runway platform across India that discovers and nurtures emerging talent, fosters body positivity, and connects aspiring models with verified designers, photographers and creative directors.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-zinc-100 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#C6FF00]/10 text-[#789900] dark:text-[#C6FF00] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-editorial">Our Mission</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            To deliver transparent, impeccably organized runway events where every participant receives personalized stage grooming, authentic catwalk exposure, and steps onto the stage with confidence, elegance and pride.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. BRAND PHILOSOPHY & EDITORIAL PHOTOGRAPH
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-bold text-[#789900] dark:text-[#C6FF00] uppercase tracking-widest">Brand Philosophy</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
            Confidence Is Built On Stage, Not In A Spreadsheet.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            We believe that true runway elegance stems from self-assurance, rhythm and presence. Regardless of whether an aspirant is walking their first catwalk at age 6 or debuting at age 45, our mentorship equips them with posture control, stage presence and genuine poise.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-[#789900] dark:text-[#C6FF00] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Strict adherence to safe, professional event environments for all participants.</p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-[#789900] dark:text-[#C6FF00] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Zero artificial height restrictions or unrealistic body prerequisites.</p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-[#789900] dark:text-[#C6FF00] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Direct access to official high-resolution media photography from every showcase.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <img 
            src="/images/runway-2.jpg" 
            alt="SKYRA Fashion Editorial Ramp Walk" 
            className="w-full h-96 object-cover"
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          5. WHAT MAKES SKYRA CREATIONS DISTINCTIVE
      ────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#789900] dark:text-[#C6FF00] uppercase tracking-widest">Distinctive Quality</span>
          <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            What Sets SKYRA Apart
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] space-y-2">
            <span className="text-[#789900] dark:text-[#C6FF00] font-mono text-xs font-bold">01</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base">City Center Venues</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We exclusively select accessible, premium city centers in Chennai with verified stage facilities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] space-y-2">
            <span className="text-[#789900] dark:text-[#C6FF00] font-mono text-xs font-bold">02</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base">Certified Recognition</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Official printed and verified digital certificates acknowledging each participant's runway credentials.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] space-y-2">
            <span className="text-[#789900] dark:text-[#C6FF00] font-mono text-xs font-bold">03</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base">Hands-on Grooming</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pre-show choreography walk-throughs and stage rehearsal support tailored to every category.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-zinc-200 dark:border-[#202020] space-y-2">
            <span className="text-[#789900] dark:text-[#C6FF00] font-mono text-xs font-bold">04</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base">Media Deliverables</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              High-resolution stage photography provided directly to contestants to build their professional portfolios.
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          6. FINAL REGISTRATION CALL TO ACTION
      ────────────────────────────────────────────────────────── */}
      <div className="p-10 sm:p-14 rounded-3xl bg-[#080808] border border-[#303030] text-center space-y-5 text-white">
        <h3 className="font-editorial text-3xl sm:text-4xl font-bold">
          Ready to Take Your First Step on the Runway?
        </h3>
        <p className="text-sm text-zinc-300 max-w-xl mx-auto font-light leading-relaxed">
          Explore upcoming fashion shows, inspect event dates and submit your model audition entry today.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setActiveTab('events')}
            className="px-8 py-4 rounded-xl bg-[#C6FF00] hover:bg-[#b0e600] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-2"
          >
            <span>EXPLORE UPCOMING EVENTS</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
