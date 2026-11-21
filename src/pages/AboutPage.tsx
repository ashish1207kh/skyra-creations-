import React from 'react';
import { 
  Sparkles, 
  Users, 
  Target, 
  HeartHandshake, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest inline-block">
          About SKYRA CREATIONS
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
          Redefining Runway Fashion &amp; Opportunity
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
          SKYRA CREATIONS is a fashion and creative event platform focused on bringing people together through runway experiences, modelling opportunities, fashion showcases and creative collaborations.
        </p>
      </div>

      {/* Founder & Leadership Spotlight */}
      <div className="p-8 sm:p-10 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl max-w-xs group">
              <img 
                src="/founder.png" 
                alt="B Sriram — Founder & CEO, SKYRA CREATIONS" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <span className="text-xs uppercase font-bold text-amber-400 block tracking-wider">Founder &amp; CEO</span>
                  <span className="font-editorial text-lg font-bold">B Sriram</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Leadership Note</span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              “Every Aspiring Model Deserves a Real Stage to Shine”
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Founded by <strong>B Sriram</strong>, SKYRA CREATIONS was established to break through the traditional barriers of the fashion industry. Many talented individuals—whether young kids, confident plus-size models, or fitness enthusiasts—dream of walking a real ramp but struggle to find genuine, transparent platforms.
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Our mission is to organize professional, well-choreographed fashion showcases in premier urban venues where contestants receive fair evaluations, genuine grooming, and authentic catwalk experiences.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <a 
                href="https://www.instagram.com/skyra_creations_/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30 text-xs font-semibold transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow @skyra_creations_</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-editorial">Our Vision</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            To build a celebrated, trustworthy runway platform in South India that discovers and nurtures emerging talent, promotes body positivity, and bridges the gap between models, designers and the broader creative arts.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#16a34a]/10 dark:bg-[#d4ff14]/10 text-[#16a34a] dark:text-[#d4ff14] flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-editorial">Our Mission</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            To deliver transparent, impeccably organized runway events where every participant is valued, receives personalized stage grooming, and steps onto the catwalk with poise, dignity and confidence.
          </p>
        </div>
      </div>

      {/* Inclusive Categories Showcase */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Inclusivity in Action</span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Open Categories For Every Aspirant
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            We celebrate fashion across all generations and physiques.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0a0c12] border border-zinc-200 dark:border-zinc-800">
            <span className="text-amber-500 font-bold text-xs uppercase block">Category 01</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base mt-1">Kids &amp; Teens Runway</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Ages 4 to 17. Safe, supportive stage grooming for young aspiring models to build poise and confidence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0a0c12] border border-zinc-200 dark:border-zinc-800">
            <span className="text-amber-500 font-bold text-xs uppercase block">Category 02</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base mt-1">Adult Commercial Runway</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Ages 18 to 35. High-fashion couture and commercial ramp presentation for men and women.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0a0c12] border border-zinc-200 dark:border-zinc-800">
            <span className="text-amber-500 font-bold text-xs uppercase block">Category 03</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base mt-1">Plus-Size Confidence</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Celebrating body diversity, elegance, and empowering runway representation for curvy models.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0a0c12] border border-zinc-200 dark:border-zinc-800">
            <span className="text-amber-500 font-bold text-xs uppercase block">Category 04</span>
            <h4 className="font-bold text-zinc-900 dark:text-white text-base mt-1">Fitness &amp; Classic</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Athletic physiques, activewear styling, and classic category for contestants up to age 50.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#d4ff14]/10 to-amber-500/10 border border-amber-500/30 text-center space-y-4">
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
          Ready to Walk the Ramp?
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
          Explore our upcoming Runway Show 2026 in Chennai and submit your participant audition details.
        </p>
        <button
          onClick={() => setActiveTab('events')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center space-x-2"
        >
          <span>View Upcoming Events</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
