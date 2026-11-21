import React from 'react';
import { 
  Sparkles, 
  Target, 
  ArrowRight,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import InstagramIcon from '../components/InstagramIcon';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export default function AboutPage({ setActiveTab }: AboutPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* ──────────────────────────────────────────────────────────
          1. LARGE EDITORIAL HERO
      ────────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-4xl mx-auto space-y-4"
      >
        <span className="font-mono-editorial block text-[11px] tracking-widest" style={{ color: 'var(--accent)' }}>
          ABOUT SKYRA CREATIONS
        </span>
        <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
          THE STORY BEHIND THE SPOTLIGHT.
        </h1>
        <p className="text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          SKYRA CREATIONS is an international-standard fashion event and modelling platform designed to discover, groom and showcase genuine runway talent.
        </p>
      </motion.div>

      {/* ──────────────────────────────────────────────────────────
          2. BRAND INTRODUCTION & LEADERSHIP SPOTLIGHT
      ────────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="p-8 sm:p-12 rounded-sm shadow-xl"
        style={{ 
          backgroundColor: 'var(--surface)', 
          border: '1px solid var(--border)' 
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5 flex justify-center">
            <TiltCard className="max-w-xs rounded-sm overflow-hidden shadow-2xl">
              <div 
                className="relative overflow-hidden group rounded-sm"
                style={{ border: '1px solid var(--border)' }}
              >
                <img 
                  src="/founder.png" 
                  alt="B Sriram — Founder & CEO, SKYRA CREATIONS" 
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div 
                  className="absolute inset-0 flex items-end p-4"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }}
                >
                  <div className="text-white">
                    <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--accent)' }}>FOUNDER &amp; CEO</span>
                    <span className="font-editorial text-xl font-bold text-white">B Sriram</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

          <div className="md:col-span-7 space-y-5">
            <span className="font-mono-editorial block text-[11px]" style={{ color: 'var(--accent)' }}>
              LEADERSHIP PHILOSOPHY
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              “Every Aspiring Model Deserves a Real Stage to Shine.”
            </h2>
            <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
              Founded by <strong>B Sriram</strong>, SKYRA CREATIONS was established to challenge the traditional barriers of the fashion industry. For years, aspiring models across South India have faced opaque selection processes, unrealistic height standards and lack of authentic stage grooming.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              SKYRA CREATIONS replaces industry gatekeeping with transparent event production, curated city center venues, professional lighting choreography, and verified participant credentials.
            </p>

            <div className="pt-2 flex items-center space-x-4">
              <a 
                href="https://www.instagram.com/skyra_creations_/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-sm text-xs font-semibold transition-all group"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                <span className="font-mono-editorial text-[10px]">FOLLOW @SKYRA_CREATIONS_</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ──────────────────────────────────────────────────────────
          3. VISION AND MISSION (SOPHISTICATED TWO-COLUMN)
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-8 sm:p-10 rounded-sm space-y-4"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div 
            className="w-10 h-10 rounded-sm flex items-center justify-center font-mono-editorial text-xs font-bold"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            01
          </div>
          <h3 className="text-2xl font-bold font-editorial" style={{ color: 'var(--text-primary)' }}>Our Vision</h3>
          <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
            To build a celebrated, trustworthy runway platform across India that discovers and nurtures emerging talent, fosters body positivity, and connects aspiring models with verified designers, photographers and creative directors.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-8 sm:p-10 rounded-sm space-y-4"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div 
            className="w-10 h-10 rounded-sm flex items-center justify-center font-mono-editorial text-xs font-bold"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            02
          </div>
          <h3 className="text-2xl font-bold font-editorial" style={{ color: 'var(--text-primary)' }}>Our Mission</h3>
          <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
            To deliver transparent, impeccably organized runway events where every participant receives personalized stage grooming, authentic catwalk exposure, and steps onto the stage with confidence, elegance and pride.
          </p>
        </motion.div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. BRAND PHILOSOPHY & EDITORIAL PHOTOGRAPH
      ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 space-y-5"
        >
          <span className="font-mono-editorial block text-[11px]" style={{ color: 'var(--accent)' }}>
            BRAND PHILOSOPHY
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            Confidence Is Built On Stage, Not In A Spreadsheet.
          </h2>
          <p className="text-sm sm:text-base leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
            We believe that true runway elegance stems from self-assurance, rhythm and presence. Regardless of whether an aspirant is walking their first catwalk at age 6 or debuting at age 45, our mentorship equips them with posture control, stage presence and genuine poise.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--accent)' }} />
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                Strict adherence to safe, professional event environments for all participants.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--accent)' }} />
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                Zero artificial height restrictions or unrealistic body prerequisites.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--accent)' }} />
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                Direct access to official high-resolution media photography from every showcase.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-5 overflow-hidden shadow-xl rounded-sm"
          style={{ border: '1px solid var(--border)' }}
        >
          <img 
            src="/images/runway-2.jpg" 
            alt="SKYRA Fashion Editorial Ramp Walk" 
            loading="lazy"
            className="w-full h-96 object-cover"
          />
        </motion.div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          5. WHAT MAKES SKYRA CREATIONS DISTINCTIVE
      ────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="font-mono-editorial block text-[11px]" style={{ color: 'var(--accent)' }}>
            DISTINCTIVE QUALITY
          </span>
          <h3 className="font-editorial text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            What Sets SKYRA Apart
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-sm space-y-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="font-mono-editorial text-xs font-bold" style={{ color: 'var(--accent)' }}>01</span>
            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>City Center Venues</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We exclusively select accessible, premium city centers in Chennai with verified stage facilities.
            </p>
          </div>

          <div className="p-6 rounded-sm space-y-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="font-mono-editorial text-xs font-bold" style={{ color: 'var(--accent)' }}>02</span>
            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Certified Recognition</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Official printed and verified digital certificates acknowledging each participant's runway credentials.
            </p>
          </div>

          <div className="p-6 rounded-sm space-y-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="font-mono-editorial text-xs font-bold" style={{ color: 'var(--accent)' }}>03</span>
            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Hands-on Grooming</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Pre-show choreography walk-throughs and stage rehearsal support tailored to every category.
            </p>
          </div>

          <div className="p-6 rounded-sm space-y-2" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span className="font-mono-editorial text-xs font-bold" style={{ color: 'var(--accent)' }}>04</span>
            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Media Deliverables</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              High-resolution stage photography provided directly to contestants to build their professional portfolios.
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          6. FINAL REGISTRATION CALL TO ACTION
      ────────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="p-10 sm:p-14 text-center space-y-5 rounded-sm shadow-xl"
        style={{ 
          backgroundColor: 'var(--surface)', 
          border: '1px solid var(--border)' 
        }}
      >
        <h3 className="font-editorial text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Ready to Take Your First Step on the Runway?
        </h3>
        <p className="text-sm max-w-xl mx-auto font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Explore upcoming fashion shows, inspect event dates and submit your model audition entry today.
        </p>
        <div className="pt-2 flex justify-center">
          <MagneticButton
            onClick={() => setActiveTab('events')}
            className="px-8 py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center space-x-2"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000000'
            }}
          >
            <span>EXPLORE UPCOMING EVENTS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>
      </motion.div>
    </div>
  );
}
